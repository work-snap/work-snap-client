"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { usePushNotification, NotificationPermissionState } from "@/services/pushNotificationService";

/**
 * 알림 설정 인터페이스
 */
interface NotificationSettingsState {
  workReminderEnabled: boolean;
  businessOwnerAlertsEnabled: boolean;
  systemNoticesEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  testNotificationsEnabled: boolean;
}

/**
 * 알림 설정 컴포넌트
 */
export const NotificationSettings: React.FC<{
  className?: string;
  onSettingsChange?: (settings: NotificationSettingsState) => void;
}> = ({ className = "", onSettingsChange }) => {
  const pushNotification = usePushNotification();
  
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    supported: false
  });
  
  const [settings, setSettings] = useState<NotificationSettingsState>({
    workReminderEnabled: true,
    businessOwnerAlertsEnabled: true,
    systemNoticesEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    testNotificationsEnabled: false
  });
  
  const [loading, setLoading] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // 초기 권한 상태 확인
  useEffect(() => {
    const checkPermission = () => {
      const state = pushNotification.getPermissionState();
      setPermissionState(state);
    };

    checkPermission();
    
    // 주기적으로 권한 상태 확인
    const interval = setInterval(checkPermission, 5000);
    return () => clearInterval(interval);
  }, [pushNotification]);

  // 설정 로드
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      }
    };

    loadSettings();
  }, []);

  // 설정 저장
  const saveSettings = useCallback((newSettings: NotificationSettingsState) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  }, [onSettingsChange]);

  // 설정 변경 핸들러
  const handleSettingChange = useCallback((key: keyof NotificationSettingsState, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // 알림 권한 요청
  const requestPermission = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await pushNotification.requestPermission();
      setPermissionState(result);
      
      if (result.permission === 'granted') {
        // Service Worker 등록
        await pushNotification.service.registerServiceWorker();
        // FCM 초기화
        await pushNotification.service.initializeFCM();
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [pushNotification]);

  // 테스트 알림 전송
  const sendTestNotification = useCallback(async () => {
    if (permissionState.permission !== 'granted') {
      alert('먼저 알림 권한을 허용해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const success = await pushNotification.sendTestNotification();
      
      if (success) {
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 3000);
      } else {
        alert('테스트 알림 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
      alert('테스트 알림 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [permissionState.permission, pushNotification]);

  // 예약된 알림 확인
  const checkScheduledNotifications = useCallback(() => {
    const scheduled = pushNotification.getScheduledNotifications();
    if (scheduled.length > 0) {
      alert(`현재 ${scheduled.length}개의 알림이 예약되어 있습니다.\n\n${
        scheduled.map(n => `• ${n.title}: ${new Date(n.scheduledTime).toLocaleString('ko-KR')}`).join('\n')
      }`);
    } else {
      alert('예약된 알림이 없습니다.');
    }
  }, [pushNotification]);

  // 모든 예약 알림 취소
  const cancelAllNotifications = useCallback(() => {
    if (confirm('모든 예약된 알림을 취소하시겠습니까?')) {
      pushNotification.cancelAllScheduledNotifications();
      alert('모든 예약된 알림이 취소되었습니다.');
    }
  }, [pushNotification]);

  // 권한 상태에 따른 UI
  const getPermissionStatusUI = () => {
    if (!permissionState.supported) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-800 font-medium">알림 지원 안함</span>
          </div>
          <p className="text-red-700 mt-1">
            {permissionState.error || '이 브라우저는 푸시 알림을 지원하지 않습니다.'}
          </p>
        </div>
      );
    }

    switch (permissionState.permission) {
      case 'granted':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800 font-medium">알림 권한 허용됨</span>
            </div>
            <p className="text-green-700 mt-1">푸시 알림을 받을 수 있습니다.</p>
          </div>
        );
      
      case 'denied':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">🚫</span>
              <span className="text-red-800 font-medium">알림 권한 거부됨</span>
            </div>
            <p className="text-red-700 mt-1">
              브라우저 설정에서 알림을 허용해주세요.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-800 font-medium">알림 권한 필요</span>
            </div>
            <p className="text-yellow-700 mt-1 mb-3">
              푸시 알림을 받으려면 권한을 허용해주세요.
            </p>
            <BaseButton
              buttonState={{
                label: "알림 권한 요청",
                icon: "🔔",
                variant: "primary",
                loading: loading
              }}
              onClick={requestPermission}
              className="text-sm"
            />
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">알림 설정</h2>
        <p className="text-gray-600">
          푸시 알림 및 알림 기능을 설정할 수 있습니다.
        </p>
      </div>

      {/* 권한 상태 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">권한 상태</h3>
        {getPermissionStatusUI()}
      </div>

      {/* 알림 설정 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">알림 종류</h3>
        <div className="space-y-4">
          {/* 근무 알림 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">근무 시작 알림</h4>
              <p className="text-sm text-gray-600">근무 시작 10분 전에 알림을 받습니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.workReminderEnabled}
                onChange={(e) => handleSettingChange('workReminderEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 사업자 알림 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">사업자 알림</h4>
              <p className="text-sm text-gray-600">조기출근, 연장근무 등의 알림을 받습니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.businessOwnerAlertsEnabled}
                onChange={(e) => handleSettingChange('businessOwnerAlertsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 시스템 공지 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">시스템 공지</h4>
              <p className="text-sm text-gray-600">앱 업데이트, 공지사항 알림을 받습니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.systemNoticesEnabled}
                onChange={(e) => handleSettingChange('systemNoticesEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 알림 방식 설정 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">알림 방식</h3>
        <div className="space-y-4">
          {/* 소리 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">알림 소리</h4>
              <p className="text-sm text-gray-600">알림과 함께 소리를 재생합니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 진동 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">진동</h4>
              <p className="text-sm text-gray-600">모바일 기기에서 진동과 함께 알림을 받습니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 테스트 및 관리 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">테스트 및 관리</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseButton
            buttonState={{
              label: testNotificationSent ? "전송 완료!" : "테스트 알림",
              icon: testNotificationSent ? "✅" : "🔔",
              variant: testNotificationSent ? "success" : "secondary",
              loading: loading,
              disabled: permissionState.permission !== 'granted'
            }}
            onClick={sendTestNotification}
            className="w-full"
          />
          
          <BaseButton
            buttonState={{
              label: "예약된 알림 확인",
              icon: "📅",
              variant: "secondary"
            }}
            onClick={checkScheduledNotifications}
            className="w-full"
          />
          
          <BaseButton
            buttonState={{
              label: "모든 알림 취소",
              icon: "🗑️",
              variant: "danger"
            }}
            onClick={cancelAllNotifications}
            className="w-full"
          />
          
          <BaseButton
            buttonState={{
              label: "설정 초기화",
              icon: "🔄",
              variant: "secondary"
            }}
            onClick={() => {
              if (confirm('알림 설정을 초기화하시겠습니까?')) {
                const defaultSettings: NotificationSettingsState = {
                  workReminderEnabled: true,
                  businessOwnerAlertsEnabled: true,
                  systemNoticesEnabled: true,
                  soundEnabled: true,
                  vibrationEnabled: true,
                  testNotificationsEnabled: false
                };
                saveSettings(defaultSettings);
                alert('설정이 초기화되었습니다.');
              }
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* 도움말 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 도움말</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 알림이 작동하지 않으면 브라우저 설정에서 사이트 알림을 확인해주세요.</li>
          <li>• 모바일에서는 홈 화면에 앱을 추가하면 더 나은 알림 경험을 제공합니다.</li>
          <li>• 배터리 절약 모드에서는 일부 알림이 지연될 수 있습니다.</li>
          <li>• 테스트 알림으로 설정을 확인할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};