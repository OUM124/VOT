// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUDR9EkEcuFrtRo8XR2FgS26dcUKM_7DU",
  authDomain: "ratt-805fc.firebaseapp.com",
  projectId: "ratt-805fc",
  storageBucket: "ratt-805fc.firebasestorage.app",
  messagingSenderId: "398149358737",
  appId: "1:398149358737:web:de824d69079683558b1b30",
  measurementId: "G-H1V8MXB28C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };