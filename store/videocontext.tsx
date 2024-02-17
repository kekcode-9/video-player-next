"use client";
import React, { createContext, useReducer, Dispatch } from "react";
import { VideoInfoType } from "@/types";
import actions from "./actions";

const { 
  SET_CURRENT_VIDEO, 
  UPDATE_PLAYLIST, 
  TOGGLE_PLAYLIST_EXISTENCE, 
  SET_MOVE_INFO_UP
} = actions;

type ActionType = {
  type: (typeof actions)[keyof typeof actions];
  payload: VideoInfoType | VideoInfoType[] | boolean;
};

type InitialStateType = {
  currentVid: VideoInfoType | undefined;
  playlist: VideoInfoType[] | [];
  hidePlaylist: boolean;
  moveInfoUp: boolean;
};

const initialState: InitialStateType = {
  currentVid: undefined,
  playlist: [],
  hidePlaylist: false,
  moveInfoUp: false
};

// reducer
function reducer(state: InitialStateType, action: ActionType) {
  const { type, payload } = action;

  switch (type) {
    case SET_CURRENT_VIDEO: {
      const finalState: InitialStateType = {
        ...state,
        currentVid: payload as VideoInfoType,
      };
      return finalState;
    }
    case UPDATE_PLAYLIST: {
      const finalState: InitialStateType = {
        ...state,
        playlist: [...(payload as VideoInfoType[])],
      };
      return finalState;
    }
    case TOGGLE_PLAYLIST_EXISTENCE: {
      const finalState: InitialStateType = {
        ...state,
        hidePlaylist: payload as boolean
      }
      return finalState;
    }
    case SET_MOVE_INFO_UP: {
      const finalState: InitialStateType = {
        ...state,
        moveInfoUp: payload as boolean
      }
      return finalState;
    }
    default:
      return state;
  }
}

type VideoContextType = {
  state: InitialStateType;
  dispatch: Dispatch<ActionType>;
};

export const VideoContext = createContext<VideoContextType>({
  state: initialState,
  dispatch: () => null,
});

export default function VideoContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <VideoContext.Provider value={{ state, dispatch }}>
      {children}
    </VideoContext.Provider>
  );
}
