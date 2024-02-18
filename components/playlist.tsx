"use client";
import { CldImage } from "next-cloudinary";
import React, { 
  useEffect, 
  useState, 
  useContext, 
  useCallback, 
  useRef 
} from "react";
import gsap from "gsap";
// dnd-kit imports start here
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// dnd-kit imports end here
import { IconContext } from "react-icons";
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronsDown,
  FiChevronsUp,
  FiMoreVertical,
  FiMoreHorizontal,
  FiCheck,
} from "react-icons/fi";
import { VscGrabber } from "react-icons/vsc";
import Typography from "./utility/typography";
import { VideoInfoType } from "@/types";
import { setDocument } from "@/firebase/firestore-access";
import { VideoContext } from "@/store/videocontext";
import actions from "@/store/actions";
import StorageKeys from "./utility/storage-constants";

const { TIMESTAMP, VIDEO_SPEED, CURRENT_VID_INDEX, SOURCE_UPDATED } =
  StorageKeys;

const { 
  UPDATE_PLAYLIST, 
  SET_CURRENT_VIDEO, 
  SET_MOVE_INFO_UP,
} = actions;

function VideoCard({ video }: { video: VideoInfoType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const { subtitle, thumb, title, id } = video;
  const { state, dispatch } = useContext(VideoContext);
  const { currentVid, playlist } = state;

  const [currentIndex, setCurrentIndex] = useState<number>();
  const [showSkipOption, toggleShowSkipOption] = useState<boolean>(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if ( e.target instanceof HTMLElement ) {
        toggleShowSkipOption(false);
      }
    }

    document.addEventListener("click", onDocClick);

    return () => {
      document.removeEventListener("click", onDocClick);
    }
  }, [])

  useEffect(() => {
    if (currentVid) {
      setCurrentIndex(currentVid.id);
    }
  }, [currentVid]);

  const onClickHandler = useCallback(() => {
    if (video.skip) {
      return;
    }
    sessionStorage.removeItem(TIMESTAMP);
    sessionStorage.removeItem(VIDEO_SPEED);

    dispatch({
      type: SET_CURRENT_VIDEO,
      payload: {
        ...video,
      },
    });
    sessionStorage.setItem(CURRENT_VID_INDEX, video.id.toString());
    sessionStorage.setItem(SOURCE_UPDATED, "true");
  }, [video]);

  const updateVideoToSkip = useCallback(() => {
    if (!video.skip && currentIndex === id) {
      alert('Cannot skip video that is playing already');
      return;
    }
    const updatedPlaylist: VideoInfoType[] = [...playlist];
    updatedPlaylist[id] = {
      ...updatedPlaylist[id],
      skip: !video.skip
    };
    dispatch({
      type: UPDATE_PLAYLIST,
      payload: [...updatedPlaylist]
    });
    setDocument(updatedPlaylist[id].docId, {
      ...updatedPlaylist[id],
    });
  }, [video, playlist, currentIndex])

  return (
    <IconContext.Provider
      value={{
        color: 'white',
        size: '20px'
      }}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={`
          video-card 
          relative 
          flex gap-0
          items-center 
          w-[15rem] h-52
          lg:w-96 lg:h-28
          max-lg:pr-1 max-lg:py-1 lg:p-2
          rounded-md 
          text-white
          cursor-pointer
          ${
            currentIndex === id && !video.skip
              ? "bg-shocking-pink bg-opacity-65"
              : (
                video.skip ? "bg-gray opacity-60" : "bg-transparent"
              )
          }
        `}
      >
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center 
          h-full 
          pl-1 pr-2 cursor-move"
        >
          <VscGrabber />
        </div>
        <div
          className="card-content-wrapper
          w-full h-full
          flex max-lg:flex-col gap-1
          "
        >
          <div
            className="thumbnail-wrapper
            relative
            w-full h-full
            border rounded-md
            overflow-hidden"
            onClick={onClickHandler}
          >
            <CldImage
              src={thumb}
              fill
              className="object-cover"
              alt={`${title}-thumb`}
            />
          </div>
          <div 
            className="info-text 
            flex-col gap-1 
            w-full lg:h-full
            max-lg:p-2 lg:pl-2"
            onClick={onClickHandler}
          >
            <Typography
              additionalClasses="line-clamp-1 lg:line-clamp-2"
              size="text-base"
            >
              <b>{title}</b>
            </Typography>
            <Typography
              additionalClasses="line-clamp-1 lg:line-clamp-2"
              size="text-sm"
            >
              {subtitle}
            </Typography>
          </div>
          <div 
            className="relative max-lg:px-2" 
            onClick={(e) => {
              e.preventDefault();
              toggleShowSkipOption(true);
            }}
          >
            <FiMoreVertical className="max-lg:hidden" />
            <FiMoreHorizontal className="lg:hidden" />
            {
              showSkipOption &&
              <div 
                className="skip-option-wrapper
                absolute 
                max-lg:top-0 max-lg:left-[1.5rem] lg:right-0
                flex items-center gap-1 
                w-max h-fit 
                py-2 px-4
                bg-black"
                onClick={updateVideoToSkip}
              >
                {
                  video.skip &&
                  <FiCheck />
                }
                <Typography additionalClasses="text-nowrap">
                  Skip video
                </Typography>
              </div>
            }
          </div>
        </div>
      </div>
    </IconContext.Provider>
  );
}

