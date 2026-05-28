import React from "react";
import { type IRichTextComponentProps } from ".";

export default function RichTextComponent(props: IRichTextComponentProps) {
  const html = typeof props.content === "string" ? props.content.trim() : "";

  if (!html) {
    return (
      <div id="placeholder" className="w-full h-20">
        璇峰湪瀵屾枃鏈緭鍏ュ唴瀹?      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
