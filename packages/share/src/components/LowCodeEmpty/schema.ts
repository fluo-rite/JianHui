import { Type, type Static } from "@sinclair/typebox";
import {
  FIT_VALUES,
  NonEmptyStringSchema,
  OptionalHttpUrlSchema,
  PositiveNumberSchema,
  type ValidationIssue,
} from "../../schema/common";

export const EmptyComponentOptionsSchema = Type.Object(
  {
    image: OptionalHttpUrlSchema,
    description: NonEmptyStringSchema(200),
    imageWidth: Type.Optional(PositiveNumberSchema(1, 2000)),
    imageHeight: Type.Optional(PositiveNumberSchema(1, 2000)),
    imageObjectFit: Type.Union(FIT_VALUES.map((value) => Type.Literal(value))),
  },
  { additionalProperties: false },
);

export type EmptyComponentOptions = Static<typeof EmptyComponentOptionsSchema>;

export function getEmptyComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
