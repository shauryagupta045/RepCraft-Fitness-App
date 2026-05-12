import { initializeApp, getApp, getApps } from 'firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { Platform } from 'react-native';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (Modular)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase (Compat) - Required for expo-firebase-recaptcha on Web
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Auth with persistence for React Native vs Web
export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

export const googleProvider = new GoogleAuthProvider();

export default app;
