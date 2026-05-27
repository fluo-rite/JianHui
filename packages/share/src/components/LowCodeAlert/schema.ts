import { Type, type Static } from "@sinclair/typebox";
import {
  ALERT_TYPES,
  NonEmptyStringSchema,
  type ValidationIssue,
} from "../../schema/common";

export const AlertComponentOptionsSchema = Type.Object(
  {
    title: NonEmptyStringSchema(100),
    description: Type.String({ maxLength: 500 }),
    showIcon: Type.Boolean(),
    showClose: Type.Boolean(),
    isBanner: Type.Boolean(),
    type: Type.Union(ALERT_TYPES.map((value) => Type.Literal(value))),
  },
  { additionalProperties: false },
);

export type AlertComponentOptions = Static<typeof AlertComponentOptionsSchema>;

export function getAlertComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
