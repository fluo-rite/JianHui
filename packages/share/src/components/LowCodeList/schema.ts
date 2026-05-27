import { Type, type Static } from "@sinclair/typebox";
import {
  HiddenIdSchema,
  ListItemSchema,
  hasUniqueIds,
  type ValidationIssue,
} from "../../schema/common";

export const ListComponentOptionsSchema = Type.Object(
  {
    id: HiddenIdSchema,
    items: Type.Array(ListItemSchema, { minItems: 1, maxItems: 50 }),
  },
  { additionalProperties: false },
);

export type ListComponentOptions = Static<typeof ListComponentOptionsSchema>;

export function getListComponentSemanticValidationIssues(
  options: ListComponentOptions,
): ValidationIssue[] {
  if (!hasUniqueIds(options.items)) {
    return [
      {
        path: "items",
        message: "item ids must be unique",
      },
    ];
  }

  return [];
}
