import React from "react";
import { type IImageComponentProps } from ".";

export default function ImageComponent(props: IImageComponentProps) {
  const img = (
    <img
      src={props.url}
      alt={props.name}
      className="w-full"
      style={{ height: `${props.height}px`, objectFit: props.fit }}
    />
  );

  if (props.handleClicked === "open-url") {
    return (
      <a href={props.link} target="_blank" rel="noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
