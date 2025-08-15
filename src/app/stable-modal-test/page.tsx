"use client";

import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function StableModalTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-9), logEntry]);
    console.log(`🎯 STABLE: ${logEntry}`);
  };

  const openModal = () => {
    addLog('🟢 모달 열기');
    setIsOpen(true);
  };

  const closeModal = () => {
    addLog('🔴 모달 닫기');
    setIsOpen(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎯 안정적인 모달 테스트 (애니메이션 없음)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">컨트롤</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <Button 
                color="primary" 
                onPress={openModal}
                className="w-full"
                isDisabled={isOpen}
                size="lg"
              >
                {isOpen ? '모달 열려있음' : '안정적인 모달 열기'}
              </Button>
              
              <Button 
                color="danger" 
                onPress={closeModal}
                className="w-full"
                isDisabled={!isOpen}
              >
                모달 닫기
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm space-y-2">
                <div>
                  <strong>모달 상태:</strong> 
                  <span className={isOpen ? 'text-green-600' : 'text-red-600'}>
                    {isOpen ? ' OPEN' : ' CLOSED'}
                  </span>
                </div>
                <div>
                  <strong>구현:</strong> 
                  <span className="text-blue-600">순수 CSS + React</span>
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

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">✨ 안정적인 구현</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• HeroUI 모달 대신 순수 CSS 사용</li>
          <li>• 애니메이션 완전 제거</li>
          <li>• 즉시 표시/숨김</li>
          <li>• React 상태 기반 단순 렌더링</li>
        </ul>
      </div>

      {/* 완전히 안정적인 순수 CSS 모달 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          style={{
            zIndex: 9999,
            opacity: 1,
            visibility: 'visible'
          }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6"
            style={{
              opacity: 1,
              visibility: 'visible',
              transform: 'scale(1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🎯 안정적인 모달</h3>
              <button
                onClick={() => {
                  addLog('❌ X 버튼');
                  closeModal();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">✅ 특징</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 애니메이션 깜빡임 없음</li>
                  <li>• 즉시 표시됨</li>
                  <li>• 안정적인 렌더링</li>
                  <li>• 라이브러리 충돌 없음</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🔧 구현 방식</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {`{isOpen && <div>}`} 조건부 렌더링</li>
                  <li>• 인라인 스타일로 확실한 표시</li>
                  <li>• position: fixed 직접 사용</li>
                  <li>• z-index 9999로 최상위</li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  열린 시간: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  addLog('👆 취소 버튼');
                  closeModal();
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                color="primary"
                onPress={() => {
                  addLog('👆 확인 버튼');
                  closeModal();
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