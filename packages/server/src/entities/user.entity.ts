import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from './page.entity';
import { Resources } from './resources.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Index('uq_user_username', { unique: true })
  @Column()
  username: string = '';

  @Column()
  head_img: string = '';

  @Column()
  phone: string = '';

  @Column()
  password: string = '';

  @Column()
  open_id: string = '';

  @OneToMany(() => Page, (page) => page.account)
  pages?: Page[];

  @OneToMany(() => Resources, (resource) => resource.account)
  resources?: Resources[];
}
