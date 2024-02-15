"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume1,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiChevronUp,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [timerContent, setTimerContent] = useState<string>("00:00");
  const [timerRangeValue, setTimerRangeValue] = useState<string>("0");
  const [buffering, toggleBuffering] = useState(false);
  const [playing, togglePlaying] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState("50");
  const [volumeSliderTimer, setVolumeSliderTimer] = useState<
    NodeJS.Timeout | undefined
  >();
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const prettifyDuration = (
    vidDuration: number
  ): { hr: number; min: number; sec: number } => {
    const hr = Math.floor(vidDuration / 3600);
    const min = hr
      ? Math.floor((vidDuration - 3600 * hr) / 60)
      : Math.floor(vidDuration / 60);
    const sec = Math.ceil(vidDuration % 60);
    return { hr, min, sec };
  };

  useEffect(() => {
    let retryTimer: NodeJS.Timeout;
    const setTimer = (vidDuration: number) => {
      const { hr, min, sec } = prettifyDuration(vidDuration);
      if (hr) {
        setTimerContent(`00:00:00 / ${hr}:${min}:${sec}`);
      } else {
        setTimerContent(`00:00 / ${min}:${sec}`);
      }
    };
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (!duration) {
        setDuration(0);
        retryTimer = setInterval(() => {
          if (videoRef.current && videoRef.current.duration) {
            clearInterval(retryTimer);
            setDuration(Math.ceil(vidDuration));
            setTimer(videoRef.current.duration);
            videoRef.current.volume = 0.5;
          }
        }, 1000);
      } else {
        setDuration(Math.ceil(vidDuration));
        setTimer(vidDuration);
        videoRef.current.volume = 0.5;
      }
    }

    return () => {
      retryTimer && clearInterval(retryTimer);
    };
  }, [videoRef.current?.readyState]);

  const onSeekHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const timestamp = e.target.value;
      setTimerRangeValue(timestamp);
      const { hr, min, sec } = prettifyDuration(Number(timestamp));
      const vidDuration = timerContent.split(" / ")[1];
      if (videoRef.current) {
        videoRef.current.currentTime = Number(timestamp);
        toggleBuffering(true);
      }
      if (hr) {
        setTimerContent(`${hr}:${min}:${sec} / ${vidDuration}`);
      } else {
        setTimerContent(`${min}:${sec} / ${vidDuration}`);
      }
    },
    [timerContent]
  );

  const onTimeUpdateHandler = useCallback(() => {
    if (videoRef.current) {
      const { hr, min, sec } = prettifyDuration(videoRef.current.currentTime);
      const vidDuration = timerContent.split(" / ")[1];
      if (hr) {
        setTimerContent(`${hr}:${min}:${sec} / ${vidDuration}`);
      } else {
        setTimerContent(`${min}:${sec} / ${vidDuration}`);
      }
    }
    toggleBuffering(false);
  }, [timerContent]);

  const onVolumeChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (volumeSliderTimer) {
        clearTimeout(volumeSliderTimer);
      }
      const newVolume = Number(e.target.value) / 100;
      setVolume(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }
      setVolumeSliderTimer(
        setTimeout(() => {
          setShowVolumeSlider(false);
        }, 5000)
      );
    },
    [volumeSliderTimer]
  );

  return (
    <IconContext.Provider
      value={{
        color: "white",
        size: "24px",
      }}
    >
      <div
        className={`
          player-container
          flex items-center justify-center
          ${
            fullScreenMode
              ? `w-screen h-screen`
              : "w-screen h-1/2"
          } 
          bg-black
          text-white
        `}
      >
        <div
          className={`
            player-wrapper 
            relative
            ${
              fullScreenMode
                ? "w-screen h-screen"
                : "w-fit h-full"
            }
            flex items-center justify-center
            bg-black
          `}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            className={`${
              fullScreenMode
                ? "min-w-[100vh] sm:min-w-full sm:min-h-full max-sm:rotate-90"
                : "min-w-[70%] min-h-[50vh]"
            }`}
            ref={videoRef}
            onClick={() => {
              if (screen.width >= 768) {
                playing ? videoRef.current?.pause() : videoRef.current?.play();
                togglePlaying(!playing);
              } else {
                setShowControls(!showControls);
              }
            }}
            onTimeUpdate={onTimeUpdateHandler}
          >
            <source
              src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
              type="video/mp4"
            />
          </video>
          {
            showControls &&
            <div
              className="controls-wrapper
                absolute bottom-0
                flex flex-col
                items-center
                w-full h-fit
                p-4
                bg-liberty"
            >
              <div
                className="timeline-slider-wrapper
                  w-full h-fit"
              >
                <p>{timerContent}</p>
                <input
                  type="range"
                  min="0"
                  max={duration.toString()}
                  value={timerRangeValue}
                  onChange={onSeekHandler}
                  className="w-full cursor-pointer accent-shocking-pink"
                />
              </div>
              <div
                className="controls
                  flex items-center justify-between
                  w-full h-fit"
              >
                <div
                  className="volume-controller
                  max-sm:hidden
                  relative
                  flex gap-2"
                >
                  <span
                    onMouseOver={() => {
                      setShowVolumeSlider(true);
                      setVolumeSliderTimer(
                        setTimeout(() => {
                          setShowVolumeSlider(false);
                        }, 5000)
                      );
                    }}
                  >
                    {Number(volume) < 50 && Number(volume) !== 0 ? (
                      <FiVolume1 className="cursor-pointer" />
                    ) : Number(volume) >= 50 ? (
                      <FiVolume2 className="cursor-pointer" />
                    ) : (
                      <FiVolumeX className="cursor-pointer" />
                    )}
                  </span>
                  {showVolumeSlider && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume.toString()}
                      className="absolute left-8 top-[2px]
                      w-28 
                      cursor-pointer accent-shocking-pink"
                      onChange={onVolumeChangeHandler}
                    />
                  )}
                </div>
                <div
                  className="state-controllers
                    flex gap-4
                    items-center
                    w-fit h-fit p-3
                    rounded-full
                    bg-black border-2 border-shocking-pink"
                >
                  <FiSkipBack className="opacity-70 hover:opacity-100 cursor-pointer" />
                  {playing ? (
                    <FiPause
                      onClick={() => {
                        togglePlaying(false);
                        videoRef.current && videoRef.current.pause();
                      }}
                      className="play-pause-button
                          opacity-70 hover:opacity-100 
                          cursor-pointer"
                    />
                  ) : (
                    <FiPlay
                      onClick={() => {
                        togglePlaying(true);
                        videoRef.current && videoRef.current.play();
                      }}
                      className="play-pause-button
                          opacity-70 hover:opacity-100 
                          cursor-pointer"
                    />
                  )}
                  <FiSkipForward className="opacity-70 hover:opacity-100 cursor-pointer" />
                </div>
                <div className="controllers-right relative flex gap-4">
                  {showSpeedOptions && (
                    <div
                      className="playback-speed-options-wrapper
                        absolute bottom-0
                        flex flex-col gap-2
                        w-fit h-fit 
                        py-2 pl-2 pr-10
                        rounded-md text-white
                        bg-black"
                    >
                      {new Array(8).fill("").map((a, i) => {
                        const speed = 0.25 * (i + 1);
                        return (
                          <div key={i} className="flex gap-1">
                            <FiCheck
                              className={`
                                ${
                                  speed === playbackSpeed
                                    ? "opacity-100"
                                    : "opacity-0"
                                }
                              `}
                            />
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                setPlaybackSpeed(speed);
                                setShowSpeedOptions(false);
                                if (videoRef.current) {
                                  videoRef.current.playbackRate = speed;
                                }
                              }}
                            >
                              {speed}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="speed-controller flex">
                    <span>{playbackSpeed}x </span>
                    {showSpeedOptions ? (
                      <FiChevronDown
                        className="cursor-pointer"
                        onClick={() => setShowSpeedOptions(false)}
                      />
                    ) : (
                      <FiChevronUp
                        className="cursor-pointer"
                        onClick={() => setShowSpeedOptions(true)}
                      />
                    )}
                  </div>
                  <span onClick={() => setFullScreenMode(!fullScreenMode)}>
                    {fullScreenMode ? (
                      <FiMinimize className="size-controller cursor-pointer" />
                    ) : (
                      <FiMaximize className="size-controller cursor-pointer" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </IconContext.Provider>
  );
}
