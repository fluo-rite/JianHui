import type { IComponent, TComponentTypes } from '@lowcode/share';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from './page.entity';

@Index('uq_component_page_sort_index', ['page_id', 'sort_index'], {
  unique: true,
})
@Index('idx_component_page_type', ['page_id', 'type'])
@Entity({ name: 'component' })
export class Component implements IComponent {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  page_id: number = 0;

  @Column()
  sort_index: number = 0;

  @Column()
  type: TComponentTypes = 'titleText';

  @Column({ type: 'simple-json' })
  options: Record<string, any> = {};

  @ManyToOne(() => Page, (page) => page.components, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page?: Page;
}
