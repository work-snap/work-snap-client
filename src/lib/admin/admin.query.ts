import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApis } from "./admin";
import {
  PaginationRequest,
  DashboardData,
  AdvancedMetrics,
  FeedbackAnalytics,
  RiskMonitoring,
  AutomationPerformance,
  PatternAnalysis,
  PredictiveAnalysis,
  BusinessNumberTestRequest,
  BusinessNumberTestResponse,
  VerificationDetail,
  BusinessVerificationRequest,
  BulkVerificationRequest,
  CreateFeedbackRequest,
  FeedbackResponse,
  FeedbackImpactAnalysis,
  ModelPerformanceResponse,
  ModelTrainingResponse,
  ABTestRequest,
  ABTestResponse,
  ReportRequest,
  BusinessOwnerProfile,
  BusinessVerificationParams,
  BusinessVerificationResponse,
  BusinessVerificationStatsResponse,
} from "./types";

// ==================== 대시보드 관련 훅 ====================

// 서버에 해당 엔드포인트가 없어 주석 처리
// export function useAdminDashboard(params?: PaginationRequest, options = {}) {
//   return useQuery({
//     queryKey: ["adminDashboard", params],
//     queryFn: () =>
//       adminApis.dashboard.getDashboard(params).then((res) => res.data),
//     staleTime: 5 * 60 * 1000, // 5분
//     refetchInterval: 60 * 1000, // 1분마다 자동 갱신
//     ...options,
//   });
// }

export function useAdvancedMetrics(options = {}) {
  return useQuery({
    queryKey: ["advancedMetrics"],
    queryFn: () =>
      adminApis.dashboard.getAdvancedMetrics().then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 2 * 60 * 1000, // 2분마다 자동 갱신
    ...options,
  });
}

// 서버에 해당 엔드포인트가 없어 주석 처리
// export function useFeedbackAnalytics(
//   includeTrends: boolean = false,
//   options = {}
// ) {
//   return useQuery({
//     queryKey: ["feedbackAnalytics", includeTrends],
//     queryFn: () =>
//       adminApis.dashboard
//         .getFeedbackAnalytics(includeTrends)
//         .then((res) => res.data),
//     staleTime: 5 * 60 * 1000, // 5분
//     refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
//     ...options,
//   });
// }

export function useRiskMonitoring(options = {}) {
  return useQuery({
    queryKey: ["riskMonitoring"],
    queryFn: () =>
      adminApis.dashboard.getRiskMonitoring().then((res) => res.data),
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신 (실시간 모니터링)
    ...options,
  });
}

export function useAutomationPerformance(options = {}) {
  return useQuery({
    queryKey: ["automationPerformance"],
    queryFn: () =>
      adminApis.dashboard.getAutomationPerformance().then((res) => res.data),
    staleTime: 10 * 60 * 1000, // 10분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
    ...options,
  });
}

export function usePatternAnalysis(options = {}) {
  return useQuery({
    queryKey: ["patternAnalysis"],
    queryFn: () =>
      adminApis.dashboard.getPatternAnalysis().then((res) => res.data),
    staleTime: 10 * 60 * 1000, // 10분
    refetchInterval: 10 * 60 * 1000, // 10분마다 자동 갱신
    ...options,
  });
}

export function usePredictiveAnalysis(options = {}) {
  return useQuery({
    queryKey: ["predictiveAnalysis"],
    queryFn: () =>
      adminApis.dashboard.getPredictiveAnalysis().then((res) => res.data),
    staleTime: 30 * 60 * 1000, // 30분
    refetchInterval: 30 * 60 * 1000, // 30분마다 자동 갱신
    ...options,
  });
}

// 개별 사업자 위험 평가 (계획서 API)
export function useRiskAssessment(businessOwnerId: number, options = {}) {
  return useMutation({
    mutationFn: () =>
      adminApis.dashboard.getRiskAssessment(businessOwnerId).then((res) => res.data),
    ...options,
  });
}

// ==================== 사업자 검증 관련 훅 ====================

