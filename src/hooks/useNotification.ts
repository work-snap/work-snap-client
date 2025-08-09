"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePushNotification, NotificationPermissionState, ScheduledNotification } from "@/services/pushNotificationService";

/**
 * 알림 관리를 위한 커스텀 훅
 */
export interface UseNotificationOptions {
  autoRegisterServiceWorker?: boolean;
  enableBackgroundSync?: boolean;
  onPermissionChange?: (permission: NotificationPermission) => void;
  onNotificationClick?: (data: any) => void;
}

export interface UseNotificationReturn {
  // 권한 관련
  permissionState: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermissionState>;
  hasPermission: boolean;
  
  // 알림 전송
  showNotification: (title: string, body: string, options?: any) => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  
  // 예약 알림
  scheduleWorkReminder: (workStartTime: Date, workplaceName: string, workId?: string) => string;
  getScheduledNotifications: () => ScheduledNotification[];
  cancelScheduledNotification: (id: string) => boolean;
  cancelAllScheduledNotifications: () => void;
  
  // 상태
  loading: boolean;
  error: string | null;
  isServiceWorkerReady: boolean;
  
  // 유틸리티
  clearError: () => void;
  refreshPermissionState: () => void;
}

export const useNotification = (options: UseNotificationOptions = {}): UseNotificationReturn => {
  const {
    autoRegisterServiceWorker = true,
    enableBackgroundSync = false,
    onPermissionChange,
    onNotificationClick
  } = options;

  const pushNotification = usePushNotification();
  
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    supported: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  
  const serviceWorkerRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const permissionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 권한 상태 새로고침
  const refreshPermissionState = useCallback(() => {
    const state = pushNotification.getPermissionState();
    setPermissionState(state);
    onPermissionChange?.(state.permission);
  }, [pushNotification, onPermissionChange]);

  // Service Worker 등록
  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker를 지원하지 않는 환경입니다.');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      serviceWorkerRegistrationRef.current = registration;
      setIsServiceWorkerReady(true);
      
      // Service Worker 업데이트 확인
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker 업데이트가 발견되었습니다.');
      });

      // 알림 클릭 메시지 리스너 설정
      if (onNotificationClick) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'NOTIFICATION_CLICK') {
            onNotificationClick(event.data);
          }
        });
      }

      console.log('Service Worker 등록 성공:', registration);
      return true;
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
      setError('Service Worker 등록에 실패했습니다.');
      return false;
    }
  }, [onNotificationClick]);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    setLoading(true);
    clearError();

    try {
      const result = await pushNotification.requestPermission();
      setPermissionState(result);
      onPermissionChange?.(result.permission);

      if (result.permission === 'granted' && autoRegisterServiceWorker) {
        await registerServiceWorker();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '권한 요청 중 오류가 발생했습니다.';
      setError(errorMessage);
      return {
        permission: 'denied',
        supported: true,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [pushNotification, onPermissionChange, autoRegisterServiceWorker, registerServiceWorker, clearError]);

  // 알림 표시
  const showNotification = useCallback(async (
    title: string, 
    body: string, 
    options: any = {}
  ): Promise<boolean> => {
    if (permissionState.permission !== 'granted') {
      setError('알림 권한이 없습니다.');
      return false;
    }

    setLoading(true);
    clearError();

    try {
      const success = await pushNotification.showNotification({
        title,
        body,
        ...options
      });

      if (!success) {
        setError('알림 표시에 실패했습니다.');
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알림 표시 중 오류가 발생했습니다.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [permissionState.permission, pushNotification, clearError]);

  // 테스트 알림 전송
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    return showNotification(
      '테스트 알림',
      '푸시 알림이 정상적으로 작동합니다.',
      {
        icon: '/icons/icon-192x192.png',
        tag: 'test-notification',
        data: { type: 'test' }
      }
    );
  }, [showNotification]);

  // 근무 알림 예약
  const scheduleWorkReminder = useCallback((
    workStartTime: Date,
    workplaceName: string,
    workId?: string
  ): string => {
    if (permissionState.permission !== 'granted') {
      setError('알림 권한이 없어 예약할 수 없습니다.');
      return '';
    }

    try {
      const notificationId = pushNotification.scheduleWorkReminder(workStartTime, workplaceName, workId);
      
      if (!notificationId) {
        setError('알림 예약에 실패했습니다.');
      }

      return notificationId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알림 예약 중 오류가 발생했습니다.';
      setError(errorMessage);
      return '';
    }
  }, [permissionState.permission, pushNotification]);

  // 예약된 알림 조회
  const getScheduledNotifications = useCallback((): ScheduledNotification[] => {
    return pushNotification.getScheduledNotifications();
  }, [pushNotification]);

  // 예약 알림 취소
  const cancelScheduledNotification = useCallback((id: string): boolean => {
    return pushNotification.cancelScheduledNotification(id);
  }, [pushNotification]);

  // 모든 예약 알림 취소
  const cancelAllScheduledNotifications = useCallback(() => {
    pushNotification.cancelAllScheduledNotifications();
  }, [pushNotification]);

  // 초기화 및 정리
  useEffect(() => {
    // 초기 권한 상태 확인
    refreshPermissionState();

    // Service Worker 자동 등록
    if (autoRegisterServiceWorker && permissionState.permission === 'granted') {
      registerServiceWorker();
    }

    // 권한 상태 주기적 확인
    permissionCheckIntervalRef.current = setInterval(refreshPermissionState, 10000);

    return () => {
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current);
      }
    };
  }, [autoRegisterServiceWorker, permissionState.permission, registerServiceWorker, refreshPermissionState]);

  // 백그라운드 동기화 설정
  useEffect(() => {
    if (!enableBackgroundSync || !isServiceWorkerReady) return;

    const setupBackgroundSync = async () => {
      try {
        const registration = serviceWorkerRegistrationRef.current;
        if (registration && 'sync' in registration) {
          // 백그라운드 동기화 등록
          await registration.sync.register('background-sync-notifications');
          console.log('백그라운드 동기화 등록 완료');
        }
      } catch (error) {
        console.error('백그라운드 동기화 설정 실패:', error);
      }
    };

    setupBackgroundSync();
  }, [enableBackgroundSync, isServiceWorkerReady]);

  // 페이지 가시성 변경 시 권한 상태 확인
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshPermissionState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshPermissionState]);

  // 온라인/오프라인 상태 변경 시 Service Worker 상태 확인
  useEffect(() => {
    const handleOnline = () => {
      if (isServiceWorkerReady && serviceWorkerRegistrationRef.current) {
        // 온라인 상태가 되면 대기 중인 알림 동기화
        serviceWorkerRegistrationRef.current.sync?.register('background-sync-notifications');
      }
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isServiceWorkerReady]);

  return {
    // 권한 관련
    permissionState,
    requestPermission,
    hasPermission: permissionState.permission === 'granted',
    
    // 알림 전송
    showNotification,
    sendTestNotification,
    
    // 예약 알림
    scheduleWorkReminder,
    getScheduledNotifications,
    cancelScheduledNotification,
    cancelAllScheduledNotifications,
    
    // 상태
    loading,
    error,
    isServiceWorkerReady,
    
    // 유틸리티
    clearError,
    refreshPermissionState
  };
};