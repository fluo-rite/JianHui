import type { UploadType } from "@lowcode/share";
import request from "~/utils/request";

export interface DirectUploadInitPayload {
  filename: string;
  size: number;
  type: UploadType;
  contentType: string;
}

export type MultipartUploadInitPayload = DirectUploadInitPayload;

export interface CompleteDirectUploadPayload {
  mode: "direct";
  objectKey: string;
  filename: string;
  type: UploadType;
}

export interface CompleteMultipartUploadPayload {
  mode: "multipart";
  objectKey: string;
  uploadId: string;
  filename: string;
  type: UploadType;
  parts: Array<{
    partNumber: number;
    etag: string;
  }>;
}

export async function initDirectUpload(data: DirectUploadInitPayload) {
  return request("/resources/uploads/direct/init", {
    data,
    method: "POST",
  });
}

export async function initMultipartUpload(data: MultipartUploadInitPayload) {
  return request("/resources/uploads/multipart/init", {
    data,
    method: "POST",
  });
}

export async function getMultipartPartUploadUrl(data: {
  objectKey: string;
  uploadId: string;
  partNumber: number;
}) {
  return request("/resources/uploads/multipart/part-url", {
    data,
    method: "POST",
  });
}

export async function completeUpload(
  data: CompleteDirectUploadPayload | CompleteMultipartUploadPayload
) {
  return request("/resources/uploads/complete", {
    data,
    method: "POST",
  });
}

export async function abortMultipartUpload(data: {
  objectKey: string;
  uploadId: string;
}) {
  return request("/resources/uploads/abort", {
    data,
    method: "POST",
  });
}

export async function getResources(type: UploadType) {
  return request("/resources", {
    params: { type },
    method: "GET",
  });
}

export async function deleteResource(id: number) {
  return request("/resources", {
    params: { id },
    method: "DELETE",
  });
}
