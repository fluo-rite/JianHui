import { Type, type Static } from "@sinclair/typebox";
import {
  NonEmptyStringSchema,
  TEXT_SIZES,
  type ValidationIssue,
} from "../../schema/common";

export const TextComponentOptionsSchema = Type.Object(
  {
    title: NonEmptyStringSchema(500),
    size: Type.Union(TEXT_SIZES.map((value) => Type.Literal(value))),
  },
  { additionalProperties: false },
);

export type TextComponentOptions = Static<typeof TextComponentOptionsSchema>;

export function getTextComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
