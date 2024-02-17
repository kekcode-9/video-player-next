"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoaderSvg() {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        {
          translateY: "0px",
        },
        {
          translateY: "-86px",
          repeat: -1,
          yoyo: true,
        }
      );
    }
  }, [circleRef.current]);

  return (
    <svg
      width="119"
      height="153"
      viewBox="0 0 119 153"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 151H117"
        stroke="#FF1BB1"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        ref={circleRef}
        className="-translate-y-[86px]"
        cx="60"
        cy="119"
        r="32"
        fill="#FF1BB1"
      />
    </svg>
  );
}
