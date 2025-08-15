"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export default function ModalDebugPage() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 실행되도록 보장
  useEffect(() => {
    setIsClient(true);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog(`Modal state changed: isOpen=${isOpen}`);
  }, [isOpen]);

  const handleOpenModal = () => {
    addLog("Open button clicked");
    onOpen();
  };

  const handleCloseModal = () => {
    addLog("Close button clicked");
    onClose();
  };

  const handleModalOpenChange = (open: boolean) => {
    addLog(`onOpenChange called with: ${open}`);
    onOpenChange();
  };

  // 클라이언트 사이드 렌더링 보장
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">HeroUI Modal Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 컨트롤 패널 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Controls</h2>
          
          <div className="space-y-2">
            <Button 
              color="primary" 
              onPress={handleOpenModal}
              className="w-full"
            >
              모달 열기
            </Button>
            
            <Button 
              color="secondary" 
              onPress={handleCloseModal}
              className="w-full"
            >
              모달 강제 닫기
            </Button>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Current State</h3>
            <p>isOpen: <span className={isOpen ? "text-green-600" : "text-red-600"}>{String(isOpen)}</span></p>
          </div>
        </div>

        {/* 디버그 로그 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
          <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm font-mono">
            {debugLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
          <Button 
            size="sm" 
            variant="flat" 
            onPress={() => setDebugLog([])}
            className="mt-2"
          >
            로그 지우기
          </Button>
        </div>
      </div>

      {/* 실제 모달 */}
      <Modal
        isOpen={isOpen}
        onOpenChange={handleModalOpenChange}
        placement="center"
        closeButton
        backdrop="blur"
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
                🔍 Debug Modal
              </ModalHeader>
              <ModalBody>
                <p>이 모달이 즉시 닫히는지 확인해보세요.</p>
                <p>닫힌다면 아래 로그를 확인하여 어떤 이벤트가 발생했는지 봅시다.</p>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm">
                    <strong>현재 상태:</strong> isOpen = {String(isOpen)}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => {
                    addLog("Modal footer close button clicked");
                    onClose();
                  }}
                >
                  닫기
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    addLog("Modal footer confirm button clicked");
                    onClose();
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