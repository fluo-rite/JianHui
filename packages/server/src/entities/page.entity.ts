import type { ILowCode, TPageStatus } from "@lowcode/share";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Component } from "./component.entity";
import { ComponentData } from "./component-data.entity";
import { User } from "./user.entity";

@Index("idx_page_account_created_at", ["account_id", "created_at"])
@Index("idx_page_account_updated_at", ["account_id", "updated_at"])
@Entity({ name: "page" })
export class Page implements ILowCode {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  account_id: number = 0;

  @Column()
  page_name: string = "";

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

  @ManyToOne(() => User, (user) => user.pages, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "account_id" })
  account?: User;

  @OneToMany(() => Component, (component) => component.page)
  components?: Component[];

  @OneToMany(() => ComponentData, (componentData) => componentData.page)
  component_datas?: ComponentData[];
}
