import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const metaEnv = (import.meta as any).env || {};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAgtgzjbhWH3WroWxN9p7MgpEFHnplSPEo",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "majanyaji.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "majanyaji",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "majanyaji.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "45880697108",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:45880697108:web:c695173861656f17202201",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-K1XW4DDQ1M",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let analyticsInstance: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);

    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          try {
            analyticsInstance = getAnalytics(app);
          } catch (e) {
            console.warn('Analytics initialization failed:', e);
          }
        }
      });
    }
    console.info('Firebase successfully initialized for Majanya Ji.');
  } catch (error) {
    console.warn('Firebase initialization error, using local fallback mode:', error);
  }
} else {
  console.info('Firebase not configured with API keys. Operating in offline/local fallback mode.');
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const analytics = analyticsInstance;
export const googleProvider = new GoogleAuthProvider();
export { app };