// 사업자 검증 목록 조회 (계획서 API)
export function useBusinessVerifications(
  params?: BusinessVerificationParams,
  options = {}
) {
  return useQuery({
    queryKey: ["businessVerifications", params],
    queryFn: () =>
      adminApis.verification
        .getBusinessVerifications(params)
        .then((res) => res.data),
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
    ...options,
  });
}

// 사업자 검증 통계 조회 (계획서 API)
export function useBusinessVerificationStats(options = {}) {
  return useQuery({
    queryKey: ["businessVerificationStats"],
    queryFn: () =>
      adminApis.verification
        .getBusinessVerificationStats()
        .then((res) => res.data),
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
    ...options,
  });
}

// 개별 사업자 검증 정보 조회 (계획서 API)
export function useBusinessVerificationById(id: number, options = {}) {
  return useQuery({
    queryKey: ["businessVerification", id],
    queryFn: () =>
      adminApis.verification
        .getBusinessVerificationById(id)
        .then((res) => res.data),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2분
    ...options,
  });
}

// 사업자 검증 승인/거부 처리 (계획서 API)
export function useProcessBusinessVerificationAction(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
      adminNote,
    }: {
      id: number;
      action: "approve" | "reject";
      reason?: string;
      adminNote?: string;
    }) =>
      adminApis.verification
        .processBusinessVerificationAction(id, action, { reason, adminNote })
        .then((res) => res.data),
    onSuccess: () => {
      // 검증 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["businessVerifications"] });
      // 검증 통계 갱신
      queryClient.invalidateQueries({ queryKey: ["businessVerificationStats"] });
      // 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    ...options,
  });
}

// 일괄 사업자 검증 처리 (계획서 API)
export function useBulkProcessBusinessVerifications(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { ids: number[]; action: "approve" | "reject"; reason: string }) =>
      adminApis.verification
        .bulkProcessBusinessVerifications(request)
        .then((res) => res.data),
    onSuccess: () => {
      // 검증 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["businessVerifications"] });
      // 검증 통계 갱신
      queryClient.invalidateQueries({ queryKey: ["businessVerificationStats"] });
      // 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    ...options,
  });
}

export function useBusinessNumberTest(options = {}) {
  return useMutation({
    mutationFn: (request: BusinessNumberTestRequest) =>
      adminApis.verification
        .testBusinessNumber(request)
        .then((res) => res.data),
    ...options,
  });
}

export function useVerificationDetail(businessOwnerId: number, options = {}) {
  return useQuery({
    queryKey: ["verificationDetail", businessOwnerId],
    queryFn: () =>
      adminApis.verification
        .getVerificationDetail(businessOwnerId)
        .then((res) => res.data),
    enabled: !!businessOwnerId,
    staleTime: 2 * 60 * 1000, // 2분
    ...options,
  });
}

export function useBusinessOwnerProfile(businessOwnerId: number, options = {}) {
  return useQuery({
    queryKey: ["businessOwnerProfile", businessOwnerId],
    queryFn: () =>
      adminApis.verification
        .getBusinessOwnerProfile(businessOwnerId)
        .then((res) => res.data),
    enabled: !!businessOwnerId,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

export function useRerunVerification(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessOwnerId: number) =>
      adminApis.verification
        .rerunVerification(businessOwnerId)
        .then((res) => res.data),
    onSuccess: (data) => {
      // 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      // 해당 사업자의 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ["verificationDetail", data.data.businessOwnerId],
      });
    },
    ...options,
  });
}

export function useProcessVerification(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessOwnerId,
      action,
      request,
    }: {
      businessOwnerId: number;
      action: "approve" | "reject";
      request?: BusinessVerificationRequest;
    }) =>
      adminApis.verification
        .processVerification(businessOwnerId, action, request)
        .then((res) => res.data),
    onSuccess: () => {
      // 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      // 메트릭 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["advancedMetrics"] });
    },
    ...options,
  });
}

export function useBulkProcessVerifications(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      request,
    }: {
      action: "approve" | "reject";
      request: BulkVerificationRequest;
    }) =>
      adminApis.verification
        .bulkProcessVerifications(action, request)
        .then((res) => res.data),
    onSuccess: () => {
      // 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      // 메트릭 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["advancedMetrics"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
    },
    ...options,
  });
}

