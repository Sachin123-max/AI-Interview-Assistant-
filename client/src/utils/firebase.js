
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-b8323.firebaseapp.com",
  projectId: "interviewiq-b8323",
  storageBucket: "interviewiq-b8323.firebasestorage.app",
  messagingSenderId: "913918994093",
  appId: "1:913918994093:web:68cf38ffb1848088994824"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth, provider} 