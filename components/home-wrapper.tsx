"use client";
import React, { useEffect, useContext } from 'react';
import { VideoContext } from '@/store/videocontext';
import VideoPlayer from './video-player';
import VideoInfoSection from './video-info-section';
import Playlist from './playlist';
import { getAllDocs } from '@/firebase/firestore-access';
import actions from '@/store/actions';
import StorageKeys from './utility/storage-constants';
import { VideoInfoType } from '@/types';

const { CURRENT_VID_INDEX } = StorageKeys;

const { SET_CURRENT_VIDEO, UPDATE_PLAYLIST } = actions;

export default function HomeWrapper() {
    const { dispatch } = useContext(VideoContext);

    const getData = async () => {
        try {
          const data = await getAllDocs();
          if (data.length) {
            dispatch({
              type: UPDATE_PLAYLIST,
              payload: data
            });
            return data;
          } else {
            // alert("Failed to load videos. Please refresh the page to try again.");
          }
        } catch (err) {
          // alert(`Failed to fetch videos. Please refresh the page to try again`);
          console.log(`playlist fetch failed with error: ${err}`);
        }
      };
    
    useEffect(() => {
        getData()
        .then((data) => {
            const currIndex = sessionStorage.getItem(CURRENT_VID_INDEX);
            dispatch({
                type: SET_CURRENT_VIDEO,
                payload: currIndex ? {
                    ...(data as VideoInfoType[])[Number(currIndex)]
                } : {
                    ...(data as VideoInfoType[])[0]
                }
            });
            !currIndex && sessionStorage.setItem(CURRENT_VID_INDEX, "0");
        })
        .catch((err) => {})
    }, [])

  return (
    <>
        <VideoPlayer />
        <Playlist />
        <VideoInfoSection />
    </>
  )
}
