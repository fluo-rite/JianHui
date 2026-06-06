import type { ISubmission } from '@lowcode/share';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from './page.entity';
import { SubmissionAnswer } from './submission-answer.entity';

@Index('uq_submission_page_submitter', ['page_id', 'submitter_key'], {
  unique: true,
})
@Index('idx_submission_page_created', ['page_id', 'created_at', 'id'])
@Index('idx_submission_page_id', ['page_id', 'id'])
@Entity({ name: 'submission' })
export class Submission implements ISubmission {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  page_id: number = 0;

  @Column()
  submitter_key: string = '';

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date = new Date();

  @ManyToOne(() => Page, (page) => page.submissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page?: Page;

  @OneToMany(() => SubmissionAnswer, (answer) => answer.submission)
  answers?: SubmissionAnswer[];
}
