import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Click on the web icon (</>) to add a web app
// 4. Register your app and copy the config values below
const firebaseConfig = {
  apiKey: "AIzaSyAgNHimOjBOX0YNtLfpls9GfWrybO_evGY",
  authDomain: "gravel-e234d.firebaseapp.com",
  projectId: "gravel-e234d",
  storageBucket: "gravel-e234d.firebasestorage.app",
  messagingSenderId: "198429095053",
  appId: "1:198429095053:web:a869dddbdd9f09b0135ec4",
  measurementId: "G-FVL0GSCNWL"
};

// Initialize Firebase
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 