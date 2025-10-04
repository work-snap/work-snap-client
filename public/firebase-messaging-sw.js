/**
 * Firebase Cloud Messaging Service Worker
 * FCM 백그라운드 메시지 처리
 */

// Firebase 스크립트 로드
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase 설정 (환경 변수는 빌드 시 주입되어야 함)
const firebaseConfig = {
  apiKey: "AIzaSyBXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "workspace-5453e.firebaseapp.com",
  projectId: "workspace-5453e",
  storageBucket: "workspace-5453e.firebasestorage.app",
  messagingSenderId: "113489114728731298984",
  appId: "1:113489114728731298984:web:xxxxxxxxxxxxxxxx"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase Messaging 인스턴스
const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '알림';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 알림이 있습니다.',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: false,
    silent: false
  };

  // 알림 타입별 커스터마이징
  if (payload.data?.type === 'business_verification') {
    notificationOptions.icon = '/icons/business-verification.png';
    notificationOptions.requireInteraction = true;

    // 상태별 아이콘 변경
    if (payload.data?.status === 'APPROVED') {
      notificationOptions.icon = '/icons/approved.png';
    } else if (payload.data?.status === 'REJECTED') {
      notificationOptions.icon = '/icons/rejected.png';
    }
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 알림 클릭:', event.notification);

  event.notification.close();

  // 알림 데이터에 따라 URL 결정
  let urlToOpen = '/';

  if (event.notification.data?.type === 'business_verification') {
    urlToOpen = '/business-owner/dashboard';
  } else if (event.notification.data?.type === 'work-reminder') {
    urlToOpen = '/schedule';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려있는 윈도우가 있으면 포커스
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // 열려있는 윈도우가 없으면 새 윈도우 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
