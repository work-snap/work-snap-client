'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Code } from '@heroui/react';
import { getFCMToken } from '@/services/firebaseConfig';
import { useFcmToken } from '@/hooks/useFcmToken';

/**
 * FCM 테스트 패널
 * Firebase 알림 기능을 쉽게 테스트할 수 있는 UI
 */
export default function FCMTestPanel() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { registerToken, isRegistered } = useFcmToken();

  // 1. FCM 토큰 가져오기
  const handleGetToken = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // 알림 권한 요청
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setTestResult({
          success: false,
          message: '알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.'
        });
        return;
      }

      // FCM 토큰 가져오기
      const token = await getFCMToken();

      if (token) {
        setFcmToken(token);
        setTestResult({
          success: true,
          message: 'FCM 토큰을 성공적으로 가져왔습니다!',
          token
        });
      } else {
        setTestResult({
          success: false,
          message: 'FCM 토큰을 가져오지 못했습니다.'
        });
      }
    } catch (error) {
      console.error('FCM 토큰 가져오기 실패:', error);
      setTestResult({
        success: false,
        message: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. 서버에 FCM 토큰 등록
  const handleRegisterToken = async () => {
    if (!fcmToken) {
      setTestResult({
        success: false,
        message: '먼저 FCM 토큰을 가져와주세요.'
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const success = await registerToken(fcmToken);

      setTestResult({
        success,
        message: success
          ? '서버에 FCM 토큰이 등록되었습니다!'
          : '토큰 등록에 실패했습니다.'
      });
    } catch (error) {
      console.error('토큰 등록 실패:', error);
      setTestResult({
        success: false,
        message: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. 빠른 테스트 알림 전송
  const handleQuickTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/notifications/test/quick', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      setTestResult({
        success: data.success,
        message: data.message,
        method: data.method
      });
    } catch (error) {
      console.error('빠른 테스트 실패:', error);
      setTestResult({
        success: false,
        message: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 토큰 복사
  const handleCopyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setTestResult({
        success: true,
        message: 'FCM 토큰이 클립보드에 복사되었습니다!'
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">🔔 FCM 알림 테스트</h3>
        <p className="text-sm text-default-500">
          Firebase Cloud Messaging 알림 기능을 테스트합니다
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        {/* 1단계: FCM 토큰 가져오기 */}
        <div className="space-y-2">
          <h4 className="font-semibold">1단계: FCM 토큰 가져오기</h4>
          <p className="text-sm text-default-500">
            브라우저에서 알림 권한을 요청하고 FCM 토큰을 가져옵니다.
          </p>
          <Button
            color="primary"
            onClick={handleGetToken}
            isLoading={loading}
            className="w-full"
          >
            FCM 토큰 가져오기
          </Button>

          {fcmToken && (
            <div className="mt-2">
              <Code className="w-full text-xs break-all">
                {fcmToken}
              </Code>
              <Button
                size="sm"
                variant="flat"
                onClick={handleCopyToken}
                className="mt-2"
              >
                토큰 복사
              </Button>
            </div>
          )}
        </div>

        <Divider />

        {/* 2단계: 서버에 토큰 등록 */}
        <div className="space-y-2">
          <h4 className="font-semibold">2단계: 서버에 토큰 등록</h4>
          <p className="text-sm text-default-500">
            가져온 FCM 토큰을 서버에 등록합니다. (로그인 필요)
          </p>
          <Button
            color="secondary"
            onClick={handleRegisterToken}
            isLoading={loading}
            isDisabled={!fcmToken}
            className="w-full"
          >
            서버에 토큰 등록
          </Button>

          {isRegistered && (
            <p className="text-sm text-success">✅ 토큰이 이미 등록되어 있습니다</p>
          )}
        </div>

        <Divider />

        {/* 3단계: 테스트 알림 전송 */}
        <div className="space-y-2">
          <h4 className="font-semibold">3단계: 테스트 알림 전송</h4>
          <p className="text-sm text-default-500">
            서버에서 테스트 알림을 전송합니다. (로그인 시 자동으로 등록된 토큰 사용)
          </p>
          <Button
            color="success"
            onClick={handleQuickTest}
            isLoading={loading}
            className="w-full"
          >
            테스트 알림 보내기
          </Button>
        </div>

        {/* 결과 표시 */}
        {testResult && (
          <>
            <Divider />
            <div className={`p-4 rounded-lg ${
              testResult.success
                ? 'bg-success-50 border-2 border-success'
                : 'bg-danger-50 border-2 border-danger'
            }`}>
              <p className={`font-semibold ${
                testResult.success ? 'text-success' : 'text-danger'
              }`}>
                {testResult.success ? '✅ 성공' : '❌ 실패'}
              </p>
              <p className="text-sm mt-1">{testResult.message}</p>
              {testResult.method && (
                <p className="text-xs mt-1 text-default-500">
                  사용된 토큰: {testResult.method}
                </p>
              )}
            </div>
          </>
        )}

        {/* 도움말 */}
        <Divider />
        <div className="text-sm text-default-500 space-y-1">
          <p className="font-semibold">💡 도움말</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>알림 권한을 허용해야 FCM 토큰을 받을 수 있습니다</li>
            <li>로그인하지 않아도 1단계는 가능합니다</li>
            <li>2단계와 3단계는 로그인이 필요합니다</li>
            <li>Swagger에서 직접 테스트할 수도 있습니다</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
