"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { VideoContext } from "@/store/videocontext";
import Typography from "./utility/typography";
import { VideoInfoType } from "@/types";
import actions from "@/store/actions";

export default function VideoInfoSection() {
  const { state } = useContext(VideoContext);
  const { currentVid, hidePlaylist, moveInfoUp } = state;

  const sectionRef = useRef<HTMLElement>(null);

  const [videoInfo, setVideoInfo] = useState<VideoInfoType>();

  useEffect(() => {
    currentVid && setVideoInfo(currentVid);
  }, [currentVid]);

  useEffect(() => {
    screen.width < 1024 && gsap.to(sectionRef.current, {
      translateY: moveInfoUp ? '-226px' : '0px'
    })
  }, [moveInfoUp]);

  if (hidePlaylist) {
    return;
  }

  return (
    <section
      ref={sectionRef}
      className="vid-info-section
        flex max-lg:items-start lg:justify-center 
        text-white"
    >
      {videoInfo && (
        <div
          className="flex flex-col gap-2 sm:gap-4
            items-start lg:items-center 
            max-w-[864px]
            py-6 px-8
            sm:pt-8 sm:px-16"
        >
          <Typography isHeader>{videoInfo.title}</Typography>
          <Typography isSubHeader>{videoInfo.subtitle}</Typography>
          <Typography additionalClasses="sm:text-justify">
            {videoInfo.description}
          </Typography>
        </div>
      )}
    </section>
  );
}
