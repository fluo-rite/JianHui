import { Type, type Static } from "@sinclair/typebox";
import {
  ChoiceOptionSchema,
  HiddenIdSchema,
  NonEmptyStringSchema,
  hasUniqueIds,
  type ValidationIssue,
} from "../../schema/common";

export const CheckboxComponentOptionsSchema = Type.Object(
  {
    id: HiddenIdSchema,
    title: NonEmptyStringSchema(100),
    value: Type.Array(Type.String({ maxLength: 100 }), { maxItems: 20 }),
    options: Type.Array(ChoiceOptionSchema, { minItems: 1, maxItems: 20 }),
  },
  { additionalProperties: false },
);

export type CheckboxComponentOptions = Static<typeof CheckboxComponentOptionsSchema>;

export function getCheckboxComponentSemanticValidationIssues(
  options: CheckboxComponentOptions,
): ValidationIssue[] {
  if (!hasUniqueIds(options.options)) {
    return [
      {
        path: "options",
        message: "option ids must be unique",
      },
    ];
  }

  const validIds = new Set(options.options.map((item) => item.id));
  if (options.value.some((item) => !validIds.has(item))) {
    return [
      {
        path: "value",
        message: "all selected values must reference existing option ids",
      },
    ];
  }

  return [];
}
