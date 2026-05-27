import { Type } from "@sinclair/typebox";
import type { ValueError } from "@sinclair/typebox/value";

export const FIT_VALUES = [
  "contain",
  "cover",
  "fill",
  "none",
  "scale-down",
  "initial",
  "revert",
  "unset",
] as const;

export const ALERT_TYPES = ["success", "info", "warning", "error"] as const;
export const DOT_POSITIONS = ["bottom", "top", "left", "right"] as const;
export const TEXT_SIZES = ["xs", "sm", "base", "lg", "xl"] as const;
export const SPLIT_ORIENTATIONS = ["left", "center", "right"] as const;
export const QRCODE_ERROR_LEVELS = ["L", "M", "Q", "H"] as const;
export const IMAGE_CLICK_ACTIONS = ["open-url", "none"] as const;

export interface ValidationIssue {
  path: string;
  message: string;
}

export const NonEmptyStringSchema = (maxLength = 200) =>
  Type.String({ minLength: 1, maxLength });

export const OptionalStringSchema = (maxLength = 200) =>
  Type.String({ maxLength });

export const HttpUrlSchema = Type.String({
  minLength: 1,
  maxLength: 2048,
  pattern: "^https?://.+",
});

export const OptionalHttpUrlSchema = Type.Optional(HttpUrlSchema);

export const PositiveNumberSchema = (minimum = 1, maximum = 10000) =>
  Type.Number({ minimum, maximum });

export const PositiveIntegerSchema = (minimum = 0, maximum = 10000) =>
  Type.Integer({ minimum, maximum });

export const CssSizeSchema = Type.Union([
  Type.Number({ minimum: 1, maximum: 10000 }),
  Type.String({ minLength: 1, maxLength: 32 }),
]);

export const HiddenIdSchema = Type.String({ maxLength: 100 });
export const ItemIdSchema = Type.String({ minLength: 1, maxLength: 100 });

export const ImageItemSchema = Type.Object(
  {
    id: ItemIdSchema,
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

export const ListItemSchema = Type.Object(
  {
    id: ItemIdSchema,
    title: NonEmptyStringSchema(100),
    avatar: HttpUrlSchema,
    description: Type.String({ maxLength: 500 }),
    titleLink: HttpUrlSchema,
  },
  { additionalProperties: false },
);

export const ChoiceOptionSchema = Type.Object(
  {
    id: ItemIdSchema,
    value: NonEmptyStringSchema(100),
  },
  { additionalProperties: false },
);

export function normalizeJsonPointer(pointer: string) {
  if (!pointer) return "";

  return pointer
    .split("/")
    .filter(Boolean)
    .map((segment, index) =>
      /^\d+$/.test(segment)
        ? `[${segment}]`
        : index === 0
          ? segment
          : `.${segment}`,
    )
    .join("");
}

export function mapTypeBoxErrors(errors: IterableIterator<ValueError>) {
  return Array.from(errors).map((error) => ({
    path: normalizeJsonPointer(error.path),
    message: error.message,
  }));
}

export function hasUniqueIds(items: Array<{ id: string }>) {
  const uniqueIds = new Set(items.map((item) => item.id));
  return uniqueIds.size === items.length;
}
