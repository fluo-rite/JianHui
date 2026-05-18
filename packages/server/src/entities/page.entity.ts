import type { ILowCode } from '@lowcode/share';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'page' })
export class Page implements ILowCode {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  account_id: number = 0;

  @Column()
  page_name: string = '';

  @Column({ type: 'simple-array' })
  components: string[] = [];

  @Column()
  tdk: string = '';

  @Column()
  desc: string = '';
}
