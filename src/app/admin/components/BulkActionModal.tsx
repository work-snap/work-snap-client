import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulkAction: "approve" | "reject" | null;
  selectedItemsCount: number;
  bulkReason: string;
  setBulkReason: (reason: string) => void;
  onConfirm: () => void;
}

export default function BulkActionModal({
  isOpen,
  onClose,
  bulkAction,
  selectedItemsCount,
  bulkReason,
  setBulkReason,
  onConfirm,
}: BulkActionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
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
        <ModalHeader>
          {bulkAction === "approve" ? "일괄 승인" : "일괄 거부"}
        </ModalHeader>
        <ModalBody>
          <p className="mb-4">
            선택한 {selectedItemsCount}건을{" "}
            {bulkAction === "approve" ? "승인" : "거부"}하시겠습니까?
          </p>
          {bulkAction === "reject" && (
            <Input
              label="거부 사유"
              placeholder="거부 사유를 입력해주세요"
              value={bulkReason}
              onValueChange={setBulkReason}
              isRequired
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={onClose}>
            취소
          </Button>
          <Button
            color={bulkAction === "approve" ? "success" : "danger"}
            onPress={onConfirm}
            disabled={bulkAction === "reject" && !bulkReason.trim()}
          >
            {bulkAction === "approve" ? "승인" : "거부"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
