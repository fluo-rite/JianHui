import React from "react";
import { Divider } from "antd";

import { objectOmit } from "../..";
import type { ISplitComponentProps } from ".";

export default function SplitComponent(props: ISplitComponentProps) {
  if (!props.text) {
    return <Divider {...objectOmit(props, ["text"])} />;
  }

  return (
    <Divider {...objectOmit(props, ["text"])}>
      <span className="text-gray-500/80">{props.text}</span>
    </Divider>
  );
}
