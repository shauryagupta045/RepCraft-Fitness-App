import { initializeApp, getApp, getApps } from 'firebase/app';
import { Platform } from 'react-native';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  OAuthProvider,
  getAuth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCDTd4DihoAfVJgwgwi9GIIq97X69_EjKA",
  authDomain: "repcraft-b70f5.firebaseapp.com",
  projectId: "repcraft-b70f5",
  storageBucket: "repcraft-b70f5.firebasestorage.app",
  messagingSenderId: "1023502099998",
  appId: "1:1023502099998:web:78529e846059c33678097f",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence for React Native vs Web
export const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;
