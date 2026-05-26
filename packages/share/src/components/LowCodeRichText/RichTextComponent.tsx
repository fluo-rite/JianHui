import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IRichTextComponentProps,
  richTextComponentDefaultConfig,
} from ".";

export default function RichTextComponent(_props: IRichTextComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(richTextComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const html = typeof props.content === "string" ? props.content.trim() : "";

  if (!html) {
    return (
      <div id="placeholder" className="w-full h-20">
        请在富文本输入内容
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
