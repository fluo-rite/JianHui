import type { IComponent, IComponentData, ILowCode } from "..";

export type UpdatePageRequest = Omit<
  ILowCode,
  | "id"
  | "account_id"
  | "components"
  | "status"
  | "created_at"
  | "updated_at"
  | "published_at"
  | "closed_at"
> & {
  components: Omit<IComponent, "id" | "account_id" | "page_id">[];
};

export type PostQuestionDataRequest = Pick<IComponentData, "page_id" | "props">;

export type GetPageDetailResponse = Omit<ILowCode, "components"> & {
  componentIds: string[];
  components: IComponent[];
  submission_count: number;
};

export type GetPageListItemResponse = Omit<ILowCode, "components"> & {
  submission_count: number;
};

export type GetQuestionDataByIdRequest = Pick<IComponent, "id" | "page_id">;
