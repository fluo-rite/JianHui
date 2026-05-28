import React from "react";
import { type IRichTextComponentProps } from ".";

export default function RichTextComponent(props: IRichTextComponentProps) {
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
