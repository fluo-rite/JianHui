import { TComponentTypes } from "../..";

export type TPageStatus = "draft" | "published" | "closed";

export interface ILowCode {
  id: number;
  account_id: number;
  page_name: string;
  components: string[];
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
  account_id: number;
  page_id: number;
  type: TComponentTypes;
  options: Record<string, any>;
}

export interface IComponentData {
  id: number;
  user: string;
  page_id: number;
  props: Record<string, any>[];
}
