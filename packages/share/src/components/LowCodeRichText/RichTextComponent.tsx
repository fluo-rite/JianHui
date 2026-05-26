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
        璇峰湪瀵屾枃鏈緭鍏ュ唴瀹?
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
