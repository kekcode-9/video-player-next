This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Production Link
Deployed to Vercel: [https://video-playlist-next.vercel.app/]

## To note
### Important
.env.local has been added temporarily so anyone taking a pull will have the env variables to run the app locally. 
**This file will be removed on wednesday, 21st February.**

### About the app:
1. Playlist reordering ( DnD - Kit used )
    a. To reorder the playlist, grab and drag a video to the desired position in the playlist.
    b. First video cannot be dragged but another video can be dragged up to be placed at first position.
2. Video skip functionality
    a. The cards on the playlist have a three dots button. Click on it to see the “skip video” option. Skipped videos won’t be played when their turn comes.
    b. The property is stored on the document for each video.
    c. P.s. autoplay after a skipped video is still under work
3. Player properties retention ( same tab and different tabs )
    a. Only volume will be retained across tabs ( since it is usually more of a persistent preference for users )
    b. Video speed, timestamp ( only when manually sought by user on timeline ), and currently playing video will be retained on the same tab refresh but not across tabs.
4. Video timeline navigation with keys:
    a. “k” will toggle play/pause
    b. “j” will move back in timeline by 10 sec
    c. “l” moves forward in time by 10 sec
