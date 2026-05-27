import { Type, type Static } from "@sinclair/typebox";
import {
  HttpUrlSchema,
  NonEmptyStringSchema,
  type ValidationIssue,
} from "../../schema/common";

export const CardComponentOptionsSchema = Type.Object(
  {
    title: NonEmptyStringSchema(100),
    coverImg: HttpUrlSchema,
    description: Type.String({ maxLength: 500 }),
  },
  { additionalProperties: false },
);

export type CardComponentOptions = Static<typeof CardComponentOptionsSchema>;

export function getCardComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
