import type { IResources, UploadType } from '@lowcode/share';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'resources' })
export class Resources implements IResources {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  account_id: number = 0;

  @Column()
  url: string = '';

  @Column()
  type: UploadType = 'image';

  @Column()
  name: string = '';
}
