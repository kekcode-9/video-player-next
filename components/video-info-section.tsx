"use client";
import React, { useContext, useEffect, useState } from 'react';
import { VideoContext } from '@/store/videocontext';
import Typography from './utility/typography';
import { VideoInfoType } from '@/types';

export default function VideoInfoSection() {
    const { state } = useContext(VideoContext);
    const { currentVid } = state;
    
    const [videoInfo, setVideoInfo] = useState<VideoInfoType>();

    useEffect(() => {
        currentVid && setVideoInfo(currentVid);
    }, [currentVid]);

  return (
    <section
        className='vid-info-section
        flex flex-col'
    >
        {
            videoInfo &&
            <>
                <Typography isHeader>
                    {videoInfo.title}
                </Typography>
                <Typography isSubHeader>
                    {videoInfo.subtitle}
                </Typography>
                <Typography>
                    {videoInfo.description}
                </Typography>
            </>
        }
    </section>
  )
}
