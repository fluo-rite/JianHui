import type { UpdatePageComponent } from "../../schema";
import type {
  IComponent,
  ILowCode,
  TQuestionComponentType,
} from "..";

export type UpdatePageRequest = Omit<
  ILowCode,
  | "id"
  | "account_id"
  | "status"
  | "created_at"
  | "updated_at"
  | "published_at"
  | "closed_at"
> & {
  components: UpdatePageComponent[];
};

export interface QuestionSubmissionItem {
  id: number;
  value: string | string[];
}

export interface PostQuestionDataRequest {
  props: QuestionSubmissionItem[];
}

export type GetPageDetailResponse = ILowCode & {
  components: IComponent[];
  submission_count: number;
};

export type GetPageListItemResponse = ILowCode & {
  submission_count: number;
};

export type GetQuestionDataByIdRequest = Pick<IComponent, "id">;

export interface SubmissionRecordItem {
  submissionId: number;
  submittedAt: string;
  answers: Record<string, string>;
}

export interface SubmissionRecordPageResponse {
  items: SubmissionRecordItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface QuestionDistributionOption {
  optionId: string;
  label: string;
  count: number;
  percent: number;
}

export interface QuestionDistributionResponse {
  componentId: number;
  componentType: TQuestionComponentType;
  title: string;
  totalSubmissions: number;
  options: QuestionDistributionOption[];
}
