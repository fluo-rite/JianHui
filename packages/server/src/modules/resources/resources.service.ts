import { Buffer } from 'node:buffer';
import type { UploadType } from '@lowcode/share';
import type { Repository } from 'typeorm';
import { AliOssService } from '../../config/oss';
import { Resources } from '../../entities/resources.entity';
import { HttpError } from '../../utils/http';

export class ResourcesService {
  constructor(
    private readonly aliOssService: AliOssService,
    private readonly resourcesRepository: Repository<Resources>,
  ) {}

  async upload(
    file: Express.Multer.File,
    type: UploadType,
    accountId: number,
  ) {
    const url = await this.aliOssService.uploadToAliOss(file);

    await this.resourcesRepository.save({
      url,
      type,
      account_id: accountId,
      name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
    });

    return { msg: '上传成功' };
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
