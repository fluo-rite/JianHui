import type { UploadType } from "@lowcode/share";
import {
  abortMultipartUpload,
  completeUpload,
  getMultipartPartUploadUrl,
  initDirectUpload,
  initMultipartUpload,
} from "~/api/resource";

const UPLOAD_MODE_THRESHOLD = 20 * 1024 * 1024;
const MULTIPART_CONCURRENCY = 4;
const MULTIPART_PART_MAX_RETRIES = 3;
const MULTIPART_PART_RETRY_DELAY_MS = 2000;

interface UploadResourceOptions {
  onProgress?: (percent: number | null) => void;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function parseOssErrorMessage(errorBody: string, fallback: string) {
  const codeMatch = errorBody.match(/<Code>([^<]+)<\/Code>/i);
  const messageMatch = errorBody.match(/<Message>([^<]+)<\/Message>/i);

  if (!codeMatch && !messageMatch) {
    return fallback;
  }

  const code = codeMatch?.[1]?.trim();
  const message = messageMatch?.[1]?.trim();

  if (code && message) {
    return `${fallback}（${code}: ${message}）`;
  }

  return `${fallback}（${code || message}）`;
}

async function putFileToSignedUrl(
  url: string,
  blob: Blob,
  contentType?: string
) {
  const response = await fetch(url, {
    method: "PUT",
    headers: contentType
      ? {
          "Content-Type": contentType,
        }
      : undefined,
    body: blob,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    const fallback = `上传失败，状态码：${response.status}`;
    throw new Error(parseOssErrorMessage(errorBody, fallback));
  }

  return response.headers.get("ETag");
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
) {
  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < tasks.length) {
      const index = currentIndex++;
      results[index] = await tasks[index]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => worker())
  );

  return results;
}

async function uploadVideoPartWithRetry(input: {
  objectKey: string;
  uploadId: string;
  partNumber: number;
  blob: Blob;
}) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MULTIPART_PART_MAX_RETRIES; attempt++) {
    try {
      const partUrlResponse = await getMultipartPartUploadUrl({
        objectKey: input.objectKey,
        uploadId: input.uploadId,
        partNumber: input.partNumber,
      });
      const etag = await putFileToSignedUrl(
        partUrlResponse.data.uploadUrl,
        input.blob
      );

      if (!etag) {
        throw new Error(`第 ${input.partNumber} 个分片没有返回 ETag`);
      }

      return {
        partNumber: input.partNumber,
        etag,
      };
    } catch (error) {
      lastError = error;

      if (attempt < MULTIPART_PART_MAX_RETRIES) {
        await sleep(MULTIPART_PART_RETRY_DELAY_MS * attempt);
      }
    }
  }

  const reason = lastError instanceof Error ? lastError.message : "未知错误";
  throw new Error(
    `第 ${input.partNumber} 个分片重试 ${MULTIPART_PART_MAX_RETRIES} 次后仍上传失败：${reason}`
  );
}

async function uploadDirectResource(
  file: File,
  type: UploadType,
  options?: UploadResourceOptions
) {
  const initResponse = await initDirectUpload({
    filename: file.name,
    size: file.size,
    type,
    contentType: file.type,
  });

  options?.onProgress?.(null);
  await putFileToSignedUrl(
    initResponse.data.uploadUrl,
    file,
    initResponse.data.contentType
  );
  await completeUpload({
    mode: "direct",
    objectKey: initResponse.data.objectKey,
    filename: file.name,
    type,
  });
  options?.onProgress?.(100);
}

async function uploadMultipartResource(
  file: File,
  type: UploadType,
  options?: UploadResourceOptions
) {
  const initResponse = await initMultipartUpload({
    filename: file.name,
    size: file.size,
    type,
    contentType: file.type,
  });
  const initData = initResponse.data;
  let uploadedBytes = 0;

  try {
    const tasks = Array.from({ length: initData.totalParts }, (_, index) => {
      return async () => {
        const partNumber = index + 1;
        const start = index * initData.partSize;
        const end = Math.min(start + initData.partSize, file.size);
        const blob = file.slice(start, end);
        const result = await uploadVideoPartWithRetry({
          objectKey: initData.objectKey,
          uploadId: initData.uploadId,
          partNumber,
          blob,
        });

        uploadedBytes += blob.size;
        options?.onProgress?.(
          Math.min(99, Math.floor((uploadedBytes / file.size) * 100))
        );

        return result;
      };
    });

    const parts = await runWithConcurrency(tasks, MULTIPART_CONCURRENCY);
    await completeUpload({
      mode: "multipart",
      objectKey: initData.objectKey,
      uploadId: initData.uploadId,
      filename: file.name,
      type,
      parts,
    });
    options?.onProgress?.(100);
  } catch (error) {
    await abortMultipartUpload({
      objectKey: initData.objectKey,
      uploadId: initData.uploadId,
    }).catch(() => undefined);
    throw error;
  }
}

export async function uploadResource(
  file: File,
  type: UploadType,
  options?: UploadResourceOptions
) {
  if (file.size <= UPLOAD_MODE_THRESHOLD) {
    return uploadDirectResource(file, type, options);
  }

  return uploadMultipartResource(file, type, options);
}
