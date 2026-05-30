import type { UploadType } from '@lowcode/share';
import type { Repository } from 'typeorm';
import { AliOssService } from '../../config/oss';
import { Resources } from '../../entities/resources.entity';
import { HttpError } from '../../utils/http';

const UPLOAD_MODE_THRESHOLD = 20 * 1024 * 1024;
const MULTIPART_UPLOAD_MAX_SIZE = 500 * 1024 * 1024;
const DEFAULT_MULTIPART_PART_SIZE = 5 * 1024 * 1024;

const allowedExtensions: Record<UploadType, string[]> = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
  video: ['.mp4', '.mov', '.m4v', '.webm', '.ogg'],
};

function getFilenameExtension(filename: string) {
  const matched = filename.toLowerCase().match(/\.[^.]+$/);
  return matched?.[0] ?? '';
}

function isAllowedContentType(type: UploadType, contentType: string) {
  if (!contentType) {
    return true;
  }

  if (type === 'image') {
    return contentType.startsWith('image/');
  }

  return contentType.startsWith('video/');
}

export class ResourcesService {
  constructor(
    private readonly aliOssService: AliOssService,
    private readonly resourcesRepository: Repository<Resources>,
  ) {}

  private assertOwnedObjectKey(
    objectKey: string,
    accountId: number,
    type?: UploadType,
  ) {
    const prefix = this.aliOssService.getObjectPrefix(accountId, type);
    if (!objectKey.startsWith(prefix)) {
      throw new HttpError(403, '无权操作该上传资源');
    }
  }

  private assertFilename(filename: string, type: UploadType) {
    const extension = getFilenameExtension(filename);
    if (!extension || !allowedExtensions[type].includes(extension)) {
      throw new HttpError(
        400,
        `${type === 'image' ? '图片' : '视频'}文件扩展名不支持`,
      );
    }
  }

  private assertContentType(type: UploadType, contentType: string) {
    if (!isAllowedContentType(type, contentType)) {
      throw new HttpError(
        400,
        `${type === 'image' ? '图片' : '视频'}内容类型错误`,
      );
    }
  }

  private assertDirectUpload(size: number) {
    if (size > UPLOAD_MODE_THRESHOLD) {
      throw new HttpError(400, '直传文件大小不能超过 20MB');
    }
  }

  private assertMultipartUpload(size: number) {
    if (size <= UPLOAD_MODE_THRESHOLD) {
      throw new HttpError(400, '20MB 及以下文件请使用普通直传');
    }

    if (size > MULTIPART_UPLOAD_MAX_SIZE) {
      throw new HttpError(400, '分片上传文件大小不能超过 500MB');
    }
  }

  async initDirectUpload(input: {
    filename: string;
    size: number;
    type: UploadType;
    contentType: string;
    accountId: number;
  }) {
    this.assertFilename(input.filename, input.type);
    this.assertContentType(input.type, input.contentType);
    this.assertDirectUpload(input.size);

    const objectKey = this.aliOssService.createObjectKey(
      input.accountId,
      input.type,
      input.filename,
    );

    return this.aliOssService.createDirectUploadUrl(objectKey);
  }

  async initMultipartUpload(input: {
    filename: string;
    size: number;
    type: UploadType;
    contentType: string;
    accountId: number;
  }) {
    this.assertFilename(input.filename, input.type);
    this.assertContentType(input.type, input.contentType);
    this.assertMultipartUpload(input.size);

    const objectKey = this.aliOssService.createObjectKey(
      input.accountId,
      input.type,
      input.filename,
    );
    const initResult = await this.aliOssService.initMultipartUpload(objectKey);

    return {
      ...initResult,
      partSize: DEFAULT_MULTIPART_PART_SIZE,
      totalParts: Math.ceil(input.size / DEFAULT_MULTIPART_PART_SIZE),
    };
  }

  async createMultipartPartUploadUrl(input: {
    objectKey: string;
    uploadId: string;
    partNumber: number;
    accountId: number;
  }) {
    this.assertOwnedObjectKey(input.objectKey, input.accountId);
    return this.aliOssService.createMultipartPartUploadUrl(
      input.objectKey,
      input.uploadId,
      input.partNumber,
    );
  }

  private async saveUploadedResource(input: {
    objectKey: string;
    filename: string;
    type: UploadType;
    accountId: number;
  }) {
    const headResult = await this.aliOssService.headObject(input.objectKey);
    const objectSize = Number(headResult.res.headers['content-length']);
    if (!Number.isFinite(objectSize) || objectSize <= 0) {
      throw new HttpError(400, '上传文件为空');
    }

    const url = this.aliOssService.getPublicUrl(input.objectKey);
    await this.resourcesRepository.save({
      url,
      type: input.type,
      account_id: input.accountId,
      name: input.filename,
    });

    return { msg: '上传成功', data: { url } };
  }

  async completeUpload(
    input:
      | {
          mode: 'direct';
          objectKey: string;
          filename: string;
          type: UploadType;
          accountId: number;
        }
      | {
          mode: 'multipart';
          objectKey: string;
          uploadId: string;
          filename: string;
          type: UploadType;
          parts: Array<{ partNumber: number; etag: string }>;
          accountId: number;
        },
  ) {
    this.assertOwnedObjectKey(input.objectKey, input.accountId, input.type);
    this.assertFilename(input.filename, input.type);

    try {
      if (input.mode === 'multipart') {
        await this.aliOssService.completeMultipartUpload(
          input.objectKey,
          input.uploadId,
          input.parts,
        );
      }

      return await this.saveUploadedResource(input);
    } catch (error) {
      try {
        await this.aliOssService.deleteObject(input.objectKey);
      } catch {
        // Ignore cleanup failures here; the upload itself should still surface.
      }

      throw error;
    }
  }

  async abortUpload(
    objectKey: string,
    uploadId: string,
    accountId: number,
  ) {
    this.assertOwnedObjectKey(objectKey, accountId);
    await this.aliOssService.abortMultipartUpload(objectKey, uploadId);
    return { msg: '已取消上传' };
  }

  async deleteResource(id: number, accountId: number) {
    const resource = await this.resourcesRepository.findOneBy({
      id,
      account_id: accountId,
    });
    if (!resource) {
      throw new HttpError(400, '资源不存在');
    }

    await this.aliOssService.deleteFromAliOss(resource.url);
    await this.resourcesRepository.delete({ id, account_id: accountId });

    return { msg: '删除成功' };
  }

  async getResources(type: UploadType, accountId: number) {
    return this.resourcesRepository.findBy({ type, account_id: accountId });
  }
}
