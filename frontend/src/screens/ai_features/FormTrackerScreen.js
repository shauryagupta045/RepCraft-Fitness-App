/**
 * FormTrackerScreen.js
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView }   from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Speech        from 'expo-speech';
import * as Haptics       from 'expo-haptics';
import { Ionicons }       from '@expo/vector-icons';

import { COLORS, FONTS, SHADOWS } from '../../constants/theme';

import usePoseDetection  from './formTracker/hooks/usePoseDetection';
import useWorkoutState   from './formTracker/hooks/useWorkoutState';
import SkeletonOverlay   from './formTracker/components/SkeletonOverlay';
import RepCounter        from './formTracker/components/RepCounter';
import FormFeedback      from './formTracker/components/FormFeedback';
import ExercisePicker    from './formTracker/components/ExercisePicker';
import PoseWebView       from './formTracker/components/PoseWebView';

import analyzePushup        from './formTracker/exercises/pushup';
import analyzeSquat         from './formTracker/exercises/squat';
import analyzeBicepCurl     from './formTracker/exercises/bicepCurl';
import analyzeShoulderPress from './formTracker/exercises/shoulderPress';
import analyzeLunge         from './formTracker/exercises/lunge';
import analyzePlank         from './formTracker/exercises/plank';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const ANALYSERS = {
  pushup:        analyzePushup,
  squat:         analyzeSquat,
  bicepCurl:     analyzeBicepCurl,
  shoulderPress: analyzeShoulderPress,
  lunge:         analyzeLunge,
  plank:         analyzePlank,
};

const EXERCISE_LABELS = {
  pushup:        'Push-up',
  squat:         'Squat',
  bicepCurl:     'Bicep Curl',
  shoulderPress: 'Shoulder Press',
  lunge:         'Lunge',
  plank:         'Plank',
};

export default function FormTrackerScreen({ navigation }) {
  const {
    landmarks,
    frameDimensions,
    isReady,
    error: poseError,
    permission: cameraPerm,
    requestPermission: requestCameraPerm,
    onLandmarks,
    onReady,
    onWebViewError,
  } = usePoseDetection();

  // On some Androids, getUserMedia in WebView needs mic permission even for video-only
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  const handleGrantAll = async () => {
    const c = await requestCameraPerm();
    const m = await requestMicPerm();
    if (!c.granted || !m.granted) {
      Alert.alert('Permissions Needed', 'Both Camera and Microphone are required for real-time AI tracking.');
    }
  };

  const hasPerms = cameraPerm?.granted && micPerm?.granted;

  const {
    exercise,
    reps,
    stage,
    holdTime,
    feedback,
    goodForm,
    isActive,
    startSession,
    endSession,
    resetReps,
    switchExercise,
    updateFromAnalysis,
    startPlankTimer,
    stopPlankTimer,
  } = useWorkoutState();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [isPaused,      setIsPaused]      = useState(false);
  const [elapsedSecs,   setElapsedSecs]   = useState(0);
  const [jointColors,   setJointColors]   = useState({});
  const [statusMsg,     setStatusMsg]     = useState('Starting...');

  const stateRef         = useRef({ reps: 0, stage: null, holdTime: 0 });
  const lastSpokenRef    = useRef(0);
  const lastAnnouncedRep = useRef(0);
  const prevRepsRef      = useRef(0);
  const frameSkipRef     = useRef(0);
  const timerRef         = useRef(null);
  const poseWebViewRef   = useRef(null);

  useEffect(() => {
    stateRef.current = { reps, stage, holdTime };
  }, [reps, stage, holdTime]);

  useEffect(() => {
    if (poseError) { setStatusMsg('Error: ' + poseError); return; }
    if (!isReady) { setStatusMsg('Initialising MediaPipe...'); return; }
    if (!landmarks) { setStatusMsg('Position yourself in view'); return; }
    setStatusMsg('');
  }, [isReady, poseError, landmarks]);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused]);

  useEffect(() => {
    if (exercise === 'plank' && isActive && !isPaused) startPlankTimer();
    else stopPlankTimer();
    return () => stopPlankTimer();
  }, [exercise, isActive, isPaused]);

  useEffect(() => {
    if (!landmarks || !isActive || isPaused) return;

    frameSkipRef.current += 1;
    if (frameSkipRef.current % 3 !== 0) return;

    const analyser = ANALYSERS[exercise];
    if (!analyser) return;

    const result = analyser(landmarks, stateRef);
    updateFromAnalysis(result);
    setJointColors(result.jointColors || {});

    if (result.feedback && result.feedback.length > 0) {
      const now = Date.now();
      if (now - lastSpokenRef.current > 4000) {
        Speech.speak(result.feedback[0], { rate: 0.95 });
        lastSpokenRef.current = now;
      }
    }

    const newReps = result.reps ?? 0;
    if (newReps > 0 && newReps % 5 === 0 && newReps !== lastAnnouncedRep.current) {
      Speech.speak(`${newReps} reps`);
      lastAnnouncedRep.current = newReps;
    }

    if (newReps > prevRepsRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      prevRepsRef.current = newReps;
    }
  }, [landmarks, isActive, isPaused, exercise]);

  // ── Permission guard ───────────────────────────────────────────────────────
  if (!cameraPerm || !micPerm) return <View style={styles.root} />;
  
  if (!hasPerms) {
    return <PermissionScreen onRequest={handleGrantAll} denied={cameraPerm.status === 'denied' || micPerm.status === 'denied'} />;
  }

  const handleStart = () => {
    resetReps();
    prevRepsRef.current = 0;
    lastAnnouncedRep.current = 0;
    setElapsedSecs(0);
    startSession();
  };

  const handleEnd = () => {
    Alert.alert('End Session', 'Save your progress?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => { endSession(); navigation.goBack(); } },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <PoseWebView
        ref={poseWebViewRef}
        onLandmarks={onLandmarks}
        onReady={onReady}
        onError={onWebViewError}
      />

      {landmarks && (
        <SkeletonOverlay
          landmarks={landmarks}
          jointColors={jointColors}
          frameWidth={frameDimensions.width}
          frameHeight={frameDimensions.height}
        />
      )}

      <View style={styles.bottomScrim} pointerEvents="none" />

      <SafeAreaView style={styles.topHud} edges={['top']} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.hudCenter}>
          <Text style={styles.hudExercise}>{EXERCISE_LABELS[exercise]}</Text>
          {statusMsg ? <Text style={styles.hudStatus}>{statusMsg}</Text> : <Text style={styles.hudSub}>Session Active</Text>}
        </View>

        {isActive && (
          <View style={styles.timerBadge}>
            <View style={styles.timerDot} />
            <Text style={styles.timerText}>{Math.floor(elapsedSecs / 60)}:{(elapsedSecs % 60).toString().padStart(2, '0')}</Text>
          </View>
        )}
      </SafeAreaView>

      {isActive && (
        <View style={styles.repArea} pointerEvents="none">
          <RepCounter count={reps} stage={stage} isPlank={exercise === 'plank'} holdTime={holdTime} />
        </View>
      )}

      {isActive && <FormFeedback feedback={feedback} goodForm={goodForm} />}

      <SafeAreaView style={styles.controlStrip} edges={['bottom']}>
        {!isActive ? (
          <TouchableOpacity 
            style={[styles.startBtn, !isReady && styles.startBtnDisabled]} 
            onPress={isReady ? handleStart : null}
            disabled={!isReady}
          >
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.startBtnText}>{isReady ? 'Start Workout' : 'Loading...'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={handleEnd}>
              <Ionicons name="stop" size={20} color="#FF4D6A" />
              <Text style={[styles.controlBtnText, { color: '#FF4D6A' }]}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtnCenter} onPress={() => setIsPaused(!isPaused)}>
              <Ionicons name={isPaused ? 'play' : 'pause'} size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setPickerVisible(true)}>
              <Ionicons name="swap-horizontal" size={20} color={COLORS.secondary} />
              <Text style={[styles.controlBtnText, { color: COLORS.secondary }]}>Switch</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <ExercisePicker visible={pickerVisible} onSelect={switchExercise} onClose={() => setPickerVisible(false)} />
    </View>
  );
}

function PermissionScreen({ onRequest, denied }) {
  return (
    <View style={styles.permContainer}>
      <Ionicons name="camera" size={64} color={COLORS.primary} />
      <Text style={styles.permTitle}>{denied ? 'Permission Denied' : 'Camera Needed'}</Text>
      <Text style={styles.permBody}>We need camera access to track your form.</Text>
      {!denied && <TouchableOpacity style={styles.permBtn} onPress={onRequest}><Text style={styles.permBtnText}>Allow Camera</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_H * 0.4, backgroundColor: 'rgba(0,0,0,0.4)' },
  topHud: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  hudCenter: { flex: 1, alignItems: 'center' },
  hudExercise: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
  hudSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  hudStatus: { fontSize: 12, color: '#FBBF24', fontWeight: '600' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20, gap: 6 },
  timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D6A' },
  timerText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  repArea: { position: 'absolute', bottom: 180, left: 0, right: 0, alignItems: 'center' },
  controlStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,15,30,0.9)', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  startBtn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startBtnDisabled: { backgroundColor: '#444' },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlBtn: { alignItems: 'center', gap: 5 },
  controlBtnText: { fontSize: 12, fontWeight: '700' },
  controlBtnCenter: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  permContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#fff' },
  permTitle: { fontSize: 24, fontWeight: '800', marginVertical: 20 },
  permBody: { textAlign: 'center', color: '#666', marginBottom: 30 },
  permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  permBtnText: { color: '#fff', fontWeight: '700' }
});
