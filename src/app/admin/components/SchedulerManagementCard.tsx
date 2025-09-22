import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Clock, Play, Pause, Settings, AlertTriangle } from "lucide-react";

export default function SchedulerManagementCard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedScheduler, setSelectedScheduler] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const schedulers = [
    {
      id: "attendance",
      name: "출석 스케줄러",
      status: "ACTIVE",
      lastRun: "2025-09-19T10:00:00Z",
      nextRun: "2025-09-19T11:00:00Z",
      description: "결석 처리 및 출석 데이터 업데이트",
    },
    {
      id: "contract",
      name: "계약 만료 스케줄러",
      status: "ACTIVE",
      lastRun: "2025-09-19T09:30:00Z",
      nextRun: "2025-09-20T09:30:00Z",
      description: "만료된 계약의 직원 상태 업데이트",
    },
  ];

  const handleSchedulerAction = async (schedulerId: string, action: string) => {
    setIsLoading(true);
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (action === "run") {
        alert(`${schedulers.find(s => s.id === schedulerId)?.name} 수동 실행이 완료되었습니다.`);
      } else if (action === "pause") {
        alert(`${schedulers.find(s => s.id === schedulerId)?.name}가 일시 정지되었습니다.`);
      } else if (action === "resume") {
        alert(`${schedulers.find(s => s.id === schedulerId)?.name}가 재개되었습니다.`);
      }
      onClose();
    } catch (error) {
      alert("작업 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmModal = (schedulerId: string) => {
    setSelectedScheduler(schedulerId);
    onOpen();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PAUSED":
        return "warning";
      case "ERROR":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            스케줄러 관리
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {schedulers.map((scheduler) => (
            <div
              key={scheduler.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {scheduler.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {scheduler.description}
                  </p>
                </div>
                <Chip
                  size="sm"
                  color={getStatusColor(scheduler.status)}
                  variant="flat"
                >
                  {scheduler.status}
                </Chip>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">마지막 실행:</span>
                  <p className="font-medium">{formatDate(scheduler.lastRun)}</p>
                </div>
                <div>
                  <span className="text-gray-600">다음 실행:</span>
                  <p className="font-medium">{formatDate(scheduler.nextRun)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Play className="w-3 h-3" />}
                  onClick={() => openConfirmModal(scheduler.id)}
                >
                  수동 실행
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  startContent={
                    scheduler.status === "ACTIVE" ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )
                  }
                >
                  {scheduler.status === "ACTIVE" ? "일시 정지" : "재개"}
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  startContent={<Settings className="w-3 h-3" />}
                >
                  설정
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* 확인 모달 */}
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
          <ModalHeader>스케줄러 수동 실행</ModalHeader>
          <ModalBody>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">
                  {schedulers.find(s => s.id === selectedScheduler)?.name}를
                  즉시 실행하시겠습니까?
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  이 작업은 몇 분 정도 소요될 수 있습니다.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>
              취소
            </Button>
            <Button
              color="primary"
              onClick={() => handleSchedulerAction(selectedScheduler, "run")}
              isLoading={isLoading}
            >
              실행
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}