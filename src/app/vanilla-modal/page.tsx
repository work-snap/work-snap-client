"use client";

import React, { useState, useEffect } from "react";
import { modalDebugLogger } from "@/utils/modalDebugLogger";

export default function VanillaModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    modalDebugLogger.modal('VANILLA', message);
    console.log(`🧪 VANILLA MODAL: ${logMessage}`);
  };

  const openModal = () => {
    addLog('✅ 바닐라 모달 열기 시도');
    setIsOpen(true);
  };

  const closeModal = () => {
    addLog('❌ 바닐라 모달 닫기 시도');
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      addLog('🖱️ 배경 클릭으로 모달 닫기');
      closeModal();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      addLog('⌨️ ESC 키로 모달 닫기');
      closeModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      addLog('🎯 모달이 열림 상태로 변경됨');
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      addLog('🚪 모달이 닫힘 상태로 변경됨');
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🍦 순수 바닐라 모달 테스트
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">컨트롤 패널</h2>
          
          <div className="space-y-4">
            <button 
              onClick={openModal}
              disabled={isOpen}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isOpen 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              바닐라 모달 열기
            </button>
            
            <button 
              onClick={closeModal}
              disabled={!isOpen}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !isOpen 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              바닐라 모달 닫기
            </button>

            <div className="border-t pt-4">
              <div className="text-sm space-y-2">
                <div>
                  <strong>현재 상태:</strong> 
                  <span className={isOpen ? 'text-green-600' : 'text-red-600'}>
                    {isOpen ? ' OPEN' : ' CLOSED'}
                  </span>
                </div>
                <div>
                  <strong>라이브러리:</strong> 순수 React + CSS
                </div>
                <div>
                  <strong>애니메이션:</strong> CSS Transition
                </div>
              </div>
            </div>

            <button 
              onClick={() => setLogs([])}
              className="w-full py-2 px-4 rounded-lg bg-gray-500 text-white hover:bg-gray-600 text-sm"
            >
              로그 지우기
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">실시간 로그</h2>
          
          <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg border font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                로그가 없습니다
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
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">🧪 테스트 목적</h3>
        <p className="text-sm text-yellow-700">
          이 모달은 HeroUI, Framer Motion, 기타 라이브러리 없이 순수한 React와 CSS로만 구현되었습니다.
          만약 이 모달도 비정상적으로 동작한다면 브라우저나 기본 React 설정에 문제가 있을 수 있습니다.
        </p>
      </div>

      {/* 순수 바닐라 모달 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={handleBackdropClick}
          style={{
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-transform duration-300"
            style={{
              transform: isOpen ? 'scale(1)' : 'scale(0.9)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">🍦 순수 바닐라 모달</h3>
              <button
                onClick={() => {
                  addLog('❌ X 버튼으로 모달 닫기');
                  closeModal();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ 성공!</h4>
                  <p className="text-sm text-green-700">
                    이 모달이 정상적으로 열리고 유지된다면, 문제는 HeroUI나 다른 라이브러리에 있습니다.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🔧 기능 테스트</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ESC 키로 닫기</li>
                    <li>• 배경 클릭으로 닫기</li>
                    <li>• X 버튼으로 닫기</li>
                    <li>• 버튼으로 닫기</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    열린 시간: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  addLog('👆 취소 버튼 클릭됨');
                  closeModal();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  addLog('👆 확인 버튼 클릭됨');
                  closeModal();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}