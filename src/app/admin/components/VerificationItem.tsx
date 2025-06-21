import React, { useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Progress,
  Badge,
} from "@heroui/react";
import {
  FileText,
  CheckCircle,
  MoreHorizontal,
  Download,
  Clock,
  User,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import {
  useVerificationTimeline,
  useBusinessOwnerProfile,
  useBusinessDocuments,
  useDownloadDocument,
} from "@/src/lib/admin/admin.query";
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
  const [activeTab, setActiveTab] = useState<
    "profile" | "timeline" | "documents"
  >("profile");

  // businessOwnerId 가드 체크
  const businessOwnerId = verification.businessOwnerId || verification.id;
  if (!businessOwnerId) {
    console.error("Missing businessOwnerId in verification:", verification);
    return null;
  }

  // 새로운 데이터 훅들
  const { data: timeline } = useVerificationTimeline(businessOwnerId, {
    enabled: isOpen,
  });

  const { data: profile } = useBusinessOwnerProfile(businessOwnerId, {
    enabled: isOpen,
  });

  const { data: documents } = useBusinessDocuments(
    businessOwnerId,
    undefined,
    undefined,
    {
      enabled: isOpen,
    }
  );

  const downloadDocumentMutation = useDownloadDocument({
    onSuccess: (
      blob: Blob,
      variables: { businessOwnerId: number; documentId: number }
    ) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${variables.documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: any) => {
      console.error("문서 다운로드 실패:", error);
      alert("문서 다운로드에 실패했습니다.");
    },
  });

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

  const handleDownloadDocument = (documentId: number) => {
    downloadDocumentMutation.mutate({
      businessOwnerId: verification.businessOwnerId,
      documentId,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
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
                <p className="text-xs text-gray-500">
                  예상: {verification.estimatedProcessingTime}분
                </p>
              </div>

              <div className="flex gap-2">
                <Tooltip content="상세보기">
                  <Button
                    size="sm"
                    variant="bordered"
                    isIconOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                    startContent={<FileText className="w-4 h-4" />}
                  />
                </Tooltip>
                <Tooltip content="승인">
                  <Button
                    size="sm"
                    color="success"
                    isIconOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(businessOwnerId);
                    }}
                    startContent={<CheckCircle className="w-4 h-4" />}
                  />
                </Tooltip>
                {onReject && (
                  <Tooltip content="거부">
                    <Button
                      size="sm"
                      color="danger"
                      variant="bordered"
                      isIconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt("거부 사유를 입력해주세요:");
                        if (reason) {
                          onReject(businessOwnerId, reason);
                        }
                      }}
                      startContent={<AlertTriangle className="w-4 h-4" />}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 상세 정보 모달 */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3>{verification.businessName} 검증 상세 정보</h3>
            <p className="text-sm text-gray-600">
              {verification.businessRegistrationNumber ||
                verification.businessNumber}
            </p>
          </ModalHeader>
          <ModalBody>
            {/* 탭 네비게이션 */}
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={activeTab === "profile" ? "solid" : "bordered"}
                onClick={() => setActiveTab("profile")}
                startContent={<User className="w-4 h-4" />}
              >
                프로필
              </Button>
              <Button
                size="sm"
                variant={activeTab === "timeline" ? "solid" : "bordered"}
                onClick={() => setActiveTab("timeline")}
                startContent={<Clock className="w-4 h-4" />}
              >
                진행상황
              </Button>
              <Button
                size="sm"
                variant={activeTab === "documents" ? "solid" : "bordered"}
                onClick={() => setActiveTab("documents")}
                startContent={<FileText className="w-4 h-4" />}
              >
                문서
              </Button>
            </div>

            <Divider />

            {/* 프로필 탭 */}
            {activeTab === "profile" && profile?.data && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">사용자 정보</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">사용자명:</span>{" "}
                        {profile.data.user.username}
                      </p>
                      <p>
                        <span className="text-gray-600">사용자 타입:</span>{" "}
                        {profile.data.user.userType}
                      </p>
                      <p>
                        <span className="text-gray-600">가입일:</span>{" "}
                        {formatDate(profile.data.user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {profile.data.businessOwner && (
                    <div>
                      <h4 className="font-semibold mb-2">사업자 정보</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">사업자명:</span>{" "}
                          {profile.data.businessOwner.businessName}
                        </p>
                        <p>
                          <span className="text-gray-600">대표자명:</span>{" "}
                          {profile.data.businessOwner.ownerName}
                        </p>
                        <p>
                          <span className="text-gray-600">등록번호:</span>{" "}
                          {profile.data.businessOwner.businessNumber}
                        </p>
                        {profile.data.businessOwner.phoneNumber && (
                          <p>
                            <span className="text-gray-600">전화번호:</span>{" "}
                            {profile.data.businessOwner.phoneNumber}
                          </p>
                        )}
                        {profile.data.businessOwner.email && (
                          <p>
                            <span className="text-gray-600">이메일:</span>{" "}
                            {profile.data.businessOwner.email}
                          </p>
                        )}
                        <p>
                          <span className="text-gray-600">신청일:</span>{" "}
                          {formatDate(profile.data.businessOwner.registeredAt)}
                        </p>
                        {profile.data.businessOwner.verifiedAt && (
                          <p>
                            <span className="text-gray-600">승인일:</span>{" "}
                            {formatDate(profile.data.businessOwner.verifiedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Badge
                    color={profile.data.isRegistered ? "success" : "default"}
                  >
                    {profile.data.isRegistered ? "등록됨" : "미등록"}
                  </Badge>
                  <Badge
                    color={profile.data.isVerified ? "success" : "warning"}
                  >
                    {profile.data.isVerified ? "인증완료" : "인증대기"}
                  </Badge>
                </div>
              </div>
            )}

            {/* 타임라인 탭 */}
            {activeTab === "timeline" && timeline?.data && (
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">검증 진행 상황</h4>
                  <Chip
                    color={getStatusColor(timeline.data.currentStatus)}
                    size="sm"
                  >
                    {timeline.data.currentStatus}
                  </Chip>
                </div>

                <div className="space-y-3">
                  {timeline.data.timeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                            {item.adminName && (
                              <p className="text-xs text-gray-500">
                                담당자: {item.adminName}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 문서 탭 */}
            {activeTab === "documents" && documents?.data && (
              <div className="space-y-4 mt-4">
                <h4 className="font-semibold">제출된 문서</h4>

                {documents.data.documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.data.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{doc.filename}</p>
                            <Chip
                              color={
                                doc.status === "VERIFIED"
                                  ? "success"
                                  : doc.status === "REJECTED"
                                  ? "danger"
                                  : "warning"
                              }
                              size="sm"
                            >
                              {doc.status}
                            </Chip>
                          </div>
                          <p className="text-sm text-gray-600">
                            {doc.documentType}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-gray-500">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            업로드: {formatDate(doc.uploadedAt)} · 크기:{" "}
                            {(doc.fileSize / 1024 / 1024).toFixed(2)}MB
                          </p>
                          {doc.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              거부 사유: {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="bordered"
                          onClick={() => handleDownloadDocument(doc.id)}
                          startContent={<Download className="w-4 h-4" />}
                          isLoading={downloadDocumentMutation.isPending}
                        >
                          다운로드
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    제출된 문서가 없습니다.
                  </p>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              닫기
            </Button>
            <Button
              color="success"
              onPress={() => {
                onApprove(verification.id);
                onClose();
              }}
            >
              승인
            </Button>
            {onReject && (
              <Button
                color="danger"
                variant="bordered"
                onPress={() => {
                  const reason = prompt("거부 사유를 입력해주세요:");
                  if (reason) {
                    onReject(verification.id, reason);
                    onClose();
                  }
                }}
              >
                거부
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
