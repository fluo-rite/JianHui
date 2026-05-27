import type { IComponent, IComponentData, ILowCode } from "..";

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
  components: Omit<IComponent, "id" | "page_id" | "sort_index">[];
};

export type PostQuestionDataRequest = Pick<IComponentData, "page_id" | "props">;

export type GetPageDetailResponse = ILowCode & {
  components: IComponent[];
  submission_count: number;
};

export type GetPageListItemResponse = ILowCode & {
  submission_count: number;
};

export type GetQuestionDataByIdRequest = Pick<IComponent, "id" | "page_id">;