export default function Playlist() {
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlistData, setPlaylistData] = useState<VideoInfoType[]>();
  const [iconSize, setIconSize] = useState<string>("1.5rem");
  const [lastScreenSize, setLastScreenSize] = useState<number>();

  const containerRef = useRef<HTMLDivElement>(null);

  const { state, dispatch } = useContext(VideoContext);
  const { playlist, currentVid, hidePlaylist } = state;

  useEffect(() => {
    let playlistVisibilityTimeout: NodeJS.Timeout;
    if (playlist) {
      setPlaylistData(playlist);
    }

    return () => {
      if (playlistVisibilityTimeout) {
        clearTimeout(playlistVisibilityTimeout);
      }
    }
  }, [playlist]);

  useEffect(() => {
    if (screen.width > 1024) {
      gsap.to(containerRef.current, {
        translateX: showPlaylist ? '0px' : '410px'
      })
    } else {
      gsap.to(containerRef.current, {
        translateY: showPlaylist ? '0px' : '-226px',
        delay: showPlaylist ? 0.3 : 0
      });
      dispatch({
        type: SET_MOVE_INFO_UP,
        payload: !showPlaylist
      })
    }
  }, [showPlaylist, containerRef])

  useEffect(() => {
    const adjustToResize = () => {
      // update icon size
      if (screen.width < 768) {
        setIconSize("1rem");
      } else {
        setIconSize("1.5rem");
      }

      // set playlist to neutral position
      if (containerRef.current && lastScreenSize) {
        if (lastScreenSize >= 1024 && screen.width < 1024) {
          gsap.set(containerRef.current, {
            translateX: 0,
          });
          setShowPlaylist(true);
        } else if (lastScreenSize < 1024 && screen.width >= 1024) {
          gsap.set(containerRef.current, {
            translateY: 0
          });
          setShowPlaylist(true);
          dispatch({
            type: SET_MOVE_INFO_UP,
            payload: false
          })
        }
      }
      setLastScreenSize(screen.width);
    };
    adjustToResize();

    window.addEventListener("resize", adjustToResize);

    return () => {
      window.removeEventListener("resize", adjustToResize);
    };
  }, [lastScreenSize]);

  const dragEndHandler = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || !playlistData) {
        return;
      }
      if (active.id === over.id) {
        return;
      }
      const updatedPlaylist = [...playlistData];
      const oldIndex = playlistData.findIndex((user) => user.id === active.id);
      const newIndex = playlistData.findIndex((user) => user.id === over.id);

      const currentIndex = Number(sessionStorage.getItem(CURRENT_VID_INDEX));
      let updatedCurrentIndex: number = -1;

      if (oldIndex < newIndex) {
        // moving down
        for (let i = oldIndex; i <= newIndex; i++) {
          let updatedIndex: number;
          if (i !== oldIndex) {
            updatedIndex = i - 1;
            updatedPlaylist[i] = {
              ...updatedPlaylist[i],
              id: updatedIndex,
            };
          } else {
            updatedPlaylist[i] = {
              ...updatedPlaylist[i],
              id: newIndex,
            };
            updatedIndex = newIndex;
          }

          setDocument(updatedPlaylist[i].docId, {
            ...updatedPlaylist[i],
          });

          if (i === currentIndex) {
            updatedCurrentIndex = updatedIndex;
          }
        }
      } else if (oldIndex > newIndex) {
        // moving up
        for (let i = newIndex; i <= oldIndex; i++) {
          let updatedIndex: number;
          if (i !== oldIndex) {
            updatedIndex = i + 1;
            updatedPlaylist[i] = {
              ...updatedPlaylist[i],
              id: updatedIndex,
            };
          } else {
            updatedPlaylist[i] = {
              ...updatedPlaylist[i],
              id: newIndex,
            };
            updatedIndex = newIndex;
          }

          setDocument(updatedPlaylist[i].docId, {
            ...updatedPlaylist[i],
          });

          if (i === currentIndex) {
            updatedCurrentIndex = updatedIndex;
          }
        }
        // setPlaylistData(arrayMove([...updatedPlaylist], oldIndex, newIndex));
      }

      const sortedPlaylist = [
        ...arrayMove([...updatedPlaylist], oldIndex, newIndex),
      ];
      setPlaylistData(sortedPlaylist);

      dispatch({
        type: UPDATE_PLAYLIST,
        payload: [...sortedPlaylist],
      });

      if (updatedCurrentIndex >= 0) {
        sessionStorage.setItem(
          CURRENT_VID_INDEX,
          updatedCurrentIndex.toString()
        );
        dispatch({
          type: SET_CURRENT_VIDEO,
          payload: {
            ...(currentVid as VideoInfoType),
            id: updatedCurrentIndex,
          },
        });
      }

      updatedCurrentIndex !== -1 &&
        sessionStorage.setItem(
          CURRENT_VID_INDEX,
          updatedCurrentIndex.toString()
        );
    },
    [playlistData, currentVid]
  );

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: 1,
    },
  });

  const sensors =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0
      ? useSensors(touchSensor)
      : useSensors(pointerSensor));

  if (hidePlaylist) {
    return;
  }

  return (
    <IconContext.Provider
      value={{
        color: "white",
        size: iconSize,
      }}
    >
      <div
        ref={containerRef}
        className={`
          playlist-container
          lg:absolute lg:z-[60]
          lg:right-0 lg:top-0
          flex max-lg:flex-col-reverse
          items-start justify-start
          w-screen h-fit
          lg:w-fit lg:h-screen
          bg-jacarta
        `}
      >
        <div
          onClick={() => {
            setShowPlaylist(!showPlaylist);
          }}
          className={`
              playlist-visibility-toggler
              flex items-center justify-center
              w-screen h-fit lg:w-fit lg:h-screen 
              py-4 lg:pl-4 ${showPlaylist ? "lg:pr-0" : "lg:pr-4"}
          `}
        >
          {showPlaylist ?
            <>
              <FiChevronsRight className="max-lg:hidden cursor-pointer" />
              <FiChevronsUp className="lg:hidden cursor-pointer" />
            </> :
            <>
              <FiChevronsLeft className="max-lg:hidden cursor-pointer" />
              <div
                className="lg:hidden cursor-pointer
                flex gap-1 items-center 
                w-fit h-fit
                text-white
                "
              >
                <Typography >Playlist</Typography>
                <FiChevronsDown />
              </div>
            </>
          }
        </div>
        <div
          className="playlist-wrapper
            w-screen h-fit
            lg:w-fit lg:h-screen
            overflow-scroll lg:overflow-x-hidden"
        >
          <div
            className={`playlist
                flex lg:flex-col gap-2
                w-fit lg:w-full
                max-lg:px-4 max-lg:pt-4 lg:p-4
            `}
          >
            {playlistData && sensors && (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={dragEndHandler}
                sensors={sensors}
              >
                <SortableContext
                  items={playlistData}
                  strategy={verticalListSortingStrategy}
                >
                  {playlistData.map((vidInfo, i) => {
                    return <VideoCard key={vidInfo.id} video={vidInfo} />;
                  })}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </IconContext.Provider>
  );
}
