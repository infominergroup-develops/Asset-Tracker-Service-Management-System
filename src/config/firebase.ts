import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyAirzIM3nGR7qLvF3cEZ3POhBgWFInA5iQ",
  authDomain: "assettracker-fc1c8.firebaseapp.com",
  databaseURL: "https://assettracker-fc1c8-default-rtdb.firebaseio.com",
  projectId: "assettracker-fc1c8",
  storageBucket: "assettracker-fc1c8.firebasestorage.app",
  messagingSenderId: "853169489424",
  appId: "1:853169489424:web:18032bc768cadcb7ee2c95",
  measurementId: "G-WJS4HT28VK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app); // Analytics can be disabled for local dev/testing if it causes issues
