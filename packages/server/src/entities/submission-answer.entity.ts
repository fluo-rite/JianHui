import type { ISubmissionAnswer } from '@lowcode/share';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

@Index('idx_answer_submission_component', ['submission_id', 'component_id'])
@Index('idx_answer_page_component_option', [
  'page_id',
  'component_id',
  'value_option_id',
])
@Index('idx_answer_page_submission', ['page_id', 'submission_id'])
@Entity({ name: 'submission_answer' })
export class SubmissionAnswer implements ISubmissionAnswer {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  submission_id: number = 0;

  @Column()
  page_id: number = 0;

  @Column()
  component_id: number = 0;

  @Column({ type: 'varchar', length: 64 })
  component_type: ISubmissionAnswer['component_type'] = 'input';

  @Column({ type: 'text', nullable: true })
  value_text: string | null = null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  value_option_id: string | null = null;

  @ManyToOne(() => Submission, (submission) => submission.answers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission?: Submission;
}
