"use client";

import React, { useState } from "react";
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
  Divider,
} from "@heroui/react";
import { modalDebugLogger } from "@/utils/modalDebugLogger";

export default function NoAnimationModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    modalDebugLogger.modal('TEST_RESULT', message);
  };

  const openModal = () => {
    addResult('✅ 모달 열기 시도');
    setIsOpen(true);
  };

  const closeModal = () => {
    addResult('✅ 모달 닫기 시도');
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    addResult(`🔄 onOpenChange 호출됨: ${open}`);
    if (!open) {
      setIsOpen(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    modalDebugLogger.clear();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎭 애니메이션 비활성화 모달 테스트
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
                onPress={openModal}
                className="w-full"
                isDisabled={isOpen}
              >
                모달 열기 (애니메이션 없음)
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

            <Divider />

            <div className="space-y-2">
              <div className="text-sm">
                <strong>현재 상태:</strong> 
                <span className={isOpen ? 'text-green-600' : 'text-red-600'}>
                  {isOpen ? ' OPEN' : ' CLOSED'}
                </span>
              </div>
              <div className="text-sm">
                <strong>테스트 목적:</strong> Framer Motion 애니메이션 충돌 확인
              </div>
            </div>

            <Divider />

            <Button 
              color="secondary" 
              variant="flat"
              onPress={clearResults}
              className="w-full"
              size="sm"
            >
              결과 지우기
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">테스트 결과</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg font-mono text-sm">
              {testResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  테스트를 시작하세요
                </div>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-gray-800">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 애니메이션이 완전히 비활성화된 모달 */}
      <Modal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        placement="center"
        backdrop="opaque"
        closeButton
        isDismissable={true}
        size="md"
        // HeroUI 안정성 최적화 적용
        disableAnimation={true}
        motionProps={{
          variants: {
            enter: { opacity: 1, scale: 1, transition: { duration: 0 } },
            exit: { opacity: 1, scale: 1, transition: { duration: 0 } }
          }
        }}
        classNames={{
          wrapper: "z-[9999]",
          backdrop: "z-[9998] bg-black/50",
          base: "z-[9999] bg-white"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                🎭 애니메이션 없는 모달
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      🧪 테스트 중인 항목들
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Framer Motion 애니메이션 충돌</li>
                      <li>• 즉시 렌더링 성능</li>
                      <li>• 상태 변화 지연 없음</li>
                      <li>• 이벤트 리스너 간섭</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ 예상 결과
                    </h3>
                    <p className="text-sm text-green-700">
                      이 모달은 애니메이션이 없어서 즉시 열리고 닫혀야 합니다.
                      만약 여전히 문제가 있다면 애니메이션이 원인이 아닙니다.
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      모달 열린 시간: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => {
                    addResult('👆 Footer 닫기 버튼 클릭됨');
                    onClose();
                    closeModal();
                  }}
                >
                  닫기
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    addResult('👆 Footer 확인 버튼 클릭됨');
                    onClose();
                    closeModal();
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