import type { IComponentData } from '@lowcode/share';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from './page.entity';

@Index('uq_component_data_page_user', ['page_id', 'user'], {
  unique: true,
})
@Index('idx_component_data_page_id', ['page_id'])
@Entity({ name: 'component_data' })
export class ComponentData implements IComponentData {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  page_id: number = 0;

  @Column()
  user: string = '';

  @Column({ type: 'simple-json' })
  props: {
    id: number;
    value: string | string[];
  }[] = [];

  @ManyToOne(() => Page, (page) => page.component_datas, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page?: Page;
}
