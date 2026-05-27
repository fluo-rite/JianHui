import { Type, type Static } from "@sinclair/typebox";
import {
  NonEmptyStringSchema,
  type ValidationIssue,
} from "../../schema/common";

export const TextAreaComponentOptionsSchema = Type.Object(
  {
    title: NonEmptyStringSchema(100),
    text: Type.String({ maxLength: 5000 }),
    placeholder: Type.String({ maxLength: 200 }),
  },
  { additionalProperties: false },
);

export type TextAreaComponentOptions = Static<typeof TextAreaComponentOptionsSchema>;

export function getTextAreaComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
