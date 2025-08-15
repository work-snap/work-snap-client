"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  useDisclosure,
} from "@heroui/react";

export default function SimpleModalTestPage() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [logs, setLogs] = useState<string[]>([]);
  const [modalCount, setModalCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-9), logEntry]); // Keep only last 10 logs
    console.log(`🔹 SIMPLE: ${logEntry}`);
  };

  const handleOpen = () => {
    setModalCount(prev => prev + 1);
    addLog(`🟢 모달 열기 시도 #${modalCount + 1}`);
    onOpen();
  };

  const handleClose = () => {
    addLog('🔴 모달 닫기 시도');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    addLog(`🔄 onOpenChange: ${open ? 'OPEN' : 'CLOSE'}`);
    onOpenChange();
  };

  // Track modal state changes with minimal logging
  useEffect(() => {
    addLog(`📊 모달 상태 변경: ${isOpen ? 'OPEN' : 'CLOSED'}`);
    
    // DOM 렌더링 상태 확인
    setTimeout(() => {
      const modalElements = {
        backdrop: document.querySelectorAll('[data-slot="backdrop"]').length,
        dialog: document.querySelectorAll('[role="dialog"]').length,
        modalWrapper: document.querySelectorAll('[data-testid="modal"]').length,
        anyModal: document.querySelectorAll('[class*="modal"]').length
      };
      addLog(`🔍 DOM 확인: ${JSON.stringify(modalElements)}`);
      
      if (isOpen) {
        // CSS 가시성 확인
        const backdrop = document.querySelector('[data-slot="backdrop"]') as HTMLElement;
        const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
        
        if (backdrop) {
          const backdropStyles = window.getComputedStyle(backdrop);
          addLog(`🎨 Backdrop CSS: opacity=${backdropStyles.opacity}, zIndex=${backdropStyles.zIndex}, display=${backdropStyles.display}`);
        }
        
        if (dialog) {
          const dialogStyles = window.getComputedStyle(dialog);
          addLog(`🎨 Dialog CSS: opacity=${dialogStyles.opacity}, zIndex=${dialogStyles.zIndex}, display=${dialogStyles.display}, transform=${dialogStyles.transform}`);
        }
      }
    }, 100);
  }, [isOpen]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎯 간단한 모달 테스트
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-blue-800 mb-2">📝 테스트 목적</h2>
        <p className="text-sm text-blue-700">
          최소한의 로깅으로 HeroUI 모달의 기본 동작을 확인합니다. 
          침습적인 이벤트 추적 없이 순수한 상태만 모니터링합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">🎮 컨트롤</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <Button 
                color="primary" 
                onPress={handleOpen}
                className="w-full"
                isDisabled={isOpen}
                size="lg"
              >
                {isOpen ? '모달이 열려있음' : `모달 열기 (#${modalCount + 1})`}
              </Button>
              
              <Button 
                color="danger" 
                variant="flat"
                onPress={handleClose}
                className="w-full"
                isDisabled={!isOpen}
              >
                모달 강제 닫기
              </Button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium mb-2">현재 상태</h3>
              <div className="space-y-1 text-sm">
                <div>
                  모달: <span className={`font-mono ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <div>시도 횟수: <span className="font-mono">{modalCount}</span></div>
                <div>로그 수: <span className="font-mono">{logs.length}</span></div>
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
            <h2 className="text-xl font-semibold">📋 간단 로그 (비침습적)</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg border font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  로그 없음 - 침습적 디버깅 비활성화됨
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
            <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
              ✅ 이벤트 리스너 오버라이드 비활성화됨
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 최소한의 이벤트만 사용하는 순수 HeroUI 모달 */}
      <Modal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        placement="center"
        backdrop="blur"
        closeButton
        isDismissable={true}
        size="lg"
        classNames={{
          wrapper: "z-[9999] !opacity-100",
          backdrop: "z-[9998] bg-black/50 !opacity-100 !block",
          base: "z-[9999] bg-white !opacity-100 !block !scale-100"
        }}
        disableAnimation={true}
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0 }
            },
            exit: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0 }
            }
          }
        }}
      >
        <ModalContent>
          {(onModalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ✨ 간단한 테스트 모달
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🎉 성공!</h3>
                    <p className="text-sm text-green-700">
                      이 모달이 안정적으로 열리고 유지된다면, 이전 문제는 
                      과도한 이벤트 추적 때문이었습니다.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">🔧 테스트 항목</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• ESC 키로 닫기</li>
                      <li>• 배경 클릭으로 닫기</li>
                      <li>• 버튼으로 닫기</li>
                      <li>• 반복 열기/닫기</li>
                    </ul>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">
                      시도 #{modalCount} • {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => {
                    addLog('👆 모달 내부 닫기 버튼');
                    onModalClose();
                    handleClose();
                  }}
                >
                  닫기
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    addLog('👆 모달 내부 확인 버튼');
                    onModalClose();
                    handleClose();
                  }}
                >
                  확인
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}