import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfM2KW1sO4o18gviLz52qRaPAEdkApeq8",
  authDomain: "com.felipefracasso.projACE",
  projectId: "appace-1",
  storageBucket: "appace-1.firebasestorage.app",
  messagingSenderId: "1033980081448",
  appId: "1:1033980081448:android:44bc8bf60b1077f75b4c1d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
