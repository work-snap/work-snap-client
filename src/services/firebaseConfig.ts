/**
 * Firebase 설정 및 FCM 초기화
 */
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정 (환경 변수로 관리)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// FCM 메시징 객체 (클라이언트 사이드에서만 사용)
let messaging: any = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

// FCM 토큰 가져오기
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase messaging is not available');
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    
    if (token) {
      console.log('FCM 토큰 획득:', token);
      return token;
    } else {
      console.warn('FCM 토큰을 가져올 수 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('FCM 토큰 가져오기 실패:', error);
    return null;
  }
};

// 포그라운드 메시지 리스너
export const onMessageListener = () => {
  if (!messaging) {
    return Promise.reject('Firebase messaging is not available');
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('포그라운드 메시지 수신:', payload);
      resolve(payload);
    });
  });
};

export { messaging };