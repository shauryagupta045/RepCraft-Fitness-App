import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: W, height: H } = Dimensions.get('window');

/**
 * PoseWebView — DIAGNOSTIC VERSION
 */
const PoseWebView = forwardRef(function PoseWebView(
  { onLandmarks, onReady, onError },
  ref
) {
  const webviewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    pause:  () => webviewRef.current?.injectJavaScript('window.__pause  && window.__pause();  true;'),
    resume: () => webviewRef.current?.injectJavaScript('window.__resume && window.__resume(); true;'),
    reload: () => webviewRef.current?.reload(),
  }));

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'LANDMARKS') onLandmarks?.(msg.data);
      else if (msg.type === 'READY') onReady?.();
      else if (msg.type === 'ERROR') onError?.(msg.data);
      else if (msg.type === 'LOG') console.log('[WebView]', msg.data);
    } catch (_) {}
  };

  return (
    <WebView
      ref={webviewRef}
      style={styles.webview}
      // TRICK: Use http://localhost:8081 as baseUrl. Expo's dev server runs there,
      // and Android Chromium treats localhost as a SECURE ORIGIN.
      source={{ 
        html: MEDIAPIPE_HTML,
        baseUrl: 'http://localhost:8081'
      }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
      originWhitelist={['*']}
      
      // Permissions (Android)
      onPermissionRequest={(event) => {
        event.grant(event.resources);
      }}
      
      // Flags for Camera/Media
      mediaCapturePermissionGrantType="grant"
      allowsCamera={true} // Older RN versions
      cameraAccessEnabled={true} // iOS specific
      
      // Optimization
      mixedContentMode="always"
      androidLayerType="hardware"
      allowFileAccess={true}
      
      scrollEnabled={false}
      bounces={false}
      onError={(e) => onError?.('WebView Loading Error: ' + e.nativeEvent.description)}
    />
  );
});

export default PoseWebView;

const styles = StyleSheet.create({
  webview: {
    position: 'absolute',
    top: 0, left: 0,
    width: W, height: H,
    backgroundColor: '#000',
    zIndex: 0,
  },
});

const MEDIAPIPE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;background:#000;color:#fff;overflow:hidden;font-family:sans-serif}
  #video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1}
  #overlay{position:absolute;top:70px;left:20px;z-index:10;background:rgba(0,0,0,0.85);
           padding:12px 18px;border-radius:15px;font-size:13px;color:#00f5c4;line-height:1.6;
           border:1px solid #00f5c4;box-shadow:0 10px 30px rgba(0,0,0,0.8)}
  .err{color:#ff4d6a;font-weight:bold}
</style>
</head>
<body>
<video id="video" playsinline autoplay muted></video>
<div id="overlay">Initializing AI Engine...</div>

<script type="module">
import {
  PoseLandmarker,
  FilesetResolver
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';

const log   = (t, isErr=false) => { 
  const el = document.getElementById('overlay');
  el.innerHTML = isErr ? '<span class="err">' + t + '</span>' : t;
};
const post  = (obj) => window.ReactNativeWebView?.postMessage(JSON.stringify(obj));
const VIDEO = document.getElementById('video');

let landmarker = null;
let paused     = false;

async function setup() {
  try {
    log('1/3 Loading MediaPipe...');
    
    // Check for Secure Context
    if (!window.isSecureContext) {
      log('SECURITY ERROR: Origin is not secure. Camera will be blocked. Please use localhost or HTTPS.', true);
      return;
    }

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    
    log('2/3 Opening Camera Hardware...');
    await launchCamera();
  } catch (err) {
    log('CRITICAL ERROR: ' + err.message, true);
    post({ type: 'ERROR', data: err.message });
  }
}

async function launchCamera() {
  try {
    // Attempt with ideal back-camera constraints
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: 640, height: 480 },
      audio: false
    });
    VIDEO.srcObject = stream;
    await new Promise(r => VIDEO.onloadedmetadata = r);
    await VIDEO.play();
    log('3/3 Systems Ready ✓');
    post({ type: 'READY' });
    requestAnimationFrame(tick);
  } catch (e) {
    log('Primary Camera failed. Retrying basic...', true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      VIDEO.srcObject = stream;
      await VIDEO.play();
      log('3/3 Systems Ready (Fallback) ✓');
      post({ type: 'READY' });
      requestAnimationFrame(tick);
    } catch (e2) {
      throw new Error('Camera Permission Denied by System or Browser.');
    }
  }
}

function tick() {
  if (paused) return;
  if (!landmarker || VIDEO.readyState < 2) {
    requestAnimationFrame(tick);
    return;
  }
  try {
    const result = landmarker.detectForVideo(VIDEO, performance.now());
    if (result.landmarks && result.landmarks.length > 0) {
      post({
        type: 'LANDMARKS',
        data: {
          landmarks: result.landmarks[0],
          frameWidth: VIDEO.videoWidth,
          frameHeight: VIDEO.videoHeight
        }
      });
      log('Tracking Active ✓');
    } else {
      log('AI Ready - Stand in view');
      post({ type: 'LANDMARKS', data: { landmarks: [], frameWidth: VIDEO.videoWidth, frameHeight: VIDEO.videoHeight } });
    }
  } catch (e) {}
  requestAnimationFrame(tick);
}

window.__pause = () => { paused = true; };
window.__resume = () => { paused = false; requestAnimationFrame(tick); };

setup();
</script>
</body>
</html>`;
