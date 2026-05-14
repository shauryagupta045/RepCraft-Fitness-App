# RepCraft — AI-Powered Fitness & Workout Companion

RepCraft is a comprehensive fitness application built with **React Native (Expo)** that leverages cutting-edge AI to help users track their workouts, monitor their form in real-time, and stay consistent with their fitness goals.

![RepCraft Screenshot](./frontend/assets/icon.png)

## 🚀 Key Features

### 🤖 AI Form Tracker (Real-Time)
The flagship feature of RepCraft is the real-time AI Exercise Form Tracker.
- **Pose Detection**: Uses MediaPipe Pose (via a high-performance WebView bridge) to track 33 body landmarks.
- **Skeleton Overlay**: Real-time rendering of your skeleton using `@shopify/react-native-skia` for low-latency visual feedback.
- **Exercise Intelligence**: Specific analysis logic for:
  - **Push-ups**: Tracks elbow depth and hip alignment.
  - **Squats**: Monitors knee angle and back posture.
  - **Bicep Curls**: Ensures full range of motion and prevents momentum usage.
  - **Shoulder Press**: Tracks vertical extension and torso stability.
  - **Lunges**: Monitors knee positioning and balance.
  - **Planks**: Time-based tracking with hip-sag detection.
- **Instant Feedback**: Voice guidance (via `expo-speech`) and haptic feedback on every rep.

### 🏋️ Workout Management
- **Routine Builder**: Create custom workout plans.
- **Exercise Library**: Access a database of exercises with detailed instructions.
- **Active Workout**: track sets, reps, and rest times with an interactive UI.
- **History**: View past performance and progress metrics.

### 📊 Performance Metrics
- **Dynamic Streak Tracking**: Keeps you motivated by tracking daily consistency.
- **Sleep & Metrics**: Log health data to see the full picture of your fitness journey.

## 🛠️ Technical Architecture

### AI Bridge Logic
Since MediaPipe Pose requires WebAssembly/WebGL which are not natively available in standard React Native environments, RepCraft implements a **Hybrid Bridge**:
1. **PoseWebView**: A full-screen hidden-optimized WebView that runs the MediaPipe engine.
2. **Camera Integration**: The WebView owns the camera feed via `getUserMedia` (Android/iOS) to ensure hardware acceleration.
3. **Data Pipeline**: Landmark data is piped back to React Native via `postMessage`.
4. **Native Rendering**: React Native handles the UI, Skia skeleton, voice feedback, and workout state logic for a smooth, premium experience.

### Tech Stack
- **Frontend**: React Native, Expo SDK 50+
- **Animation**: React Native Reanimated
- **AI Engine**: MediaPipe Pose Landmarker
- **Navigation**: React Navigation (Stack & Tabs)
- **Backend**: Firebase (Auth, Firestore)

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shauryagupta045/RepCraft-Fitness-App
   cd RepCraft2/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the `frontend` directory with your Firebase credentials:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   ```

4. **Start the application**:
   ```bash
   npx expo start
   ```


## 📄 License
This project is for educational and personal fitness tracking purposes.
