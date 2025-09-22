import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { Database, Trash2, AlertTriangle, Search } from "lucide-react";

export default function DataCleanupCard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cleanupType, setCleanupType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const cleanupOptions = [
    {
      id: "invalid-records",
      title: "유효하지 않은 출석 기록",
      description: "손상되거나 불완전한 출석 데이터를 정리합니다",
      risk: "LOW",
      estimatedCount: 45,
    },
    {
      id: "orphaned-data",
      title: "고아 데이터",
      description: "참조되지 않는 데이터를 정리합니다",
      risk: "MEDIUM",
      estimatedCount: 12,
    },
    {
      id: "user-specific",
      title: "특정 사용자 데이터",
      description: "지정된 사용자의 모든 출석 기록을 정리합니다",
      risk: "HIGH",
      estimatedCount: null,
    },
  ];

  const handleCleanup = async () => {
    setIsLoading(true);
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));

      const option = cleanupOptions.find(opt => opt.id === cleanupType);
      alert(`${option?.title} 정리가 완료되었습니다.`);
      onClose();
      setCleanupType("");
      setUserId("");
    } catch (error) {
      alert("데이터 정리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCleanupModal = (type: string) => {
    setCleanupType(type);
    onOpen();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "danger";
      default:
        return "default";
    }
  };

  const selectedOption = cleanupOptions.find(opt => opt.id === cleanupType);

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            데이터 정리
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {cleanupOptions.map((option) => (
            <div
              key={option.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {option.title}
                    </h4>
                    <Chip
                      size="sm"
                      color={getRiskColor(option.risk)}
                      variant="flat"
                    >
                      {option.risk}
                    </Chip>
                  </div>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                  {option.estimatedCount && (
                    <p className="text-xs text-gray-500 mt-1">
                      예상 정리 대상: {option.estimatedCount}건
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="bordered"
                  startContent={<Search className="w-3 h-3" />}
                >
                  미리보기
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 className="w-3 h-3" />}
                  onClick={() => openCleanupModal(option.id)}
                >
                  정리 실행
                </Button>
              </div>
            </div>
          ))}

          {/* 통계 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-gray-900 mb-2">
              데이터베이스 상태
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">전체 출석 기록:</span>
                <p className="font-medium">1,245건</p>
              </div>
              <div>
                <span className="text-gray-600">정리 가능:</span>
                <p className="font-medium text-orange-600">57건</p>
              </div>
              <div>
                <span className="text-gray-600">마지막 정리:</span>
                <p className="font-medium">3일 전</p>
              </div>
              <div>
                <span className="text-gray-600">데이터 사용량:</span>
                <p className="font-medium">125.4MB</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 데이터 정리 확인 모달 */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        // HeroUI 안정성 최적화 적용
        disableAnimation={true}
        hideCloseButton={false}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
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
          <ModalHeader>데이터 정리 확인</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700">
                    주의: 이 작업은 되돌릴 수 없습니다
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOption?.title}을(를) 정리하시겠습니까?
                  </p>
                </div>
              </div>

              {selectedOption?.id === "user-specific" && (
                <div>
                  <Input
                    label="사용자 ID"
                    placeholder="정리할 사용자 ID를 입력하세요"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-700">
                  • 정리된 데이터는 복구할 수 없습니다
                </p>
                <p className="text-sm text-red-700">
                  • 데이터 백업을 먼저 확인해주세요
                </p>
                {selectedOption?.estimatedCount && (
                  <p className="text-sm text-red-700">
                    • 예상 정리 대상: {selectedOption.estimatedCount}건
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>
              취소
            </Button>
            <Button
              color="danger"
              onClick={handleCleanup}
              isLoading={isLoading}
              disabled={selectedOption?.id === "user-specific" && !userId.trim()}
            >
              정리 실행
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}