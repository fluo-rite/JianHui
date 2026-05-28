import React, { useState } from "react";
import { objectOmit } from "../..";
import { type IVideoComponentProps } from ".";

export default function VideoComponent(props: IVideoComponentProps) {
  const [isReady, setIsReady] = useState(false);

  function handleLoadedMetadata(
    event: React.SyntheticEvent<HTMLVideoElement, Event>
  ) {
    setIsReady(true);
    event.currentTarget.currentTime = props.startTime;
  }

  return (
    <video
      controls={isReady}
      onLoadedMetadata={handleLoadedMetadata}
      className="w-full h-[200px] object-cover outline-none"
      {...objectOmit(props, ["startTime"])}
    />
  );
}
