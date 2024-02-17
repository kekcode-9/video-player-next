This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Production Link
Deployed to Vercel: [https://video-playlist-next.vercel.app/]

## To note
### Important
.env.local has been added temporarily so anyone taking a pull will have the env variables to run the app locally. 
**This file will be removed on wednesday, 21st February.**

### About the app:
1. Playlist reordering ( DnD - Kit used )
- To reorder the playlist, grab and drag a video to the desired position in the playlist.
- First video cannot be dragged but another video can be dragged up to be placed at first position.
- Sadly, on phone the scroll is somewhat glitchy ( going to see if I can buid a drag handle for that )
3. Video skip functionality
- The cards on the playlist have a three dots button. Click on it to see the “skip video” option. Skipped videos won’t be played when their turn comes.
- The property is stored on the document for each video.
- P.s. autoplay after a skipped video is still under work
4. Player properties retention ( same tab and different tabs )
- Only volume will be retained across tabs ( since it is usually more of a persistent preference for users )
- Video speed, timestamp ( only when manually sought by user on timeline ), and currently playing video will be retained on the same tab refresh but not across tabs.
5. Video timeline navigation with keys:
- “k” will toggle play/pause
- “j” will move back in timeline by 10 sec
- “l” moves forward in time by 10 sec

p.s.
**On full screen mode for smaller devices. The controls are smack dab in the middle of the screen. I have implemented the full screen for mobile with rotation for now due to orientation not having permission. This will be fixed in the next iteration (hopefully with orientation)**.
