"use client";

import React, { useState, useEffect } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { NotificationSettings } from "./NotificationSettings";
import { useNotification } from "@/hooks/useNotification";
import { DateNavigationProvider } from "@/context/DateContext";
import { EnhancedTimeProvider } from "./EnhancedTimeProvider";
import { formatDate, formatTime } from "@/utils/dateUtils";

/**
 * 알림 데모 컴포넌트
 * 푸시 알림 기능을 테스트하고 시연할 수 있는 종합 데모
 */
export const NotificationDemo: React.FC = () => {
  const notification = useNotification({
    autoRegisterServiceWorker: true,
    enableBackgroundSync: true,
    onPermissionChange: (permission) => {
      console.log('권한 상태 변경:', permission);
    },
    onNotificationClick: (data) => {
      console.log('알림 클릭:', data);
      setNotificationLog(prev => [...prev, {
        timestamp: new Date().toLocaleString('ko-KR'),
        type: 'click',
        message: `알림 클릭: ${data.url}`,
        data
      }]);
    }
  });

  const [workStartTime, setWorkStartTime] = useState<string>('');
  const [workplaceName, setWorkplaceName] = useState<string>('테스트 사업장');
  const [notificationLog, setNotificationLog] = useState<Array<{
    timestamp: string;
    type: 'sent' | 'scheduled' | 'click' | 'error';
    message: string;
    data?: any;
  }>>([]);

  // 현재 시간 + 11분으로 기본값 설정 (10분 전 알림 테스트용)
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 11);
    setWorkStartTime(now.toTimeString().slice(0, 5)); // HH:MM 형식
  }, []);

  // 즉시 알림 전송
  const sendImmediateNotification = async () => {
    const success = await notification.showNotification(
      '즉시 알림 테스트',
      '이것은 즉시 전송되는 테스트 알림입니다.',
      {
        icon: '/icons/icon-192x192.png',
        tag: 'immediate-test',
        data: { type: 'immediate-test' },
        requireInteraction: true,
        actions: [
          { action: 'view', title: '확인', icon: '/icons/action-view.png' },
          { action: 'dismiss', title: '닫기', icon: '/icons/action-dismiss.png' }
        ]
      }
    );

    const logEntry = {
      timestamp: new Date().toLocaleString('ko-KR'),
      type: success ? 'sent' as const : 'error' as const,
      message: success ? '즉시 알림 전송 성공' : '즉시 알림 전송 실패',
    };

    setNotificationLog(prev => [logEntry, ...prev].slice(0, 20));
  };

  // 근무 알림 예약
  const scheduleWorkNotification = () => {
    if (!workStartTime) {
      alert('근무 시작 시간을 설정해주세요.');
      return;
    }

    const today = new Date();
    const [hours, minutes] = workStartTime.split(':').map(Number);
    const workDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

    // 만약 설정한 시간이 이미 지났다면 내일로 설정
    if (workDateTime <= new Date()) {
      workDateTime.setDate(workDateTime.getDate() + 1);
    }

    const notificationId = notification.scheduleWorkReminder(workDateTime, workplaceName);

    if (notificationId) {
      const logEntry = {
        timestamp: new Date().toLocaleString('ko-KR'),
        type: 'scheduled' as const,
        message: `근무 알림 예약 완료: ${formatDate(workDateTime)} ${formatTime(workDateTime)}`,
        data: { notificationId, workDateTime: workDateTime.toISOString() }
      };

      setNotificationLog(prev => [logEntry, ...prev].slice(0, 20));
    } else {
      const logEntry = {
        timestamp: new Date().toLocaleString('ko-KR'),
        type: 'error' as const,
        message: '근무 알림 예약 실패',
      };

      setNotificationLog(prev => [logEntry, ...prev].slice(0, 20));
    }
  };

  // 다양한 알림 타입 테스트
  const sendNotificationByType = async (type: string) => {
    let title: string;
    let body: string;
    let options: any = {};

    switch (type) {
      case 'early-arrival':
        title = '⏰ 조기 출근 알림';
        body = '김철수님이 예정보다 30분 일찍 출근했습니다.';
        options = {
          icon: '/icons/early-arrival.png',
          tag: 'business-alert',
          data: { type: 'early-arrival', employeeName: '김철수', earlyMinutes: 30 }
        };
        break;

      case 'overtime':
        title = '⏰ 연장 근무 알림';
        body = '이영희님이 2시간 연장 근무를 진행했습니다.';
        options = {
          icon: '/icons/overtime.png',
          tag: 'business-alert',
          data: { type: 'overtime', employeeName: '이영희', overtimeMinutes: 120 }
        };
        break;

      case 'system-notice':
        title = '📢 시스템 공지';
        body = '앱이 새 버전으로 업데이트되었습니다. 새로운 기능을 확인해보세요!';
        options = {
          icon: '/icons/system-notice.png',
          tag: 'system-notice',
          data: { type: 'system-notice', version: '2.1.0' }
        };
        break;

      case 'emergency':
        title = '🚨 긴급 알림';
        body = '긴급 상황이 발생했습니다. 즉시 확인이 필요합니다.';
        options = {
          icon: '/icons/emergency.png',
          tag: 'emergency',
          requireInteraction: true,
          silent: false,
          data: { type: 'emergency', priority: 'urgent' },
          actions: [
            { action: 'view', title: '즉시 확인', icon: '/icons/action-urgent.png' },
            { action: 'call', title: '전화 걸기', icon: '/icons/action-call.png' }
          ]
        };
        break;

      default:
        title = '일반 알림';
        body = '이것은 일반적인 알림입니다.';
    }

    const success = await notification.showNotification(title, body, options);

    const logEntry = {
      timestamp: new Date().toLocaleString('ko-KR'),
      type: success ? 'sent' as const : 'error' as const,
      message: `${title} ${success ? '전송 성공' : '전송 실패'}`,
      data: options.data
    };

    setNotificationLog(prev => [logEntry, ...prev].slice(0, 20));
  };

  // 예약된 알림 목록 조회
  const checkScheduledNotifications = () => {
    const scheduled = notification.getScheduledNotifications();
    
    if (scheduled.length === 0) {
      alert('현재 예약된 알림이 없습니다.');
      return;
    }

    const notificationList = scheduled.map(n => 
      `• ${n.title}\n  예약 시간: ${new Date(n.scheduledTime).toLocaleString('ko-KR')}\n  사업장: ${n.data?.workplaceName || 'N/A'}`
    ).join('\n\n');

    alert(`예약된 알림 목록 (총 ${scheduled.length}개):\n\n${notificationList}`);
  };

  // 로그 지우기
  const clearLog = () => {
    setNotificationLog([]);
  };

  return (
    <DateNavigationProvider>
      <EnhancedTimeProvider>
        <div className="h-full bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                푸시 알림 시스템 데모
              </h1>
              <p className="text-gray-600">
                Web Push API 기반 알림 시스템의 다양한 기능을 테스트해보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* 알림 설정 */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <NotificationSettings 
                    onSettingsChange={(settings) => {
                      console.log('알림 설정 변경:', settings);
                    }}
                  />
                </div>
              </div>

              {/* 상태 및 컨트롤 */}
              <div className="space-y-6">
                {/* 권한 상태 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold mb-4">알림 상태</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">권한 상태:</span>
                      <span className={`text-sm font-medium ${
                        notification.hasPermission ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {notification.permissionState.permission === 'granted' ? '허용됨' : 
                         notification.permissionState.permission === 'denied' ? '거부됨' : '대기 중'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Service Worker:</span>
                      <span className={`text-sm font-medium ${
                        notification.isServiceWorkerReady ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {notification.isServiceWorkerReady ? '준비됨' : '대기 중'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">예약된 알림:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {notification.getScheduledNotifications().length}개
                      </span>
                    </div>
                  </div>

                  {notification.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{notification.error}</p>
                      <BaseButton
                        buttonState={{
                          label: "오류 지우기",
                          variant: "danger"
                        }}
                        onClick={notification.clearError}
                        className="mt-2 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* 빠른 테스트 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold mb-4">빠른 테스트</h2>
                  
                  <div className="space-y-3">
                    <BaseButton
                      buttonState={{
                        label: "즉시 알림",
                        icon: "🔔",
                        variant: "primary",
                        loading: notification.loading,
                        disabled: !notification.hasPermission
                      }}
                      onClick={sendImmediateNotification}
                      className="w-full"
                    />
                    
                    <BaseButton
                      buttonState={{
                        label: "테스트 알림",
                        icon: "🧪",
                        variant: "secondary",
                        loading: notification.loading,
                        disabled: !notification.hasPermission
                      }}
                      onClick={notification.sendTestNotification}
                      className="w-full"
                    />
                    
                    <BaseButton
                      buttonState={{
                        label: "예약 알림 확인",
                        icon: "📅",
                        variant: "secondary"
                      }}
                      onClick={checkScheduledNotifications}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* 근무 알림 예약 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">근무 알림 예약</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사업장 이름
                    </label>
                    <input
                      type="text"
                      value={workplaceName}
                      onChange={(e) => setWorkplaceName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="예: 본사, 강남점 등"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      근무 시작 시간
                    </label>
                    <input
                      type="time"
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      * 10분 전에 알림이 전송됩니다
                    </p>
                  </div>
                  
                  <BaseButton
                    buttonState={{
                      label: "근무 알림 예약",
                      icon: "⏰",
                      variant: "primary",
                      disabled: !notification.hasPermission || !workStartTime
                    }}
                    onClick={scheduleWorkNotification}
                    className="w-full"
                  />
                </div>
              </div>

              {/* 알림 타입 테스트 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">알림 타입 테스트</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <BaseButton
                    buttonState={{
                      label: "조기 출근",
                      icon: "⏰",
                      variant: "secondary",
                      disabled: !notification.hasPermission
                    }}
                    onClick={() => sendNotificationByType('early-arrival')}
                  />
                  
                  <BaseButton
                    buttonState={{
                      label: "연장 근무",
                      icon: "⏰",
                      variant: "secondary",
                      disabled: !notification.hasPermission
                    }}
                    onClick={() => sendNotificationByType('overtime')}
                  />
                  
                  <BaseButton
                    buttonState={{
                      label: "시스템 공지",
                      icon: "📢",
                      variant: "secondary",
                      disabled: !notification.hasPermission
                    }}
                    onClick={() => sendNotificationByType('system-notice')}
                  />
                  
                  <BaseButton
                    buttonState={{
                      label: "긴급 알림",
                      icon: "🚨",
                      variant: "danger",
                      disabled: !notification.hasPermission
                    }}
                    onClick={() => sendNotificationByType('emergency')}
                  />
                </div>
              </div>
            </div>

            {/* 알림 로그 */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">알림 로그</h2>
                <BaseButton
                  buttonState={{
                    label: "로그 지우기",
                    icon: "🗑️",
                    variant: "secondary"
                  }}
                  onClick={clearLog}
                />
              </div>
              
              {notificationLog.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📝</div>
                  <p className="text-gray-600">아직 알림 로그가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notificationLog.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        log.type === 'sent' ? 'bg-green-50 border-green-400' :
                        log.type === 'scheduled' ? 'bg-blue-50 border-blue-400' :
                        log.type === 'click' ? 'bg-purple-50 border-purple-400' :
                        'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {log.message}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>
                      {log.data && (
                        <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </EnhancedTimeProvider>
    </DateNavigationProvider>
  );
};