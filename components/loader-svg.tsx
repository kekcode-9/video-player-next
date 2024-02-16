"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoaderSvg() {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      gsap.fromTo(circleRef.current, {
        translateY: "0px"
      }, {
        translateY: "-112px",
        repeat: -1,
        yoyo: true
      })
    }
  }, [circleRef.current]);

  return (
    <svg
      width="216"
      height="273"
      viewBox="0 0 216 273"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 271.5H214"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle ref={circleRef} className="-translate-y-[112px]" cx="108" cy="213" r="59" fill="white" />
    </svg>
  );
}
