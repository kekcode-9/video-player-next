"use server";
import { VideoInfoType } from "@/types";
import db from "./firebase.config";
import { DocumentData, collection, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";

const COLLECTION = "playlist";

export async function setDocument(docId: string, document: Omit<VideoInfoType, 'docId'>) {
    return new Promise((res, rej) => {
        setDoc(doc(db, COLLECTION, docId), document)
        .then(() => res('document update successul'))
        .catch((err) => rej(`document update failed with error: ${err}`));
    })
}

export async function getAllDocs() {
    const collectionRef = collection(db, COLLECTION);
    const q = query(collectionRef, orderBy("id"));

    const snapshot = await getDocs(q);
    const allDocs: VideoInfoType[] = [];
    snapshot.forEach((doc) => {
        allDocs.push({
            ...doc.data() as VideoInfoType,
            docId: doc.id,
        })
    });
    
    return allDocs;
}