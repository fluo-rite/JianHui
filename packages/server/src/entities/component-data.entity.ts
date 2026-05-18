import type { IComponentData } from '@lowcode/share';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
