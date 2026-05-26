import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IRichTextComponentProps,
  richTextComponentDefaultConfig,
} from ".";
import {
  isRichTextContentEmpty,
  renderRichTextContentToHtml,
} from "./richText";

export default function RichTextComponent(_props: IRichTextComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(richTextComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const html = useMemo(
    () =>
      isRichTextContentEmpty(props.content)
        ? ""
        : renderRichTextContentToHtml(props.content),
    [props.content]
  );

  if (!html)
    return (
      <div id="placeholder" className="w-full h-20">
        请在富文本输入内容
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
