import { Carousel } from "antd";
import React from "react";
import { ImageComponent } from "..";
import type { ISwiperComponentProps } from ".";

export default function SwiperComponent(props: ISwiperComponentProps) {
  return (
    <Carousel
      autoplaySpeed={props.interval}
      autoplay={props.autoPlay}
      dots={props.showIndicators}
      dotPosition={props.dotPosition}
    >
      {props.images.map((image, index) => (
        <ImageComponent {...image} key={index} />
      ))}
    </Carousel>
  );
}
