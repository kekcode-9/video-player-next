"use client";
import { CldImage } from "next-cloudinary";
import React, { useEffect, useState, useContext, useCallback } from "react";
// dnd-kit
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
// dnd-kit
import { IconContext } from "react-icons";
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronsDown,
  FiChevronsUp,
  FiMoreVertical,
  FiMoreHorizontal,
} from "react-icons/fi";
import Typography from "./utility/typography";
import { VideoInfoType } from "@/types";
import { setDocument } from "@/firebase/firestore-access";
import { VideoContext } from "@/store/videocontext";
import actions from "@/store/actions";
import StorageKeys from "./utility/storage-constants";

const { TIMESTAMP, VIDEO_SPEED, CURRENT_VID_INDEX, SOURCE_UPDATED } =
  StorageKeys;

const { UPDATE_PLAYLIST, SET_CURRENT_VIDEO } = actions;

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
  const { currentVid } = state;

  const [currentIndex, setCurrentIndex] = useState<number>();

  useEffect(() => {
    if (currentVid) {
      setCurrentIndex(currentVid.id);
    }
  }, [currentVid]);

  const onClickHandler = () => {
    console.log(`hello`);
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        video-card 
        relative 
        flex max-sm:flex-col gap-0
        items-start 
        w-44 h-52
        sm:w-96 sm:h-28
        sm:p-2
        rounded-md 
        text-white
        cursor-pointer
        ${
          currentIndex === id
            ? "bg-shocking-pink bg-opacity-65"
            : "bg-transparent"
        }
      `}
      onClick={onClickHandler}
    >
      <div
        className="thumbnail-wrapper
          relative 
          w-full sm:w-[60%] 
          h-1/2 sm:h-full
          border rounded-md 
          overflow-hidden"
      >
        <CldImage
          src={thumb}
          fill
          className="object-cover"
          alt={`${title}-thumb`}
        />
      </div>
      <div className="info-text flex-col gap-1 w-full max-sm:p-2 sm:pl-2">
        <Typography
          additionalClasses="line-clamp-1 sm:line-clamp-2"
          size="text-base"
        >
          <b>{title}</b>
        </Typography>
        <Typography size="text-sm">
          {subtitle}-{id}
        </Typography>
      </div>
      <div>
        <FiMoreVertical className="max-sm:hidden" />
        <FiMoreHorizontal className="sm:hidden" />
      </div>
    </div>
  );
}

export default function Playlist() {
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlistData, setPlaylistData] = useState<VideoInfoType[]>();

  const { state, dispatch } = useContext(VideoContext);
  const { playlist, currentVid } = state;

  useEffect(() => {
    if (playlist) {
      setPlaylistData(playlist);
    }
  }, [playlist]);

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
      distance: 8,
    },
  });

  const sensors = typeof window !== 'undefined' &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0
      ? useSensors(touchSensor)
      : useSensors(pointerSensor));

  return (
    <IconContext.Provider
      value={{
        color: "white",
        size: "24px",
      }}
    >
      <div
        className="playlist-container
          sm:absolute z-30
          sm:right-0 sm:top-0
          flex max-sm:flex-col
          items-start justify-start
          w-screen h-fit
          sm:w-fit sm:h-screen
          bg-black"
      >
        <div
          onClick={() => {
            if (screen.width > 640) {
              setShowPlaylist(!showPlaylist);
            }
          }}
          className={`
              playlist-visibility-toggler
              flex items-center justify-center
              w-screen h-fit sm:w-fit sm:h-screen 
              pt-4 sm:pl-4 ${showPlaylist ? "sm:pr-0" : "sm:pr-4"}
          `}
        >
          {showPlaylist ? (
            <FiChevronsRight className="max-sm:hidden cursor-pointer" />
          ) : (
            <FiChevronsLeft className="max-sm:hidden cursor-pointer" />
          )}
        </div>
        <div
          className="playlist-wrapper
            w-screen h-fit
            sm:w-fit sm:h-screen
            overflow-scroll"
        >
          <div
            className={`playlist
                ${showPlaylist ? "flex" : "hidden"}
                sm:flex-col gap-2
                w-fit sm:w-full
                p-4
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
