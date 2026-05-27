import { Type, type Static } from "@sinclair/typebox";
import {
  SPLIT_ORIENTATIONS,
  type ValidationIssue,
} from "../../schema/common";

export const SplitComponentOptionsSchema = Type.Object(
  {
    text: Type.String({ maxLength: 100 }),
    dashed: Type.Boolean(),
    orientation: Type.Union(
      SPLIT_ORIENTATIONS.map((value) => Type.Literal(value)),
    ),
  },
  { additionalProperties: false },
);

export type SplitComponentOptions = Static<typeof SplitComponentOptionsSchema>;

export function getSplitComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
