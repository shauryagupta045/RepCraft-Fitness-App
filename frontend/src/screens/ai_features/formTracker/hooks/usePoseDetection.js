import { useState, useEffect, useRef, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';

/**
 * usePoseDetection — manages MediaPipe PoseLandmarker lifecycle.
 *
 * The pose detection runs entirely inside PoseWebView (a full-screen WebView
 * that owns the camera via getUserMedia + MediaPipe via CDN WASM).
 *
 * This hook:
 *   1. Requests native camera permission (needed even for WebView camera on Android)
 *   2. Receives {landmarks, frameWidth, frameHeight} from PoseWebView via onLandmarks()
 *   3. Exposes the latest landmarks + frame dimensions for the skeleton overlay
 *
 * Usage:
 *   const { landmarks, frameDimensions, isReady, error,
 *           permission, requestPermission,
 *           onLandmarks, onReady, onWebViewError } = usePoseDetection();
 */
export default function usePoseDetection() {
  const [permission, requestPermission] = useCameraPermissions();
  const [landmarks,       setLandmarks]       = useState(null);
  const [frameDimensions, setFrameDimensions] = useState({ width: 0, height: 0 });
  const [isReady,         setIsReady]         = useState(false);
  const [error,           setError]           = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /**
   * Called by PoseWebView's onMessage handler.
   * payload = { landmarks: [...], frameWidth: number, frameHeight: number }
   */
  const onLandmarks = useCallback((payload) => {
    if (!mountedRef.current) return;
    try {
      const { landmarks: lms, frameWidth, frameHeight } = payload;
      setLandmarks(lms && lms.length > 0 ? lms : null);
      if (frameWidth && frameHeight) {
        setFrameDimensions({ width: frameWidth, height: frameHeight });
      }
    } catch (e) {
      setError('Failed to parse landmark data');
    }
  }, []);

  const onReady = useCallback(() => {
    if (mountedRef.current) setIsReady(true);
  }, []);

  const onWebViewError = useCallback((msg) => {
    if (mountedRef.current) setError(msg || 'MediaPipe WebView error');
  }, []);

  return {
    landmarks,
    frameDimensions,
    isReady,
    error,
    permission,
    requestPermission,
    onLandmarks,
    onReady,
    onWebViewError,
  };
}
