import { Type, type Static } from "@sinclair/typebox";
import type { ValidationIssue } from "../../schema/common";

export const RichTextComponentOptionsSchema = Type.Object(
  {
    content: Type.String({ maxLength: 50000 }),
  },
  { additionalProperties: false },
);

export type RichTextComponentOptions = Static<typeof RichTextComponentOptionsSchema>;

export function getRichTextComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
