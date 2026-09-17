// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfFpLeRI61e0QATN_h8H8cOLI5I_C308I",
  authDomain: "art-artiest.firebaseapp.com",
  projectId: "art-artiest",
  storageBucket: "art-artiest.firebasestorage.app",
  messagingSenderId: "12805021446",
  appId: "1:12805021446:web:f173535adc55b9c57a8887",
  measurementId: "G-MY2YWS38XE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export Firebase services
export { app, analytics, auth, googleProvider };

// Export auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const createUserWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logoutFirebase = () => signOut(auth);

// Get current user
export const getCurrentUser = () => new Promise((resolve, reject) => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    unsubscribe();
    resolve(user);
  }, reject);
});

// Get ID token
export const getIdToken = () => auth.currentUser?.getIdToken();
