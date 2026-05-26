import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import type { ReleaseRichTextContent } from "../types/release";

export function renderRichTextContentToHtml(content: ReleaseRichTextContent) {
  const ops = Array.isArray(content.raw?.ops) ? content.raw.ops : [];

  if (
    !ops.length ||
    ops.every((op) => {
      if (typeof op.insert !== "string") return false;
      return op.insert.replace(/\n/g, "").trim() === "";
    })
  ) {
    return "";
  }

  const converter = new QuillDeltaToHtmlConverter(ops, {
    inlineStyles: true,
  });

  return converter.convert();
}
