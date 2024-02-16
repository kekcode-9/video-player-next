import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDi1G-jd1uyzZUQqX3vlQbGBUwGVx5z7ZM",
  authDomain: "video-player-app-416b0.firebaseapp.com",
  projectId: "video-player-app-416b0",
  storageBucket: "video-player-app-416b0.appspot.com",
  messagingSenderId: "740399841596",
  appId: "1:740399841596:web:f7fb6f6dcc78bd90489e39"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;