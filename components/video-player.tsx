"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import gsap from "gsap";
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
import Typography from "./utility/typography";

const { SET_CURRENT_VIDEO, TOGGLE_PLAYLIST_EXISTENCE } = actions;

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

  const controlsRef = useRef<HTMLDivElement>(null);

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
  const [iconSize, setIconSize] = useState<string>("1.5rem");
  const [isTouchScreen, toggleIsTouchScreen] = useState<boolean>(false);

  let seekDebounceTimer: NodeJS.Timeout;

  const toggleFullScreen = (isFullscreen: boolean) => {
    setFullScreenMode(isFullscreen);
    dispatch({
      type: TOGGLE_PLAYLIST_EXISTENCE,
      payload: isFullscreen,
    });
  };

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

  const keyDownHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      toggleFullScreen(false);
    }
    const lowercaseKey = e.key.toLocaleLowerCase();
    if (videoRef.current) {
      if (lowercaseKey === "k") {
        playing ? videoRef.current.pause() : videoRef.current.play();
        togglePlaying(!playing);
      }
      if (lowercaseKey === "j" || lowercaseKey === "l") {
        const currentTime = videoRef.current.currentTime;
        if (currentTime) {
          const timeOffset = lowercaseKey === "j" ? -10 : 10;
          const {hr, min, sec} = prettifyDuration(currentTime + timeOffset);
          const timerDuration = timerContent.split(" / ")[1];
          const updatedContent = hr ? `${hr}:${min}:${sec} / ${timerDuration}` : `${min}:${sec} / ${timerDuration}`;
          setTimerContent(updatedContent);
          videoRef.current.currentTime = currentTime + timeOffset;
        }
      }
    }
  }, [playing, timerContent]);

  useEffect(() => {
    typeof window !== undefined &&
      toggleIsTouchScreen(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    const updateIconSize = () => {
      if (screen.width < 640) {
        setIconSize("1rem");
      } else {
        setIconSize("1.5rem");
      }
    };
    updateIconSize();

    const onDocClick = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        !e.target?.classList.contains("playback-speed-options-wrapper")
      ) {
        setShowSpeedOptions(false);
      }
    };

    document.addEventListener("click", onDocClick);
    window.addEventListener("resize", updateIconSize);
    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("resize", updateIconSize);
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [playing, timerContent]);

  useEffect(() => {
    if (!currentVid) {
      toggleBuffering(true);
    } else {
      toggleBuffering(false);
      setVideoObject(currentVid);
    }
  }, [currentVid]);

  useEffect(() => {
    gsap.to(controlsRef.current, {
      opacity: +showControls,
      duration: 0.15
    })
  }, [controlsRef, showControls])

  const updateSeekedTimestamp = (
    timestamp: string,
    timerCurrentState: string
  ) => {
    if (seekDebounceTimer) {
      clearTimeout(seekDebounceTimer);
    }
    setTimerRangeValue(timestamp);
    const { hr, min, sec } = prettifyDuration(Number(timestamp));
    const vidDuration = timerCurrentState.split(" / ")[1];
    seekDebounceTimer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = Number(timestamp);
        toggleBuffering(true);
      }
    }, 300)
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
            videoRef.current?.play();
            togglePlaying(true);
          })
          .catch((err) => {
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
  }, [videoRef.current?.readyState, videoObject]);

  const onSeekHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const timestamp = e.target.value;
      updateSeekedTimestamp(timestamp, timerContent);
      sessionStorage.setItem(TIMESTAMP, timestamp);
      
    },
    [timerContent]
  );

  const onTimeUpdateHandler = useCallback(() => {
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
    let currentIndex = videoObject?.id;
    const playlistLength = playlist.length;
    if (currentIndex && currentIndex !== playlistLength - 1) {
      let nextVid = playlist[(currentIndex as number) + 1];
      while (nextVid.skip) {
        if ((currentIndex + 1) < playlistLength - 1) {
          currentIndex = currentIndex + 1;
          nextVid = playlist[currentIndex + 1];
        } else {
          return;
        }
      }

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
        size: iconSize,
      }}
    >
      <div
        className={`
          player-container
          max-lg:relative max-lg:z-10
          ${readyToShow ? "opacity-100" : "opacity-0"}
          flex items-center justify-center
          ${
            fullScreenMode
              ? `w-screen h-screen z-40`
              : "w-screen max-h-[50vh] z-0"
          } 
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
            onMouseLeave={() => {
              setShowControls(false);
              setShowSpeedOptions(false);
            }}
          >
            {
              buffering &&
              <div
                className={`
                  buffer-overlay 
                  absolute top-0 left-0 z-50
                  flex items-center justify-center
                  w-full backdrop:blur-md
                  ${
                    fullScreenMode
                      ? `min-w-[100vh] 
                      max-sm:top-0 max-sm:bottom-0 max-sm:left-0 max-sm:right-0
                      sm:min-w-full sm:min-h-full max-sm:rotate-90`
                      : "h-full"
                  } bg-black bg-opacity-80
                `}
              >
                Loading...
              </div>
            }
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
                playing ? videoRef.current?.pause() : videoRef.current?.play();
                togglePlaying(!playing);
                if (isTouchScreen) {
                  setShowControls(!showControls);
                  setShowSpeedOptions(false);
                }
              }}
              onTimeUpdate={onTimeUpdateHandler}
              onEnded={loadNext}
            />
            {
              showControls && <div
                ref={controlsRef}
                className={`
                  controls-wrapper
                  absolute bottom-0
                  flex sm:flex-col
                  items-center max-sm:justify-around
                  w-full h-fit
                  sm:p-4
                  sm:bg-black
                  ${
                    fullScreenMode
                      ? "max-sm:rotate-90 max-sm:top-0 max-sm:left-0 max-sm:right-0 max-sm:m-auto"
                      : ""
                  }
                `}
              >
                <div
                  className="timeline-slider-wrapper
                    w-full h-fit"
                >
                  <div className="w-fit h-fit max-sm:p-2">
                    <Typography size="max-sm:text-sm">
                      {timerContent}
                    </Typography>
                  </div>
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
                    max-sm:absolute max-sm:top-2 max-sm:right-2
                    flex items-center justify-between
                    w-fit sm:w-full h-fit"
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
                      max-sm:hidden
                      flex gap-2 md:gap-4
                      items-center
                      w-fit h-fit p-3
                      rounded-full
                      bg-black border-2 border-shocking-pink"
                  >
                    {/*<FiSkipBack className="opacity-70 hover:opacity-100 cursor-pointer" />*/}
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
                    {/*<FiSkipForward className="opacity-70 hover:opacity-100 cursor-pointer" />*/}
                  </div>
                  <div className="controllers-right relative flex items-center gap-4">
                    {showSpeedOptions && (
                      <div
                        className={`playback-speed-options-wrapper
                          absolute z-40 max-lg:top-0 max-lg:right-8 lg:bottom-0
                          flex ${fullScreenMode ? 'sm:flex-col' : 'flex-col'} gap-2
                          w-fit h-fit 
                          py-2 pl-2 pr-10
                          rounded-md text-white
                          bg-black`}
                      >
                        {new Array(8).fill("").map((a, i) => {
                          const speed = 0.25 * (i + 1);
                          return (
                            <div
                              key={i}
                              className="flex gap-1 hover:text-shocking-pink"
                            >
                              <FiCheck
                                className={`
                                  ${
                                    speed === playbackSpeed
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }
                                `}
                              />
                              <div
                                className="w-fit h-fit cursor-pointer"
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
                                <Typography size="max-sm:text-sm">
                                  {speed}
                                </Typography>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <>
                      {showSpeedOptions ? (
                        <div
                          className="speed-controller flex items-center"
                          onClick={() => setShowSpeedOptions(false)}
                        >
                          <Typography size="max-sm:text-sm" additionalClasses="cursor-pointer">
                            {playbackSpeed}x
                          </Typography>
                          <FiChevronDown className="max-lg:hidden cursor-pointer" />
                          <FiChevronUp className="lg:hidden cursor-pointer" />
                        </div>
                      ) : (
                        <div
                          className="speed-controller flex items-center"
                          onClick={() => setShowSpeedOptions(true)}
                        >
                          <Typography size="max-sm:text-sm">
                            {playbackSpeed}x
                          </Typography>
                          <FiChevronDown className="lg:hidden cursor-pointer" />
                          <FiChevronUp className="max-lg:hidden cursor-pointer" />
                        </div>
                      )}
                    </>
                    <span onClick={() => toggleFullScreen(!fullScreenMode)}>
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
