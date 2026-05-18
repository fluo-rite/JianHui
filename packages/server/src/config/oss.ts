import { Buffer } from 'node:buffer';
import { unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import AliOss = require('ali-oss');
import type { Options as AliOssOptions } from 'ali-oss';
import { env } from './env';
import { HttpError } from '../utils/http';

const aliOssOptions: AliOssOptions = {
  region: env.aliOssRegion,
  accessKeyId: env.aliOssAccessKeyId,
  accessKeySecret: env.aliOssAccessKeySecret,
  bucket: env.aliOssBucket,
};

const ossHostRegex = new RegExp(
  `http[s]?:\\/\\/(?:${env.aliOssBucket})\\.(?:${env.aliOssRegion})(?:\\.aliyuncs\\.com)`,
);

export class AliOssService {
  private client: AliOss;

  constructor(options: AliOssOptions = aliOssOptions) {
    this.client = new AliOss(options);
  }

  async uploadToAliOss(file: Express.Multer.File) {
    const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const baseName = name.split('.').slice(0, -1).join('.') || name.split('.')[0];
    const extension = name.split('.').pop();
    const objectPath = `upload_files/${baseName}-${Date.now()}.${extension}`;
    const localPath = resolve(env.uploadTempDir, file.filename);

    const { url, res } = await this.client.put(objectPath, localPath).finally(() => {
      unlinkSync(localPath);
    });

    if (res.status === 200 && url) {
      return env.aliOssCustomDomain
        ? url.replace(ossHostRegex, env.aliOssCustomDomain)
        : url;
    }

    throw new HttpError(400, '上传失败, 请重试');
  }

  async deleteFromAliOss(url: string) {
    const objectName = decodeURI(
      env.aliOssCustomDomain ? url.replace(env.aliOssCustomDomain, '') : url,
    );
    const { res } = await this.client.delete(objectName);

    if (res.status === 204) {
      return;
    }

    throw new HttpError(400, '删除失败，请重试');
  }
}
