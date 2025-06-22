import React from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@heroui/react";
import {
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import type { PendingVerification } from "@/src/lib/admin/types";

interface VerificationItemProps {
  verification: PendingVerification;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onApprove: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
}

export default function VerificationItem({
  verification,
  isSelected,
  onSelect,
  onApprove,
  onReject,
}: VerificationItemProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rejectReason, setRejectReason] = React.useState("");

  // businessOwnerId 가드 체크
  const businessOwnerId = verification.businessOwnerId || verification.id;
  if (!businessOwnerId) {
    console.error("Missing businessOwnerId in verification:", verification);
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "success";
      default:
        return "default";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "REVIEWING":
        return "primary";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(businessOwnerId, rejectReason);
      setRejectReason("");
      onClose();
    }
  };

  return (
    <>
      <Card
        className={`border transition-all duration-200 ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
        }`}
      >
        <CardBody className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(businessOwnerId)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">
                    {verification.businessName}
                  </p>
                  <Chip
                    color={getStatusColor(verification.verificationStatus)}
                    size="sm"
                    variant="flat"
                  >
                    {verification.verificationStatus}
                  </Chip>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {verification.businessRegistrationNumber ||
                    verification.businessNumber}{" "}
                  · {verification.ownerName}
                </p>
                {verification.phoneNumber && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {verification.phoneNumber}
                  </p>
                )}
                {verification.email && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {verification.email}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  신청일:{" "}
                  {formatDate(
                    verification.verificationRequestedAt ||
                      verification.submittedAt ||
                      verification.createdAt ||
                      new Date().toISOString()
                  )}
                </p>
                {verification.lastActivityAt && (
                  <p className="text-xs text-gray-500">
                    최근 활동: {formatDate(verification.lastActivityAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <Chip
                  color={getPriorityColor(verification.priority)}
                  size="sm"
                  variant="flat"
                >
                  {verification.priority}
                </Chip>
                <p
                  className={`text-sm font-semibold mt-1 ${getRiskScoreColor(
                    verification.riskScore
                  )}`}
                >
                  위험도: {verification.riskScore}%
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  color="success"
                  size="sm"
                  variant="flat"
                  onClick={() => onApprove(businessOwnerId)}
                >
                  승인
                </Button>
                {onReject && (
                  <Button
                    color="danger"
                    size="sm"
                    variant="flat"
                    onClick={onOpen}
                  >
                    거부
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 거부 사유 입력 모달 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>검증 거부</ModalHeader>
          <ModalBody>
            <p className="mb-4">
              <strong>{verification.businessName}</strong>의 검증을
              거부하시겠습니까?
            </p>
            <Textarea
              label="거부 사유"
              placeholder="거부 사유를 입력해주세요"
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRejectReason(e.target.value)
              }
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>
              취소
            </Button>
            <Button
              color="danger"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              거부
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
