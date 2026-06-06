import { TComponentTypes } from "../..";

export type TQuestionComponentType =
  | "input"
  | "textArea"
  | "radio"
  | "checkbox";

export type TPageStatus = "draft" | "published" | "closed";

export interface ILowCode {
  id: number;
  account_id: number;
  page_name: string;
  tdk: string;
  desc: string;
  status: TPageStatus;
  created_at: Date | string;
  updated_at: Date | string;
  published_at: Date | string | null;
  closed_at: Date | string | null;
}

export interface IComponent {
  id: number;
  page_id: number;
  sort_index: number;
  type: TComponentTypes;
  options: Record<string, any>;
}

export interface ISubmission {
  id: number;
  page_id: number;
  submitter_key: string;
  created_at: Date | string;
}

export interface ISubmissionAnswer {
  id: number;
  submission_id: number;
  page_id: number;
  component_id: number;
  component_type: TQuestionComponentType;
  value_text: string | null;
  value_option_id: string | null;
}
