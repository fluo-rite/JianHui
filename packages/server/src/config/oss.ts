import { extname } from 'node:path';
import AliOss = require('ali-oss');
import type { Options as AliOssOptions } from 'ali-oss';
import { env } from './env';
import { HttpError } from '../utils/http';

const DIRECT_UPLOAD_EXPIRES_IN_SECONDS = 60 * 10;
const MULTIPART_PART_UPLOAD_EXPIRES_IN_SECONDS = 60 * 60;

const aliOssOptions: AliOssOptions = {
  region: env.aliOssRegion,
  accessKeyId: env.aliOssAccessKeyId,
  accessKeySecret: env.aliOssAccessKeySecret,
  bucket: env.aliOssBucket,
  authorizationV4: true,
  secure: true,
};

function sanitizeExtension(filename: string) {
  return extname(filename).replace(/[^.\w-]/g, '').toLowerCase();
}

export class AliOssService {
  private client: AliOss;

  constructor(options: AliOssOptions = aliOssOptions) {
    this.client = new AliOss(options);
  }

  createObjectKey(accountId: number, type: string, filename: string) {
    const extension = sanitizeExtension(filename);
    const date = new Date().toISOString().slice(0, 10);
    const random = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    return `upload_files/${accountId}/${type}/${date}/${random}${extension}`;
  }

  getObjectPrefix(accountId: number, type?: string) {
    const typeSegment = type ? `${type}/` : '';
    return `upload_files/${accountId}/${typeSegment}`;
  }

  getPublicUrl(objectKey: string) {
    const encodedObjectKey = objectKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    const origin = env.aliOssCustomDomain
      ? env.aliOssCustomDomain
      : `https://${env.aliOssBucket}.${env.aliOssRegion}.aliyuncs.com`;
    return `${origin.replace(/\/$/, '')}/${encodedObjectKey}`;
  }

  async createDirectUploadUrl(objectKey: string) {
    const uploadUrl = await this.client.signatureUrlV4(
      'PUT',
      DIRECT_UPLOAD_EXPIRES_IN_SECONDS,
      { headers: {} },
      objectKey,
    );

    return {
      objectKey,
      uploadUrl,
      expiresIn: DIRECT_UPLOAD_EXPIRES_IN_SECONDS,
    };
  }

  async initMultipartUpload(objectKey: string) {
    const result = await this.client.initMultipartUpload(objectKey);
    return {
      objectKey,
      uploadId: result.uploadId,
    };
  }

  async createMultipartPartUploadUrl(
    objectKey: string,
    uploadId: string,
    partNumber: number,
  ) {
    const uploadUrl = await this.client.signatureUrlV4(
      'PUT',
      MULTIPART_PART_UPLOAD_EXPIRES_IN_SECONDS,
      {
        queries: {
          partNumber: String(partNumber),
          uploadId,
        },
        headers: {},
      },
      objectKey,
    );

    return {
      partNumber,
      uploadUrl,
      expiresIn: MULTIPART_PART_UPLOAD_EXPIRES_IN_SECONDS,
    };
  }

  async completeMultipartUpload(
    objectKey: string,
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>,
  ) {
    const sortedParts = parts
      .map((item) => ({
        number: item.partNumber,
        etag: item.etag,
      }))
      .sort((a, b) => a.number - b.number);

    return this.client.completeMultipartUpload(objectKey, uploadId, sortedParts);
  }

  async abortMultipartUpload(objectKey: string, uploadId: string) {
    await this.client.abortMultipartUpload(objectKey, uploadId);
  }

  async headObject(objectKey: string) {
    return this.client.head(objectKey);
  }

  async deleteObject(objectKey: string) {
    const { res } = await this.client.delete(objectKey);
    if (res.status !== 204) {
      throw new HttpError(400, '删除失败，请重试');
    }
  }

  async deleteFromAliOss(url: string) {
    const objectName = decodeURI(
      env.aliOssCustomDomain ? url.replace(env.aliOssCustomDomain, '') : url,
    ).replace(/^\//, '');

    await this.deleteObject(objectName);
  }
}
