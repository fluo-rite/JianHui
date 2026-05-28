import type { UpdatePageComponent } from "../../schema";
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
  components: UpdatePageComponent[];
};

export type PostQuestionDataRequest = Pick<IComponentData, "props">;

export type GetPageDetailResponse = ILowCode & {
  components: IComponent[];
  submission_count: number;
};

export type GetPageListItemResponse = ILowCode & {
  submission_count: number;
};

export type GetQuestionDataByIdRequest = Pick<IComponent, "id">;
