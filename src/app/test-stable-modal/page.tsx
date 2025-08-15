"use client";

import React, { useState, useCallback } from "react";
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
} from "@heroui/react";

export default function TestStableModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCount, setModalCount] = useState(0);

  const openModal = useCallback(() => {
    setModalCount(prev => prev + 1);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalChange = useCallback((open: boolean) => {
    if (!open) {
      setIsModalOpen(false);
    }
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🚀 안정화된 모달 테스트
      </h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">모달 상태 테스트</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <span>모달 열림 횟수:</span>
            <span className="font-mono text-lg">{modalCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>현재 모달 상태:</span>
            <span className={`font-mono text-lg ${isModalOpen ? 'text-green-600' : 'text-red-600'}`}>
              {isModalOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div className="pt-4">
            <Button 
              color="primary" 
              size="lg"
              onPress={openModal}
              className="w-full"
              isDisabled={isModalOpen}
            >
              {isModalOpen ? '모달이 열려있음' : '모달 열기 🎯'}
            </Button>
          </div>

          <div className="text-sm text-gray-600 mt-4">
            <p><strong>테스트 방법:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>버튼을 클릭하여 모달을 엽니다</li>
              <li>모달이 즉시 닫히지 않고 유지되는지 확인합니다</li>
              <li>ESC 키나 닫기 버튼으로 모달을 닫을 수 있는지 확인합니다</li>
              <li>배경을 클릭하여 모달이 닫히는지 확인합니다</li>
            </ul>
          </div>
        </CardBody>
      </Card>

      {/* 안정화된 모달 */}
      <Modal
        isOpen={isModalOpen}
        onOpenChange={handleModalChange}
        placement="center"
        backdrop="blur"
        closeButton={true}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        size="lg"
        scrollBehavior="inside"
        radius="lg"
        shadow="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-2">
                <h3 className="text-xl font-bold">✨ 완벽한 모달</h3>
                <p className="text-sm text-gray-500">이제 정상적으로 작동합니다!</p>
              </ModalHeader>
              
              <ModalBody className="py-4">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🎉 문제 해결 완료!</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✅ 모달이 즉시 닫히지 않음</li>
                      <li>✅ 이벤트 충돌 해결됨</li>
                      <li>✅ 안정적인 상태 관리</li>
                      <li>✅ React 18 호환성 확보</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🔧 적용된 수정사항</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Radix UI 의존성 완전 제거</li>
                      <li>• 글로벌 키보드 이벤트 관리자 구현</li>
                      <li>• Z-index 체계 표준화</li>
                      <li>• Provider 계층 최적화</li>
                      <li>• Hydration 문제 해결</li>
                    </ul>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-lg">
                      현재 시간: <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>
              </ModalBody>
              
              <ModalFooter className="pt-2">
                <Button 
                  color="danger" 
                  variant="flat" 
                  onPress={() => {
                    onClose();
                    closeModal();
                  }}
                >
                  닫기
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    onClose();
                    closeModal();
                  }}
                >
                  완료
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}