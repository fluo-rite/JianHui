import type { IResources, UploadType } from '@lowcode/share';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Index('idx_resources_account_type', ['account_id', 'type'])
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

  @ManyToOne(() => User, (user) => user.resources, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account?: User;
}
