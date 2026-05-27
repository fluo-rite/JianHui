import { Type, type Static } from "@sinclair/typebox";
import {
  NonEmptyStringSchema,
  type ValidationIssue,
} from "../../schema/common";

export const InputComponentOptionsSchema = Type.Object(
  {
    title: NonEmptyStringSchema(100),
    text: Type.String({ maxLength: 2000 }),
    placeholder: Type.String({ maxLength: 200 }),
  },
  { additionalProperties: false },
);

export type InputComponentOptions = Static<typeof InputComponentOptionsSchema>;

export function getInputComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
