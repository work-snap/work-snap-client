/**
 * Service Worker for Push Notifications
 * 푸시 알림 처리를 위한 서비스 워커
 */

const CACHE_NAME = 'worksnap-notifications-v1';
const NOTIFICATION_CLICK_URL = '/';

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('캐시 생성 완료');
      return cache.addAll([
        '/',
        '/icons/icon-192x192.png',
        '/icons/badge-72x72.png'
      ]);
    })
  );
  
  // 즉시 활성화
  self.skipWaiting();
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화됨');
  
  event.waitUntil(
    // 이전 버전 캐시 정리
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      // 모든 클라이언트 제어
      return self.clients.claim();
    })
  );
});

// 푸시 메시지 수신
self.addEventListener('push', (event) => {
  console.log('푸시 메시지 수신:', event);
  
  let notificationData = {
    title: '알림',
    body: '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: {},
    actions: [],
    requireInteraction: false,
    silent: false
  };

  // 푸시 데이터가 있는 경우 파싱
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('푸시 데이터 파싱 실패:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // 알림 타입별 커스터마이징
  if (notificationData.data?.type) {
    switch (notificationData.data.type) {
      case 'work-reminder':
        notificationData.icon = '/icons/work-reminder.png';
        notificationData.badge = '/icons/badge-work.png';
        notificationData.requireInteraction = true;
        notificationData.actions = [
          {
            action: 'view',
            title: '확인하기',
            icon: '/icons/action-view.png'
          },
          {
            action: 'dismiss',
            title: '나중에',
            icon: '/icons/action-dismiss.png'
          }
        ];
        break;
        
      case 'early-arrival':
        notificationData.icon = '/icons/early-arrival.png';
        notificationData.badge = '/icons/badge-business.png';
        notificationData.tag = 'business-alert';
        break;
        
      case 'overtime':
        notificationData.icon = '/icons/overtime.png';
        notificationData.badge = '/icons/badge-business.png';
        notificationData.tag = 'business-alert';
        break;
        
      case 'test':
        notificationData.tag = 'test-notification';
        notificationData.requireInteraction = false;
        break;
    }
  }

  // 알림 표시
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      timestamp: Date.now(),
      vibrate: [200, 100, 200]
    })
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭됨:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // 알림 닫기
  notification.close();
  
  // 액션별 처리
  let targetUrl = NOTIFICATION_CLICK_URL;
  
  if (action === 'dismiss') {
    // 나중에 액션 - 아무것도 하지 않음
    return;
  }
  
  // 알림 타입별 URL 결정
  switch (data.type) {
    case 'work-reminder':
      targetUrl = '/attendance';
      break;
    case 'early-arrival':
    case 'overtime':
      targetUrl = '/business-owner/notifications';
      break;
    case 'test':
      targetUrl = '/notifications/settings';
      break;
    default:
      targetUrl = '/notifications';
      break;
  }
  
  // 앱 페이지 열기 또는 포커스
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 탭이 있는지 확인
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // 기존 탭에 포커스하고 해당 URL로 네비게이션
          return client.focus().then(() => {
            return client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: targetUrl,
              data: data
            });
          });
        }
      }
      
      // 열린 탭이 없으면 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('알림 닫힘:', event.notification.tag);
  
  // 알림 닫기 분석 데이터 전송 (선택사항)
  const data = event.notification.data || {};
  
  // 백그라운드에서 분석 데이터 전송
  if (data.trackClose) {
    event.waitUntil(
      fetch('/api/analytics/notification-close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId: data.id,
          type: data.type,
          closedAt: new Date().toISOString()
        })
      }).catch((error) => {
        console.error('분석 데이터 전송 실패:', error);
      })
    );
  }
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(
      // 오프라인 중에 누적된 알림 처리
      handleBackgroundSync()
    );
  }
});

// 백그라운드 동기화 처리 함수
async function handleBackgroundSync() {
  try {
    // 로컬 스토리지에서 대기 중인 알림 확인
    const pendingNotifications = await getStoredPendingNotifications();
    
    for (const notification of pendingNotifications) {
      await self.registration.showNotification(notification.title, notification.options);
    }
    
    // 처리 완료된 알림 제거
    await clearStoredPendingNotifications();
    
    console.log('백그라운드 동기화 완료');
  } catch (error) {
    console.error('백그라운드 동기화 실패:', error);
  }
}

// 대기 중인 알림 조회 (IndexedDB 또는 Cache API 사용)
async function getStoredPendingNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/pending-notifications');
    
    if (response) {
      return await response.json();
    }
    
    return [];
  } catch (error) {
    console.error('대기 중인 알림 조회 실패:', error);
    return [];
  }
}

// 대기 중인 알림 제거
async function clearStoredPendingNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete('/pending-notifications');
  } catch (error) {
    console.error('대기 중인 알림 제거 실패:', error);
  }
}

// 메시지 수신 처리 (클라이언트와의 통신)
self.addEventListener('message', (event) => {
  console.log('Service Worker 메시지 수신:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_NOTIFICATIONS':
      // 모든 알림 제거
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((notification) => {
          notification.close();
        });
      });
      break;
      
    default:
      console.log('알 수 없는 메시지 타입:', type);
  }
});

// 오류 처리
self.addEventListener('error', (event) => {
  console.error('Service Worker 오류:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker Promise 거부:', event.reason);
});

console.log('Service Worker 스크립트 로드 완료');