export function useVerificationTimeline(businessOwnerId: number, options = {}) {
  return useQuery({
    queryKey: ["verificationTimeline", businessOwnerId],
    queryFn: () =>
      adminApis.verification
        .getVerificationTimeline(businessOwnerId)
        .then((res) => res.data),
    enabled: !!businessOwnerId,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

export function useBusinessDocuments(
  businessOwnerId: number,
  page?: number,
  limit?: number,
  options = {}
) {
  return useQuery({
    queryKey: ["businessDocuments", businessOwnerId, page, limit],
    queryFn: () =>
      adminApis.verification
        .getBusinessDocuments(businessOwnerId, page, limit)
        .then((res) => res.data),
    enabled: !!businessOwnerId,
    staleTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

export function useDownloadDocument(options = {}) {
  return useMutation({
    mutationFn: ({
      businessOwnerId,
      documentId,
    }: {
      businessOwnerId: number;
      documentId: number;
    }) => adminApis.verification.downloadDocument(businessOwnerId, documentId),
    ...options,
  });
}

// ==================== 피드백 관련 훅 ====================

export function useCreateFeedback(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessOwnerId,
      adminId,
      request,
    }: {
      businessOwnerId: number;
      adminId: string;
      request: CreateFeedbackRequest;
    }) =>
      adminApis.feedback
        .createFeedback(businessOwnerId, adminId, request)
        .then((res) => res.data),
    onSuccess: () => {
      // 피드백 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
    },
    ...options,
  });
}

export function useFeedbacks(
  params?: {
    businessOwnerId?: number;
    adminId?: string;
    pending?: boolean;
  },
  options = {}
) {
  return useQuery({
    queryKey: ["feedbacks", params],
    queryFn: () =>
      adminApis.feedback.getFeedbacks(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

export function useProcessFeedback(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: number) =>
      adminApis.feedback.processFeedback(feedbackId).then((res) => res.data),
    onSuccess: () => {
      // 피드백 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
    },
    ...options,
  });
}

export function useProcessBulkFeedbacks(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackIds: number[]) =>
      adminApis.feedback
        .processBulkFeedbacks(feedbackIds)
        .then((res) => res.data),
    onSuccess: () => {
      // 피드백 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
    },
    ...options,
  });
}

export function useFeedbackImpactAnalysis(feedbackId: number, options = {}) {
  return useQuery({
    queryKey: ["feedbackImpact", feedbackId],
    queryFn: () =>
      adminApis.feedback
        .analyzeFeedbackImpact(feedbackId)
        .then((res) => res.data),
    enabled: !!feedbackId,
    staleTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

// ==================== 모델 학습 관련 훅 ====================

export function useModelPerformance(options = {}) {
  return useQuery({
    queryKey: ["modelPerformance"],
    queryFn: () =>
      adminApis.model.evaluatePerformance().then((res) => res.data),
    staleTime: 30 * 60 * 1000, // 30분
    refetchInterval: 60 * 60 * 1000, // 1시간마다 자동 갱신
    ...options,
  });
}

export function useRetrainModel(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminApis.model.retrainModel().then((res) => res.data),
    onSuccess: () => {
      // 모델 성능 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["modelPerformance"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
      // 자동화 성능 갱신
      queryClient.invalidateQueries({ queryKey: ["automationPerformance"] });
    },
    ...options,
  });
}

export function useIncrementalLearning(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminApis.model.incrementalLearning().then((res) => res.data),
    onSuccess: () => {
      // 모델 성능 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["modelPerformance"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
    },
    ...options,
  });
}

export function useHyperparameterTuning(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminApis.model.hyperparameterTuning().then((res) => res.data),
    onSuccess: () => {
      // 모델 성능 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["modelPerformance"] });
    },
    ...options,
  });
}

export function useRunABTest(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ABTestRequest) =>
      adminApis.model.runABTest(request).then((res) => res.data),
    onSuccess: () => {
      // 모델 성능 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["modelPerformance"] });
    },
    ...options,
  });
}

