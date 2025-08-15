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

export default function ForceModalVisiblePage() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-9), logEntry]);
    console.log(`💪 FORCE VISIBLE: ${logEntry}`);
  };

  // 모달이 열릴 때 강제로 CSS 수정 - 즉시 적용
  useEffect(() => {
    if (isOpen) {
      addLog('🔧 모달 열림 - 즉시 CSS 강제 수정');
      
      // 즉시 강제 CSS 적용 (지연 없음)
      const forceVisible = () => {
        // 모든 모달 관련 요소 찾기
        const selectors = [
          '[data-slot="backdrop"]',
          '[role="dialog"][aria-modal="true"]', 
          '[data-overlay-container="true"]',
          '[class*="modal"]',
          '[class*="Modal"]'
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element) => {
            const el = element as HTMLElement;
            // 모든 가능한 CSS 속성을 강제로 설정
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('display', 'flex', 'important');
            el.style.setProperty('transform', 'scale(1)', 'important');
            el.style.setProperty('transition', 'none', 'important');
            el.style.setProperty('animation', 'none', 'important');
            
            if (selector.includes('backdrop')) {
              el.style.setProperty('z-index', '9998', 'important');
              el.style.setProperty('position', 'fixed', 'important');
              el.style.setProperty('inset', '0', 'important');
              el.style.setProperty('background-color', 'rgba(0, 0, 0, 0.5)', 'important');
            } else {
              el.style.setProperty('z-index', '9999', 'important');
            }
          });
        });
        
        addLog('⚡ 즉시 CSS 강제 적용 완료');
      };

      // 즉시 실행
      forceVisible();
      
      // 추가 보험으로 여러 번 실행
      const timers = [
        setTimeout(forceVisible, 0),
        setTimeout(forceVisible, 10),
        setTimeout(forceVisible, 50),
        setTimeout(forceVisible, 100)
      ];

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    } else {
      addLog('📊 모달 닫힘');
    }
  }, [isOpen]);

  const handleOpen = () => {
    addLog('🟢 모달 열기 버튼 클릭');
    onOpen();
  };

  const handleClose = () => {
    addLog('🔴 모달 닫기 버튼 클릭');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    addLog(`🔄 onOpenChange: ${open ? 'OPEN' : 'CLOSE'}`);
    onOpenChange();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        💪 강제 모달 가시성 테스트
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
                onPress={handleOpen}
                className="w-full"
                isDisabled={isOpen}
                size="lg"
              >
                {isOpen ? '모달 열려있음' : '강제 가시성 모달 열기'}
              </Button>
              
              <Button 
                color="danger" 
                onPress={handleClose}
                className="w-full"
                isDisabled={!isOpen}
              >
                모달 강제 닫기
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
                  <strong>강제 CSS:</strong> 
                  <span className="text-blue-600">활성화됨</span>
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
            <h2 className="text-xl font-semibold">실시간 로그</h2>
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
        <h3 className="font-semibold text-green-800 mb-2">💪 강제 수정 내용</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• 백드롭: opacity=1, visibility=visible, display=block</li>
          <li>• 다이얼로그: opacity=1, visibility=visible, transform=scale(1)</li>
          <li>• 오버레이: position=fixed, inset=0, z-index=9999</li>
          <li>• 모든 CSS 속성을 인라인 스타일로 강제 오버라이드</li>
        </ul>
      </div>

      {/* 강제 가시성이 적용된 HeroUI 모달 */}
      <Modal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        placement="center"
        backdrop="blur"
        closeButton
        isDismissable={true}
        size="lg"
        classNames={{
          wrapper: "z-[9999]",
          backdrop: "z-[9998]",
          base: "z-[9999]"
        }}
        // 애니메이션 완전 비활성화
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
                💪 강제 가시성 모달
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🎯 테스트 결과</h3>
                    <p className="text-sm text-green-700">
                      이 모달이 즉시 보인다면 CSS 강제 수정이 성공했습니다!
                      리사이즈 없이도 바로 표시되어야 합니다.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">🔧 적용된 수정</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• JavaScript로 직접 CSS 조작</li>
                      <li>• 인라인 스타일로 최고 우선순위</li>
                      <li>• 애니메이션 최소화 (0.05초)</li>
                      <li>• z-index 9999로 최상위</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      열린 시간: {new Date().toLocaleTimeString()}
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