import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // Uncomment if using Firebase Auth

import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCwFnBqsv-beSMG-5yg_F44R_-dSlHFjxQ",
  authDomain: "tourdacelia.firebaseapp.com",
  projectId: "tourdacelia",
  storageBucket: "tourdacelia.firebasestorage.app",
  messagingSenderId: "819757325866",
  appId: "1:819757325866:web:a9cd9b0a672cc547b3ed53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
