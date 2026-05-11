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
  apiKey: "AIzaSyCDTd4DihoAfVJgwgwi9GIIq97X69_EjKA",
  authDomain: "repcraft-b70f5.firebaseapp.com",
  projectId: "repcraft-b70f5",
  storageBucket: "repcraft-b70f5.firebasestorage.app",
  messagingSenderId: "501620225291",
  appId: "1:501620225291:web:5535bb76e756b31ede1e0e",
  measurementId: "G-FZ7C80X1W2"
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
