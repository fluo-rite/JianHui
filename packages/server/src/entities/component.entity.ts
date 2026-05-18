import type { IComponent, TComponentTypes } from '@lowcode/share';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'component' })
export class Component implements IComponent {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  type: TComponentTypes = 'titleText';

  @Column()
  page_id: number = 0;

  @Column()
  account_id: number = 0;

  @Column({ type: 'simple-json' })
  options: Record<string, any> = {};
}
