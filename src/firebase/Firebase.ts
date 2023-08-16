
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAU3fker57ULWsSnUYLPNCpMbC8muwcuiI",
  authDomain: "web-cms-tiket.firebaseapp.com",
  projectId: "web-cms-tiket",
  storageBucket: "web-cms-tiket.appspot.com",
  messagingSenderId: "743669178100",
  appId: "1:743669178100:web:09d7b2840e62a37438c8a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
