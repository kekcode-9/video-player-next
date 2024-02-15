"use client";
import React, { useState } from 'react';
import { IconContext } from 'react-icons';
import { 
    FiChevronsLeft, 
    FiChevronsRight, 
    FiChevronsDown, 
    FiChevronsUp 
} from 'react-icons/fi';

type VideoInfoType = {
    description: string;
    sources: string[];
    subtitle: string;
    thumb: string;
    title: string;
}

function VideoCard({
    video
}: {
    video?: VideoInfoType
}) {
    return (
        <div className='video-card w-72 h-48 border border-white rounded-md'></div>
    )
}

export default function Playlist() {
    const [showPlaylist, setShowPlaylist] = useState(true);
  return (
    <IconContext.Provider
        value={{
            color: "white",
            size: "24px",
        }}
    >
        <div
            className='playlist-container
            sm:absolute 
            sm:right-0 sm:top-0
            flex max-sm:flex-col
            items-start justify-start
            w-screen h-fit
            sm:w-fit sm:h-screen 
            overflow-scroll
            bg-black'
        >   
            <div
                onClick={() => {
                    if(screen.width > 640) {
                        setShowPlaylist(!showPlaylist);
                    }
                }}
                className={`
                    playlist-visibility-toggler
                    flex items-center justify-center
                    w-screen h-fit sm:w-fit sm:h-screen 
                    pt-6 sm:pl-6 ${showPlaylist ? 'sm:pr-0' : 'sm:pr-6'}
                `}
            >
                {
                    showPlaylist ?
                    <FiChevronsRight className='max-sm:hidden cursor-pointer' /> :
                    <FiChevronsLeft className='max-sm:hidden cursor-pointer' />
                }
            </div>
            <div
                className={`playlist
                    ${showPlaylist ? 'flex' : 'hidden'}
                    sm:flex-col gap-4
                    w-fit sm:w-full
                    p-6
                `}
            >
                {
                    new Array(14).fill('').map((a, i) => {
                        return (
                            <VideoCard key={i} />
                        )
                    })
                }
            </div>
        </div>
    </IconContext.Provider>
  )
}
