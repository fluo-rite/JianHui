import type { ILowCode, TPageStatus } from "@lowcode/share";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "page" })
export class Page implements ILowCode {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  account_id: number = 0;

  @Column()
  page_name: string = "";

  @Column({ type: "simple-array" })
  components: string[] = [];

  @Column()
  tdk: string = "";

  @Column()
  desc: string = "";

  @Column({ type: "varchar", default: "draft" })
  status: TPageStatus = "draft";

  @CreateDateColumn({ type: "datetime" })
  created_at: Date = new Date();

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date = new Date();

  @Column({ type: "datetime", nullable: true })
  published_at: Date | null = null;

  @Column({ type: "datetime", nullable: true })
  closed_at: Date | null = null;
}
