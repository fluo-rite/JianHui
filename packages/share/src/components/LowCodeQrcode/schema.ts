import { Type, type Static } from "@sinclair/typebox";
import {
  NonEmptyStringSchema,
  OptionalHttpUrlSchema,
  PositiveIntegerSchema,
  QRCODE_ERROR_LEVELS,
  type ValidationIssue,
} from "../../schema/common";

export const QrcodeComponentOptionsSchema = Type.Object(
  {
    icon: OptionalHttpUrlSchema,
    size: PositiveIntegerSchema(64, 1024),
    value: NonEmptyStringSchema(2000),
    color: NonEmptyStringSchema(32),
    bgColor: NonEmptyStringSchema(32),
    iconSize: PositiveIntegerSchema(0, 256),
    errorLevel: Type.Union(
      QRCODE_ERROR_LEVELS.map((value) => Type.Literal(value)),
    ),
  },
  { additionalProperties: false },
);

export type QrcodeComponentOptions = Static<typeof QrcodeComponentOptionsSchema>;

export function getQrcodeComponentSemanticValidationIssues(
  options: QrcodeComponentOptions,
): ValidationIssue[] {
  if (options.iconSize > options.size / 2) {
    return [
      {
        path: "iconSize",
        message: "iconSize must be less than or equal to half of size",
      },
    ];
  }

  return [];
}
