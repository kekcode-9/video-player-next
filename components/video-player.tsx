"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { VideoContext } from "@/store/videocontext";
import { IconContext } from "react-icons";
import LoaderSvg from "./loader-svg";
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
import StorageKeys from "./utility/storage-constants";
import actions from "@/store/actions";
import { VideoInfoType } from "@/types";

const { SET_CURRENT_VIDEO } = actions;

const { CURRENT_VID_INDEX, VIDEO_SPEED, VOLUME, TIMESTAMP, SOURCE_UPDATED } =
  StorageKeys;

function SkeletonPlayer() {
  return (
    <div
      className="skeleton-player
      flex items-center justify-center
      w-screen h-[45vh]
      bg-black"
    >
      <LoaderSvg />
    </div>
  );
}

export default function VideoPlayer() {
  const { state, dispatch } = useContext(VideoContext);
  const { currentVid, playlist } = state;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [timerContent, setTimerContent] = useState<string>("00:00");
  const [timerRangeValue, setTimerRangeValue] = useState<string>("0");
  const [buffering, toggleBuffering] = useState<boolean>(false);
  const [playing, togglePlaying] = useState<boolean>(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [volume, setVolume] = useState<string>("50");
  const [volumeSliderTimer, setVolumeSliderTimer] = useState<
    NodeJS.Timeout | undefined
  >();
  const [fullScreenMode, setFullScreenMode] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [videoObject, setVideoObject] = useState<VideoInfoType>();
  const [readyToShow, toggleReadyToShow] = useState<boolean>(false);
  const [showNextVidLoader, setShowNextVidLoader] = useState<boolean>(false);
  const [nextVidCountdown, setNextVidCountdown] = useState<number>(5);

  useEffect(() => {
    if (!currentVid) {
      toggleBuffering(true);
    } else {
      toggleBuffering(false);
      setVideoObject(currentVid);
    }
  }, [currentVid]);

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

  const updateSeekedTimestamp = (
    timestamp: string,
    timerCurrentState: string
  ) => {
    setTimerRangeValue(timestamp);
    const { hr, min, sec } = prettifyDuration(Number(timestamp));
    const vidDuration = timerCurrentState.split(" / ")[1];
    if (videoRef.current) {
      videoRef.current.currentTime = Number(timestamp);
      toggleBuffering(true);
    }
    if (hr) {
      setTimerContent(`${hr}:${min}:${sec} / ${vidDuration}`);
    } else {
      setTimerContent(`${min}:${sec} / ${vidDuration}`);
    }
  };

  const setVideoExistingConfig = (timerState: string) => {
    // retrieve existing settings
    const speed = sessionStorage.getItem(VIDEO_SPEED);
    const volume = localStorage.getItem(VOLUME);
    const timestamp = sessionStorage.getItem(TIMESTAMP);

    if (videoRef.current) {
      if (volume) {
        videoRef.current.volume = Number(volume);
        setVolume((Number(volume) * 100).toString());
      }
      if (speed) {
        videoRef.current.playbackRate = Number(speed);
        setPlaybackSpeed(Number(speed));
      }
      if (timestamp) {
        /**
         * timestamp won't be there when switching to new video
         */
        updateSeekedTimestamp(timestamp, timerState);
      } else {
        setTimerRangeValue("0");
      }
    }
  };

  useEffect(() => {
    let retryTimer: NodeJS.Timeout;
    const setTimer = (vidDuration: number) => {
      const { hr, min, sec } = prettifyDuration(vidDuration);
      const timerState: string = hr
        ? `00:00:00 / ${hr}:${min}:${sec}`
        : `00:00 / ${min}:${sec}`;
      if (hr) {
        setTimerContent(timerState);
      } else {
        setTimerContent(timerState);
      }
      setVideoExistingConfig(timerState);
      toggleReadyToShow(true);
      if (sessionStorage.getItem(SOURCE_UPDATED) === "true") {
        sessionStorage.setItem(SOURCE_UPDATED, "false");
        videoRef.current
          ?.play()
          .then(() => {
            console.log("can play");
            videoRef.current?.play();
            togglePlaying(true);
          })
          .catch((err) => {
            console.log("can play not");
            togglePlaying(false);
          });
      }
    };

    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (!vidDuration) {
        setDuration(0);
        retryTimer = setInterval(() => {
          if (videoRef.current && videoRef.current.duration) {
            clearInterval(retryTimer);
            setDuration(Math.ceil(vidDuration));
            setTimer(videoRef.current.duration);
          }
        }, 1000);
      } else {
        setDuration(Math.ceil(vidDuration));
        setTimer(vidDuration);
      }
    }

    return () => {
      retryTimer && clearInterval(retryTimer);
    };
  }, [videoRef.current?.readyState]);

  const onSeekHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const timestamp = e.target.value;
      updateSeekedTimestamp(timestamp, timerContent);
      sessionStorage.setItem(TIMESTAMP, timestamp);
      // setTimerRangeValue(timestamp);
      // const { hr, min, sec } = prettifyDuration(Number(timestamp));
      // const vidDuration = timerContent.split(" / ")[1];
      // if (videoRef.current) {
      //   videoRef.current.currentTime = Number(timestamp);
      //   toggleBuffering(true);
      // }
      // if (hr) {
      //   setTimerContent(`${hr}:${min}:${sec} / ${vidDuration}`);
      // } else {
      //   setTimerContent(`${min}:${sec} / ${vidDuration}`);
      // }
    },
    [timerContent]
  );

  const onTimeUpdateHandler = useCallback(() => {
    console.log("onTimeUpdateHandler");
    if (videoRef.current) {
      const timestamp = videoRef.current.currentTime;
      const { hr, min, sec } = prettifyDuration(timestamp);
      setTimerRangeValue(timestamp.toString());
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
      localStorage.setItem(VOLUME, newVolume.toString());
      setVolumeSliderTimer(
        setTimeout(() => {
          setShowVolumeSlider(false);
        }, 5000)
      );
    },
    [volumeSliderTimer]
  );

  const loadNext = useCallback(() => {
    const currentIndex = videoObject?.id;
    if (currentIndex !== playlist.length - 1) {
      let secLeft = 5;
      setShowNextVidLoader(true);
      const nextVid = playlist[(currentIndex as number) + 1];
      dispatch({
        type: SET_CURRENT_VIDEO,
        payload: {
          ...nextVid,
        },
      });
      sessionStorage.removeItem(TIMESTAMP);
      sessionStorage.removeItem(VIDEO_SPEED);
      sessionStorage.setItem(CURRENT_VID_INDEX, nextVid.id.toString());
      sessionStorage.setItem(SOURCE_UPDATED, "true");
      //clearInterval(intervalTimer);
      setNextVidCountdown(5);
      setShowNextVidLoader(false);
      // const intervalTimer = setInterval(() => {
      //   setNextVidCountdown(secLeft);
      //   if (!secLeft) {
      //     const nextVid = playlist[currentIndex as number + 1];
      //     dispatch({
      //       type: SET_CURRENT_VIDEO,
      //       payload: {
      //         ...nextVid
      //       }
      //     });
      //     sessionStorage.removeItem(TIMESTAMP);
      //     sessionStorage.removeItem(VIDEO_SPEED);
      //     sessionStorage.setItem(CURRENT_VID_INDEX, nextVid.id.toString());
      //     sessionStorage.setItem(SOURCE_UPDATED, "true");
      //     clearInterval(intervalTimer);
      //     setNextVidCountdown(5);
      //     setShowNextVidLoader(false);
      //   }
      //   secLeft = secLeft - 1;
      // }, 1000)
    }
  }, [videoObject, playlist]);

  if (!currentVid) {
    return (
      <div
        className="skeleton-player-wrapper 
        absolute top-0 left-0 z-20"
      >
        <SkeletonPlayer />
      </div>
    );
  }

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
          ${readyToShow ? "opacity-100" : "opacity-0"}
          flex items-center justify-center
          ${fullScreenMode ? `w-screen h-screen` : "w-screen max-h-[50vh]"} 
          bg-black
          text-white
        `}
      >
        {/*
              showNextVidLoader &&
              <div
                className={`next-video-countdown-overlay
                absolute top-0 left-0 z-20
                flex items-center justify-center
                ${
                  fullScreenMode
                  ? "min-w-[100vh] sm:min-w-full sm:min-h-full max-sm:rotate-90"
                  : "min-w-[70%] sm:max-h-[50vh]"
                }
                bg-dark-charcoal bg-opacity-25`}
              >hey there</div> */}
        {
          // videoObject &&
          <div
            className={`
              player-wrapper 
              relative
              ${fullScreenMode ? "w-screen h-screen" : "w-fit h-full"}
              flex items-center justify-center
              bg-black
            `}
            onMouseEnter={() => readyToShow && setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              src={videoObject?.sources[0]}
              poster={videoObject?.thumb}
              preload="auto"
              className={`${
                fullScreenMode
                  ? "min-w-[100vh] sm:min-w-full sm:min-h-full max-sm:rotate-90"
                  : "min-w-[70%] sm:max-h-[50vh]"
              }`}
              ref={videoRef}
              onClick={() => {
                if (screen.width >= 768) {
                  playing
                    ? videoRef.current?.pause()
                    : videoRef.current?.play();
                  togglePlaying(!playing);
                } else {
                  setShowControls(!showControls);
                }
              }}
              onTimeUpdate={onTimeUpdateHandler}
              onEnded={loadNext}
            />
            {showControls && (
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
                                  sessionStorage.setItem(
                                    VIDEO_SPEED,
                                    speed.toString()
                                  );
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
            )}
          </div>
        }
      </div>
      <div
        className={`skeleton-player-wrapper
          ${readyToShow ? "hidden" : "block"}
          absolute top-0 left-0 z-20
        `}
      >
        <SkeletonPlayer />
      </div>
    </IconContext.Provider>
  );
}
