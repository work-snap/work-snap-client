"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Tab,
  Tabs,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@heroui/react";

import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  RefreshCw,
  Filter,
  Download,
  Activity,
  Brain,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  useAdminDashboardData,
  useProcessVerification,
  useBulkProcessVerifications,
  useRetrainModel,
  useIncrementalLearning,
  useDownloadDailyReport,
  useDownloadWeeklyReport,
  useDownloadMonthlyReport,
} from "@/src/lib/admin/admin.query";
import type {
  VerificationStats,
  PendingVerification,
  AdvancedMetrics,
  FeedbackAnalytics,
  BusinessVerificationRequest,
  BulkVerificationRequest,
} from "@/src/lib/admin/types";
import {
  StatCard,
  SystemPerformanceCard,
  RiskStatusCard,
  VerificationItem,
  AutomationEffectivenessCard,
  PatternAnalysisCard,
  FeedbackStatsCard,
  LearningEffectivenessCard,
  ModelManagementCard,
  BulkActionModal,
} from "./components";

// 모든 타입은 types.ts에서 import

export default function AdminDashboard() {
  // State 관리
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [bulkReason, setBulkReason] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // TanStack Query 훅들 사용
  const {
    dashboard,
    metrics,
    feedback,
    isLoading,
    isError,
    error,
    refetchAll,
  } = useAdminDashboardData();

  // Mutation 훅들
  const processVerificationMutation = useProcessVerification({
    onSuccess: () => {
      alert("검증이 처리되었습니다 ✅");
    },
    onError: (error: any) => {
      console.error("검증 처리 실패:", error);
      alert("검증 처리에 실패했습니다.");
    },
  });

  const bulkProcessMutation = useBulkProcessVerifications({
    onSuccess: () => {
      setSelectedItems([]);
      setBulkAction(null);
      setBulkReason("");
      onClose();
      alert(
        `${selectedItems.length}건이 ${
          bulkAction === "approve" ? "승인" : "거부"
        }되었습니다 ✅`
      );
    },
    onError: (error: any) => {
      console.error("대량 처리 실패:", error);
      alert("대량 처리에 실패했습니다.");
    },
  });

  const retrainModelMutation = useRetrainModel({
    onSuccess: (data: any) => {
      if (data.status === "started") {
        alert("모델 재학습이 시작되었습니다 🧠");
      }
    },
    onError: (error: any) => {
      console.error("모델 재학습 실행 실패:", error);
      alert("모델 재학습 실행에 실패했습니다.");
    },
  });

  const incrementalLearningMutation = useIncrementalLearning({
    onSuccess: (data: any) => {
      if (data.status === "started") {
        alert("증분 학습이 시작되었습니다 📈");
      }
    },
    onError: (error: any) => {
      console.error("증분 학습 실행 실패:", error);
      alert("증분 학습 실행에 실패했습니다.");
    },
  });

  const downloadDailyReportMutation = useDownloadDailyReport();
  const downloadWeeklyReportMutation = useDownloadWeeklyReport();
  const downloadMonthlyReportMutation = useDownloadMonthlyReport();

  // 데이터 추출
  const stats = dashboard.data?.data?.statistics || {
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    verified: 0,
  };

  const pendingVerifications =
    dashboard.data?.data?.pendingVerifications?.items || [];

  // 디버깅을 위한 로깅 추가
  console.log("pendingVerifications:", pendingVerifications);
  console.log("First verification item:", pendingVerifications[0]);
  const advancedMetrics = metrics.data;
  const feedbackAnalytics = feedback.data;

  // 액션 핸들러들
  const handleRefresh = () => {
    refetchAll();
  };

  const handleBulkAction = () => {
    if (selectedItems.length === 0 || !bulkAction) return;

    if (bulkAction === "reject" && !bulkReason.trim()) {
      alert("거부 사유를 입력해주세요.");
      return;
    }

    const requestData = {
      businessOwnerIds: selectedItems,
      decision: bulkAction === "approve" ? "APPROVE" : "REJECT",
      reason: bulkAction === "approve" ? "관리자 일괄 승인" : bulkReason,
    };

    bulkProcessMutation.mutate({
      action: bulkAction,
      request: requestData,
    });
  };

  const handleSingleAction = (
    id: number,
    action: "approve" | "reject",
    reason?: string
  ) => {
    // 디버깅을 위한 로깅 추가
    console.log("handleSingleAction called with:", { id, action, reason });
    console.log("id type:", typeof id, "id value:", id);

    if (id === undefined || id === null || typeof id !== "number") {
      console.error("Invalid businessOwnerId:", id);
      alert("사업자 ID가 올바르지 않습니다.");
      return;
    }

    const requestData = {
      businessOwnerId: id,
      decision: action === "approve" ? "APPROVE" : "REJECT",
      reason: reason || "관리자 처리",
      adminNote: action === "approve" ? "관리자 승인" : undefined,
    };

    processVerificationMutation.mutate({
      businessOwnerId: id,
      action,
      request: requestData,
    });
  };

  const handleSingleReject = (id: number, reason: string) => {
    handleSingleAction(id, "reject", reason);
  };

  const triggerModelRetraining = () => {
    retrainModelMutation.mutate();
  };

  const triggerIncrementalLearning = () => {
    incrementalLearningMutation.mutate();
  };

  const downloadReport = (type: "daily" | "weekly" | "monthly") => {
    const downloadFile = (blob: Blob, filename: string) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    const onSuccess = (blob: Blob) => {
      downloadFile(blob, `${type}-report.pdf`);
      alert(`${type} 리포트 다운로드가 완료되었습니다 📄`);
    };

    const onError = (error: any) => {
      console.error("리포트 다운로드 실패:", error);
      alert("리포트 다운로드에 실패했습니다.");
    };

    switch (type) {
      case "daily":
        downloadDailyReportMutation.mutate(undefined, { onSuccess, onError });
        break;
      case "weekly":
        downloadWeeklyReportMutation.mutate(undefined, { onSuccess, onError });
        break;
      case "monthly":
        downloadMonthlyReportMutation.mutate(undefined, { onSuccess, onError });
        break;
    }
  };

  // TanStack Query가 자동으로 데이터를 관리하므로 수동 useEffect는 불필요

  // 승인률 계산
  const getApprovalRate = (stats: VerificationStats) => {
    if (!stats || stats.total === 0) return 0;
    return ((stats.approved / stats.total) * 100).toFixed(1);
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">관리자 대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
              <p className="text-gray-600 mt-1">WorkSnap 시스템 종합 관리</p>
              <p className="text-xs text-gray-500 mt-1">실시간 업데이트 중</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="bordered"
                startContent={
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                }
              >
                새로고침
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    startContent={<Download className="w-4 h-4" />}
                  >
                    리포트
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="daily"
                    onClick={() => downloadReport("daily")}
                  >
                    일일 리포트
                  </DropdownItem>
                  <DropdownItem
                    key="weekly"
                    onClick={() => downloadReport("weekly")}
                  >
                    주간 리포트
                  </DropdownItem>
                  <DropdownItem
                    key="monthly"
                    onClick={() => downloadReport("monthly")}
                  >
                    월간 리포트
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button
                onClick={triggerModelRetraining}
                color="primary"
                startContent={<Brain className="w-4 h-4" />}
              >
                모델 재학습
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 에러 표시 */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">데이터를 불러오는데 실패했습니다.</p>
            </div>
          </div>
        )}

        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            key="total-applications"
            title="총 신청"
            value={stats?.total || 0}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <StatCard
            key="pending-applications"
            title="대기 중"
            value={(stats?.pending || 0) + (stats?.reviewing || 0)}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            valueColor="text-orange-600"
          />
          <StatCard
            key="approval-rate"
            title="승인률"
            value={`${stats ? getApprovalRate(stats) : 0}%`}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            valueColor="text-green-600"
          />
          <StatCard
            key="automation-rate"
            title="자동화율"
            value={`${
              advancedMetrics?.automationEffectiveness?.automationRate.toFixed(
                1
              ) || 0
            }%`}
            icon={Settings}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            valueColor="text-purple-600"
          />
          <StatCard
            key="anomaly-patterns"
            title="이상 패턴"
            value={advancedMetrics?.patternSummary?.detectedAnomalies || 0}
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBgColor="bg-red-50"
            valueColor="text-red-600"
          />
        </div>

        {/* 탭 네비게이션 */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
          color="primary"
        >
          <Tab
            key="overview"
            title={
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                개요
              </span>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <SystemPerformanceCard advancedMetrics={advancedMetrics} />
              <RiskStatusCard advancedMetrics={advancedMetrics} />
            </div>
          </Tab>

          <Tab
            key="verification"
            title={
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                검증 관리
              </span>
            }
          >
            <Card className="mt-6 border-0 shadow-sm">
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">검증 대기 목록</h3>
                <div className="flex gap-2">
                  {selectedItems.length > 0 && (
                    <>
                      <Button
                        onClick={() => {
                          setBulkAction("approve");
                          onOpen();
                        }}
                        color="success"
                        size="sm"
                        startContent={<CheckCircle className="w-4 h-4" />}
                      >
                        선택 승인 ({selectedItems.length})
                      </Button>
                      <Button
                        onClick={() => {
                          setBulkAction("reject");
                          onOpen();
                        }}
                        color="danger"
                        size="sm"
                        variant="bordered"
                        startContent={<AlertTriangle className="w-4 h-4" />}
                      >
                        선택 거부 ({selectedItems.length})
                      </Button>
                    </>
                  )}
                  <Button
                    variant="bordered"
                    size="sm"
                    startContent={<Filter className="w-4 h-4" />}
                  >
                    필터
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {pendingVerifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    검증 대기 중인 항목이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingVerifications
                      .filter((verification) => {
                        // 유효하지 않은 데이터 필터링 - businessOwnerId 사용
                        if (
                          !verification ||
                          !verification.businessOwnerId ||
                          typeof verification.businessOwnerId !== "number"
                        ) {
                          console.warn(
                            "Invalid verification item filtered out:",
                            verification
                          );
                          return false;
                        }
                        return true;
                      })
                      .map((verification) => (
                        <VerificationItem
                          key={verification.businessOwnerId}
                          verification={verification}
                          isSelected={selectedItems.includes(
                            verification.businessOwnerId
                          )}
                          onSelect={(id) => {
                            if (typeof id !== "number") {
                              console.error(
                                "Invalid id passed to onSelect:",
                                id
                              );
                              return;
                            }
                            if (selectedItems.includes(id)) {
                              setSelectedItems(
                                selectedItems.filter((item) => item !== id)
                              );
                            } else {
                              setSelectedItems([...selectedItems, id]);
                            }
                          }}
                          onApprove={(id) => {
                            if (typeof id !== "number") {
                              console.error(
                                "Invalid id passed to onApprove:",
                                id
                              );
                              return;
                            }
                            handleSingleAction(id, "approve");
                          }}
                          onReject={(id, reason) => {
                            if (typeof id !== "number") {
                              console.error(
                                "Invalid id passed to onReject:",
                                id
                              );
                              return;
                            }
                            handleSingleReject(id, reason);
                          }}
                        />
                      ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="analytics"
            title={
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                고급 분석
              </span>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <AutomationEffectivenessCard advancedMetrics={advancedMetrics} />
              <PatternAnalysisCard advancedMetrics={advancedMetrics} />
            </div>
          </Tab>

          <Tab
            key="feedback"
            title={
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 피드백
              </span>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <FeedbackStatsCard feedbackAnalytics={feedbackAnalytics} />
              <LearningEffectivenessCard
                feedbackAnalytics={feedbackAnalytics}
              />
              <ModelManagementCard
                onTriggerModelRetraining={triggerModelRetraining}
                onTriggerIncrementalLearning={triggerIncrementalLearning}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* 일괄 처리 모달 */}
      <BulkActionModal
        isOpen={isOpen}
        onClose={onClose}
        bulkAction={bulkAction}
        selectedItemsCount={selectedItems.length}
        bulkReason={bulkReason}
        setBulkReason={setBulkReason}
        onConfirm={handleBulkAction}
      />
    </div>
  );
}
