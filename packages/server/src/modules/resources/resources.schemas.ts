import type { UploadType } from '@lowcode/share';
import {
  HttpError,
  ensureNumber,
  ensureObject,
  ensureString,
} from '../../utils/http';

const uploadModes = ['direct', 'multipart'] as const;

type UploadMode = (typeof uploadModes)[number];
type ParsedCompleteUploadBody =
  | {
      mode: 'direct';
      objectKey: string;
      filename: string;
      type: UploadType;
    }
  | {
      mode: 'multipart';
      objectKey: string;
      uploadId: string;
      filename: string;
      type: UploadType;
      parts: Array<{
        partNumber: number;
        etag: string;
      }>;
    };

function ensurePositiveNumber(value: unknown, message: string) {
  const parsed = ensureNumber(value, message);
  if (parsed <= 0) {
    throw new HttpError(400, message);
  }
  return parsed;
}

function ensurePositiveInteger(value: unknown, message: string) {
  const parsed = ensurePositiveNumber(value, message);
  if (!Number.isInteger(parsed)) {
    throw new HttpError(400, message);
  }
  return parsed;
}

function ensureOptionalString(value: unknown) {
  if (value == null || value === '') {
    return '';
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, '请求参数错误');
  }

  return value.trim();
}

function parseUploadMode(value: unknown): UploadMode {
  const mode = ensureString(value, '上传模式不能为空');
  if (!uploadModes.includes(mode as UploadMode)) {
    throw new HttpError(400, '上传模式错误');
  }
  return mode as UploadMode;
}

export function parseResourcesType(source: unknown): UploadType {
  const type = ensureString(source, '资源类型不能为空');
  if (!['image', 'video'].includes(type)) {
    throw new HttpError(400, '资源类型错误');
  }
  return type as UploadType;
}

export function parseResourcesQuery(query: unknown) {
  const values = ensureObject(query, '请求参数错误');
  return {
    type: parseResourcesType(values.type),
  };
}

export function parseDeleteResourceQuery(query: unknown) {
  const values = ensureObject(query, '请求参数错误');
  return {
    id: ensureNumber(values.id, '资源 id 错误'),
  };
}

export function parseDirectUploadInitBody(body: unknown) {
  const values = ensureObject(body, '请求参数错误');
  return {
    filename: ensureString(values.filename, '文件名不能为空'),
    size: ensurePositiveNumber(values.size, '文件大小错误'),
    type: parseResourcesType(values.type),
    contentType: ensureOptionalString(values.contentType),
  };
}

export function parseMultipartUploadInitBody(body: unknown) {
  const values = ensureObject(body, '请求参数错误');
  return {
    filename: ensureString(values.filename, '文件名不能为空'),
    size: ensurePositiveNumber(values.size, '文件大小错误'),
    type: parseResourcesType(values.type),
    contentType: ensureOptionalString(values.contentType),
  };
}

export function parseMultipartPartUrlBody(body: unknown) {
  const values = ensureObject(body, '请求参数错误');
  return {
    objectKey: ensureString(values.objectKey, 'objectKey 不能为空'),
    uploadId: ensureString(values.uploadId, 'uploadId 不能为空'),
    partNumber: ensurePositiveInteger(values.partNumber, '分片序号错误'),
  };
}

export function parseCompleteUploadBody(
  body: unknown,
): ParsedCompleteUploadBody {
  const values = ensureObject(body, '请求参数错误');
  const mode = parseUploadMode(values.mode);

  const base = {
    objectKey: ensureString(values.objectKey, 'objectKey 不能为空'),
    filename: ensureString(values.filename, '文件名不能为空'),
    type: parseResourcesType(values.type),
  } as const;

  if (mode === 'direct') {
    return {
      mode: 'direct',
      ...base,
    };
  }

  const uploadId = ensureString(values.uploadId, 'uploadId 不能为空');
  const partsSource = values.parts;
  if (!Array.isArray(partsSource) || partsSource.length <= 0) {
    throw new HttpError(400, '分片信息不能为空');
  }

  return {
    mode: 'multipart',
    ...base,
    uploadId,
    parts: partsSource.map((item, index) => {
      const part = ensureObject(item, `第 ${index + 1} 个分片参数错误`);
      return {
        partNumber: ensurePositiveInteger(part.partNumber, '分片序号错误'),
        etag: ensureString(part.etag, '分片 ETag 不能为空'),
      };
    }),
  };
}

export function parseAbortUploadBody(body: unknown) {
  const values = ensureObject(body, '请求参数错误');
  return {
    objectKey: ensureString(values.objectKey, 'objectKey 不能为空'),
    uploadId: ensureString(values.uploadId, 'uploadId 不能为空'),
  };
}
