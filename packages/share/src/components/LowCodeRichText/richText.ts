import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

export interface IQuillDelta {
  ops: Array<Record<string, any>>;
}

export interface IRichTextContent {
  format: "quill-delta";
  raw: IQuillDelta;
}

export const EMPTY_RICH_TEXT_CONTENT: IRichTextContent = {
  format: "quill-delta",
  raw: {
    ops: [],
  },
};

export function isRichTextContentEmpty(content?: IRichTextContent | null) {
  if (!content || content.format !== "quill-delta") return true;
  const ops = Array.isArray(content.raw?.ops) ? content.raw.ops : [];

  return ops.every((op) => {
    if (typeof op.insert !== "string") return false;
    return op.insert.replace(/\n/g, "").trim() === "";
  });
}

export function renderRichTextContentToHtml(content: IRichTextContent) {
  if (isRichTextContentEmpty(content)) return "";

  const converter = new QuillDeltaToHtmlConverter(content.raw.ops, {
    inlineStyles: true,
  });

  return converter.convert();
}
