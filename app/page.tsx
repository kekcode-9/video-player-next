import HomeWrapper from "@/components/home-wrapper";
import db from "@/firebase/firebase.config";
import { addDoc, collection } from "firebase/firestore";

type VideoInfoType = {
  description: string;
  sources: string[];
  subtitle: string;
  thumb: string;
  title: string;
  id: number;
};

async function uploadData(video: VideoInfoType) {
  try {
    const docRef = await addDoc(collection(db, 'playlist'), {
      ...video
    });
  } catch(err) {}
}

export default async function Home() {
  // const data = await import('@/data/data.json');
  // data.videos.map((video, i) => {
  //   uploadData(video);
  // })
  return <HomeWrapper />
}