// ML 증분 학습 (계획서 API)
export function useTrainIncrementalModel(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminApis.model.trainIncrementalModel().then((res) => res.data),
    onSuccess: () => {
      // 모델 성능 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["modelPerformance"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
    },
    ...options,
  });
}

// ML 모델 상태 조회 (계획서 API)
export function useMLStatus(options = {}) {
  return useQuery({
    queryKey: ["mlStatus"],
    queryFn: () => adminApis.model.getMLStatus().then((res) => res.data),
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
    ...options,
  });
}

// 모델 초기화 (계획서 API)
export function useInitializeModel(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminApis.model.initializeModel().then((res) => res.data),
    onSuccess: () => {
      // 모델 성능 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["modelPerformance"] });
      // 피드백 분석 갱신
      queryClient.invalidateQueries({ queryKey: ["feedbackAnalytics"] });
      // ML 상태 갱신
      queryClient.invalidateQueries({ queryKey: ["mlStatus"] });
    },
    ...options,
  });
}

// ==================== 리포트 관련 훅 ====================

export function useDownloadDailyReport(options = {}) {
  return useMutation({
    mutationFn: (request?: ReportRequest) =>
      adminApis.reports.downloadDailyReport(request).then((res) => res.data),
    ...options,
  });
}

export function useDownloadWeeklyReport(options = {}) {
  return useMutation({
    mutationFn: (request?: ReportRequest) =>
      adminApis.reports.downloadWeeklyReport(request).then((res) => res.data),
    ...options,
  });
}

export function useDownloadMonthlyReport(options = {}) {
  return useMutation({
    mutationFn: (request?: ReportRequest) =>
      adminApis.reports.downloadMonthlyReport(request).then((res) => res.data),
    ...options,
  });
}

// ==================== 사용자 관리 관련 훅 ====================

// 사용자 목록 조회
export function useUsers(params?: {
  page?: number;
  size?: number;
  role?: string;
  search?: string;
}, options = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () =>
      adminApis.users.getUsers(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

// 사용자 상세 정보 조회
export function useUserDetail(userId: number, options = {}) {
  return useQuery({
    queryKey: ["userDetail", userId],
    queryFn: () =>
      adminApis.users.getUserDetail(userId).then((res) => res.data),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

// 사용자 역할 변경
export function useUpdateUserRole(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      userId: number;
      role: 'ADMIN' | 'BUSINESS_OWNER' | 'PART_TIME_WORKER';
      reason?: string;
    }) =>
      adminApis.users.updateUserRole(request).then((res) => res.data),
    onSuccess: () => {
      // 사용자 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    ...options,
  });
}

// ==================== 통합 대시보드 훅 ====================

// 대시보드에 필요한 모든 데이터를 한번에 가져오는 커스텀 훅 - 존재하지 않는 API 제거
export function useAdminDashboardData(params?: PaginationRequest) {
  // const dashboard = useAdminDashboard(params); // 서버에 엔드포인트 없음
  const metrics = useAdvancedMetrics();
  // const feedback = useFeedbackAnalytics(); // 서버에 엔드포인트 없음

  return {
    // dashboard,
    metrics,
    // feedback,
    isLoading: metrics.isLoading,
    isError: metrics.isError,
    error: metrics.error,
    refetchAll: () => {
      // dashboard.refetch();
      metrics.refetch();
      // feedback.refetch();
    },
  };
}

// 실시간 모니터링을 위한 커스텀 훅 - 존재하지 않는 API 제거
export function useRealTimeMonitoring() {
  const riskMonitoring = useRiskMonitoring();
  // const dashboard = useAdminDashboard(undefined, {
  //   refetchInterval: 30 * 1000,
  // }); // 서버에 엔드포인트 없음

  return {
    riskMonitoring,
    // dashboard,
    isLoading: riskMonitoring.isLoading,
    isError: riskMonitoring.isError,
    alertLevel: riskMonitoring.data?.alertLevel || "NORMAL",
  };
}
