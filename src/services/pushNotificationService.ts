"use client";

/**
 * 푸시 알림 서비스
 * Web Push API 기반 알림 시스템
 */

export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
  error?: string;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  data?: any;
  recurring?: boolean;
  interval?: number; // 분 단위
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private notificationTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * 알림 권한 상태 확인
   */
  getPermissionState(): NotificationPermissionState {
    if (typeof window === 'undefined') {
      return {
        permission: 'default',
        supported: false,
        error: 'Server-side environment'
      };
    }

    if (!('Notification' in window)) {
      return {
        permission: 'denied',
        supported: false,
        error: '이 브라우저는 알림을 지원하지 않습니다.'
      };
    }

    return {
      permission: Notification.permission,
      supported: true
    };
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    const currentState = this.getPermissionState();
    
    if (!currentState.supported) {
      return currentState;
    }

    if (currentState.permission === 'granted') {
      return currentState;
    }

    try {
      const permission = await Notification.requestPermission();
      return {
        permission,
        supported: true
      };
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return {
        permission: 'denied',
        supported: true,
        error: '알림 권한 요청에 실패했습니다.'
      };
    }
  }

  /**
   * 서비스 워커 등록
   */
  async registerServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker를 지원하지 않는 환경입니다.');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceWorkerRegistration = registration;
      console.log('Service Worker 등록 성공:', registration);
      return true;
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
      return false;
    }
  }

  /**
   * 즉시 알림 표시
   */
  async showNotification(notificationData: NotificationData): Promise<boolean> {
    const permissionState = this.getPermissionState();
    
    if (!permissionState.supported || permissionState.permission !== 'granted') {
      console.warn('알림 권한이 없거나 지원되지 않습니다.');
      return false;
    }

    try {
      // Service Worker가 등록되어 있으면 Service Worker를 통해 알림 표시
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon || '/icons/icon-192x192.png',
          badge: notificationData.badge || '/icons/badge-72x72.png',
          tag: notificationData.tag,
          data: notificationData.data,
          actions: notificationData.actions,
          requireInteraction: notificationData.requireInteraction,
          silent: notificationData.silent,
          timestamp: Date.now()
        });
      } else {
        // Service Worker가 없으면 직접 알림 표시
        new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon || '/icons/icon-192x192.png',
          tag: notificationData.tag,
          data: notificationData.data,
          requireInteraction: notificationData.requireInteraction,
          silent: notificationData.silent
        });
      }

      console.log('알림 표시 성공:', notificationData.title);
      return true;
    } catch (error) {
      console.error('알림 표시 실패:', error);
      return false;
    }
  }

  /**
   * 예약 알림 설정
   */
  scheduleNotification(notification: ScheduledNotification): boolean {
    const now = new Date();
    const scheduledTime = new Date(notification.scheduledTime);
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.warn('예약 시간이 이미 지났습니다:', notification.scheduledTime);
      return false;
    }

    // 기존 타이머가 있으면 제거
    this.cancelScheduledNotification(notification.id);

    // 새 타이머 설정
    const timer = setTimeout(async () => {
      await this.showNotification({
        title: notification.title,
        body: notification.body,
        data: notification.data,
        tag: notification.id
      });

      // 반복 알림인 경우 다시 스케줄링
      if (notification.recurring && notification.interval) {
        const nextNotification = {
          ...notification,
          scheduledTime: new Date(scheduledTime.getTime() + notification.interval * 60 * 1000)
        };
        this.scheduleNotification(nextNotification);
      } else {
        // 일회성 알림인 경우 맵에서 제거
        this.scheduledNotifications.delete(notification.id);
        this.notificationTimers.delete(notification.id);
      }
    }, delay);

    this.scheduledNotifications.set(notification.id, notification);
    this.notificationTimers.set(notification.id, timer);

    console.log(`알림 예약 완료: ${notification.title} at ${notification.scheduledTime}`);
    return true;
  }

  /**
   * 예약 알림 취소
   */
  cancelScheduledNotification(notificationId: string): boolean {
    const timer = this.notificationTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.notificationTimers.delete(notificationId);
      this.scheduledNotifications.delete(notificationId);
      console.log('예약 알림 취소:', notificationId);
      return true;
    }
    return false;
  }

  /**
   * 모든 예약 알림 취소
   */
  cancelAllScheduledNotifications(): void {
    this.notificationTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.notificationTimers.clear();
    this.scheduledNotifications.clear();
    console.log('모든 예약 알림 취소 완료');
  }

  /**
   * 예약된 알림 목록 조회
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * 근무 10분 전 알림 설정
   */
  scheduleWorkReminder(
    workStartTime: Date,
    workplaceName: string,
    workId?: string
  ): string {
    const reminderTime = new Date(workStartTime.getTime() - 10 * 60 * 1000); // 10분 전
    const notificationId = `work-reminder-${workId || Date.now()}`;

    const notification: ScheduledNotification = {
      id: notificationId,
      title: '🕐 근무 시작 10분 전',
      body: `${workplaceName}에서 ${workStartTime.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}에 근무가 시작됩니다.`,
      scheduledTime: reminderTime,
      data: {
        type: 'work-reminder',
        workStartTime: workStartTime.toISOString(),
        workplaceName,
        workId
      }
    };

    if (this.scheduleNotification(notification)) {
      return notificationId;
    }
    return '';
  }

  /**
   * 테스트 알림 전송
   */
  async sendTestNotification(): Promise<boolean> {
    return await this.showNotification({
      title: '테스트 알림',
      body: '푸시 알림이 정상적으로 작동합니다.',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification',
      data: { type: 'test' }
    });
  }

  /**
   * FCM 토큰 등록 (백엔드 연동용)
   */
  async registerFcmToken(token: string): Promise<boolean> {
    try {
      // 백엔드 API 호출하여 FCM 토큰 등록
      const response = await fetch('/api/notifications/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ fcmToken: token })
      });

      if (response.ok) {
        console.log('FCM 토큰 등록 성공');
        return true;
      } else {
        console.error('FCM 토큰 등록 실패:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('FCM 토큰 등록 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 자동 등록 및 갱신
   */
  async initializeFCM(): Promise<boolean> {
    try {
      // Firebase config 동적 임포트
      const { getFCMToken, onMessageListener } = await import('./firebaseConfig');
      
      // FCM 토큰 가져오기
      const token = await getFCMToken();
      if (!token) {
        console.warn('FCM 토큰을 가져올 수 없습니다.');
        return false;
      }

      // 백엔드에 토큰 등록
      const registered = await this.registerFcmToken(token);
      if (!registered) {
        console.error('FCM 토큰 백엔드 등록 실패');
        return false;
      }

      // 포그라운드 메시지 리스너 등록
      onMessageListener()
        .then((payload: any) => {
          console.log('포그라운드 FCM 메시지 수신:', payload);
          
          // 포그라운드에서 받은 메시지를 알림으로 표시
          if (payload.notification) {
            this.showNotification({
              title: payload.notification.title || '알림',
              body: payload.notification.body || '새로운 알림이 있습니다.',
              data: payload.data,
              tag: payload.data?.type || 'fcm-notification'
            });
          }
        })
        .catch((error) => {
          console.error('포그라운드 메시지 리스너 오류:', error);
        });

      console.log('FCM 초기화 완료');
      return true;
    } catch (error) {
      console.error('FCM 초기화 실패:', error);
      return false;
    }
  }

  /**
   * 인증 토큰 조회 (임시 구현)
   */
  private getAuthToken(): string {
    // 실제로는 인증 컨텍스트나 로컬 스토리지에서 토큰을 가져와야 함
    return localStorage.getItem('authToken') || '';
  }

  /**
   * 서비스 정리
   */
  cleanup(): void {
    this.cancelAllScheduledNotifications();
    
    if (this.serviceWorkerRegistration) {
      // Service Worker 정리는 일반적으로 하지 않음
      // this.serviceWorkerRegistration.unregister();
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const pushNotificationService = PushNotificationService.getInstance();

// React Hook으로 사용할 수 있는 인터페이스
export const usePushNotification = () => {
  return {
    service: pushNotificationService,
    requestPermission: () => pushNotificationService.requestPermission(),
    showNotification: (data: NotificationData) => pushNotificationService.showNotification(data),
    scheduleWorkReminder: (workStartTime: Date, workplaceName: string, workId?: string) =>
      pushNotificationService.scheduleWorkReminder(workStartTime, workplaceName, workId),
    sendTestNotification: () => pushNotificationService.sendTestNotification(),
    getPermissionState: () => pushNotificationService.getPermissionState(),
    getScheduledNotifications: () => pushNotificationService.getScheduledNotifications(),
    cancelScheduledNotification: (id: string) => pushNotificationService.cancelScheduledNotification(id),
    cancelAllScheduledNotifications: () => pushNotificationService.cancelAllScheduledNotifications()
  };
};