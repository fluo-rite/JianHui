import { Type, type Static } from "@sinclair/typebox";
import {
  HttpUrlSchema,
  OptionalHttpUrlSchema,
  PositiveNumberSchema,
  type ValidationIssue,
} from "../../schema/common";

export const VideoComponentOptionsSchema = Type.Object(
  {
    src: HttpUrlSchema,
    poster: OptionalHttpUrlSchema,
    autoPlay: Type.Boolean(),
    loop: Type.Boolean(),
    muted: Type.Boolean(),
    startTime: PositiveNumberSchema(0, 86400),
  },
  { additionalProperties: false },
);

export type VideoComponentOptions = Static<typeof VideoComponentOptionsSchema>;

export function getVideoComponentSemanticValidationIssues(): ValidationIssue[] {
  return [];
}
