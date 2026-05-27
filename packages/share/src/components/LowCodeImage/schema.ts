import { Type, type Static } from "@sinclair/typebox";
import {
  CssSizeSchema,
  FIT_VALUES,
  HiddenIdSchema,
  HttpUrlSchema,
  IMAGE_CLICK_ACTIONS,
  NonEmptyStringSchema,
  OptionalHttpUrlSchema,
  type ValidationIssue,
} from "../../schema/common";

export const ImageComponentOptionsSchema = Type.Object(
  {
    id: HiddenIdSchema,
    url: HttpUrlSchema,
    name: NonEmptyStringSchema(100),
    height: CssSizeSchema,
    handleClicked: Type.Union(
      IMAGE_CLICK_ACTIONS.map((value) => Type.Literal(value)),
    ),
    fit: Type.Union(FIT_VALUES.map((value) => Type.Literal(value))),
    link: OptionalHttpUrlSchema,
  },
  { additionalProperties: false },
);

export type ImageComponentOptions = Static<typeof ImageComponentOptionsSchema>;

export function getImageComponentSemanticValidationIssues(
  options: ImageComponentOptions,
): ValidationIssue[] {
  if (options.handleClicked === "open-url" && !options.link) {
    return [
      {
        path: "link",
        message: "link is required when handleClicked is open-url",
      },
    ];
  }

  return [];
}
