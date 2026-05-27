import { Type, type Static } from "@sinclair/typebox";
import {
  DOT_POSITIONS,
  HiddenIdSchema,
  ImageItemSchema,
  PositiveIntegerSchema,
  hasUniqueIds,
  type ValidationIssue,
} from "../../schema/common";

export const SwiperComponentOptionsSchema = Type.Object(
  {
    id: HiddenIdSchema,
    interval: PositiveIntegerSchema(1000, 60000),
    autoPlay: Type.Boolean(),
    images: Type.Array(ImageItemSchema, { minItems: 1, maxItems: 20 }),
    showIndicators: Type.Boolean(),
    dotPosition: Type.Union(
      DOT_POSITIONS.map((value) => Type.Literal(value)),
    ),
  },
  { additionalProperties: false },
);

export type SwiperComponentOptions = Static<typeof SwiperComponentOptionsSchema>;

export function getSwiperComponentSemanticValidationIssues(
  options: SwiperComponentOptions,
): ValidationIssue[] {
  if (!hasUniqueIds(options.images)) {
    return [
      {
        path: "images",
        message: "image ids must be unique",
      },
    ];
  }

  return [];
}
