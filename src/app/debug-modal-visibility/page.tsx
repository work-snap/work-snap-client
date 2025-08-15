"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";

export default function DebugModalVisibilityPage() {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showTailwindModal, setShowTailwindModal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-9), logEntry]);
    console.log(`🐛 VISIBILITY DEBUG: ${logEntry}`);
  };

  // 리사이즈 이벤트 감지
  useEffect(() => {
    const handleResize = () => {
      addLog(`📏 리사이즈 감지: ${window.innerWidth}x${window.innerHeight}`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🔍 모달 가시성 문제 디버깅
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">테스트 컨트롤</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <Button 
                color="primary" 
                onPress={() => {
                  addLog('🟢 커스텀 모달 열기 시도');
                  setShowCustomModal(true);
                }}
                className="w-full"
              >
                커스텀 모달 열기
              </Button>
              
              <Button 
                color="secondary" 
                onPress={() => {
                  addLog('🟦 테일윈드 모달 열기 시도');
                  setShowTailwindModal(true);
                }}
                className="w-full"
              >
                테일윈드 모달 열기
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm space-y-2">
                <div>
                  <strong>커스텀 모달:</strong> 
                  <span className={showCustomModal ? 'text-green-600' : 'text-red-600'}>
                    {showCustomModal ? ' SHOW' : ' HIDDEN'}
                  </span>
                </div>
                <div>
                  <strong>테일윈드 모달:</strong> 
                  <span className={showTailwindModal ? 'text-green-600' : 'text-red-600'}>
                    {showTailwindModal ? ' SHOW' : ' HIDDEN'}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              size="sm"
              variant="flat"
              onPress={() => setLogs([])}
              className="w-full"
            >
              로그 지우기
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">로그</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg border font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  로그 없음
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-gray-800">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">🧪 테스트 목적</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 리사이즈 시에만 모달이 보이는 현상 재현</li>
          <li>• CSS와 DOM 렌더링 타이밍 문제 확인</li>
          <li>• 애니메이션 없는 즉시 표시 모달 테스트</li>
          <li>• 개발자 도구 열기 시 동작 확인</li>
        </ul>
      </div>

      {/* 커스텀 모달 - position: fixed 직접 사용 */}
      {showCustomModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: 1,
            visibility: 'visible',
            display: 'flex'
          }}
          onClick={() => {
            addLog('🖱️ 커스텀 모달 배경 클릭');
            setShowCustomModal(false);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6"
            style={{
              opacity: 1,
              visibility: 'visible',
              display: 'block',
              transform: 'scale(1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🔧 커스텀 모달</h3>
              <button
                onClick={() => {
                  addLog('❌ 커스텀 모달 X 버튼');
                  setShowCustomModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  이 모달은 position: fixed와 인라인 스타일을 사용하여 
                  CSS 우선순위 문제를 우회합니다.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  현재 시간: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  addLog('👆 커스텀 모달 취소');
                  setShowCustomModal(false);
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                color="primary"
                onPress={() => {
                  addLog('👆 커스텀 모달 확인');
                  setShowCustomModal(false);
                }}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 테일윈드 모달 - 클래스만 사용 */}
      {showTailwindModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center opacity-100 visible"
          onClick={() => {
            addLog('🖱️ 테일윈드 모달 배경 클릭');
            setShowTailwindModal(false);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 opacity-100 visible scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">💨 테일윈드 모달</h3>
              <button
                onClick={() => {
                  addLog('❌ 테일윈드 모달 X 버튼');
                  setShowTailwindModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  이 모달은 테일윈드 클래스만 사용하여 가시성 문제를 테스트합니다.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  현재 시간: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  addLog('👆 테일윈드 모달 취소');
                  setShowTailwindModal(false);
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                color="primary"
                onPress={() => {
                  addLog('👆 테일윈드 모달 확인');
                  setShowTailwindModal(false);
                }}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}