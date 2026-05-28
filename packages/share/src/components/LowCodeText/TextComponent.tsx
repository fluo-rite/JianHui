import React, { useEffect, useState } from "react";
import type { ITextComponentProps } from ".";

export default function TextComponent(props: ITextComponentProps) {
  const [size, setSize] = useState("");

  useEffect(() => {
    switch (props.size) {
      case "sm":
        setSize("text-sm");
        break;
      case "base":
        setSize("text-base");
        break;
      case "lg":
        setSize("text-lg");
        break;
      case "xl":
        setSize("text-xl");
        break;
      case "xs":
        setSize("text-xs");
        break;
      default:
        setSize("text-base");
        break;
    }
  }, [props.size]);

  return <span className={size}>{props.title}</span>;
}
