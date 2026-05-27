import { Type, type Static } from "@sinclair/typebox";
import {
  ChoiceOptionSchema,
  HiddenIdSchema,
  NonEmptyStringSchema,
  OptionalStringSchema,
  hasUniqueIds,
  type ValidationIssue,
} from "../../schema/common";

export const RadioComponentOptionsSchema = Type.Object(
  {
    id: HiddenIdSchema,
    title: NonEmptyStringSchema(100),
    value: OptionalStringSchema(100),
    options: Type.Array(ChoiceOptionSchema, { minItems: 1, maxItems: 20 }),
  },
  { additionalProperties: false },
);

export type RadioComponentOptions = Static<typeof RadioComponentOptionsSchema>;

export function getRadioComponentSemanticValidationIssues(
  options: RadioComponentOptions,
): ValidationIssue[] {
  if (!hasUniqueIds(options.options)) {
    return [
      {
        path: "options",
        message: "option ids must be unique",
      },
    ];
  }

  if (options.value) {
    const validIds = new Set(options.options.map((item) => item.id));
    if (!validIds.has(options.value)) {
      return [
        {
          path: "value",
          message: "value must reference an existing option id",
        },
      ];
    }
  }

  return [];
}
