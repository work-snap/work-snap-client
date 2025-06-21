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
} from "./types";

// ==================== 대시보드 관련 훅 ====================

export function useAdminDashboard(params?: PaginationRequest, options = {}) {
  return useQuery({
    queryKey: ["adminDashboard", params],
    queryFn: () =>
      adminApis.dashboard.getDashboard(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    ...options,
  });
}

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

export function useFeedbackAnalytics(
  includeTrends: boolean = false,
  options = {}
) {
  return useQuery({
    queryKey: ["feedbackAnalytics", includeTrends],
    queryFn: () =>
      adminApis.dashboard
        .getFeedbackAnalytics(includeTrends)
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
    ...options,
  });
}

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

// ==================== 사업자 검증 관련 훅 ====================

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

// ==================== 통합 대시보드 훅 ====================

// 대시보드에 필요한 모든 데이터를 한번에 가져오는 커스텀 훅
export function useAdminDashboardData(params?: PaginationRequest) {
  const dashboard = useAdminDashboard(params);
  const metrics = useAdvancedMetrics();
  const feedback = useFeedbackAnalytics();

  return {
    dashboard,
    metrics,
    feedback,
    isLoading: dashboard.isLoading || metrics.isLoading || feedback.isLoading,
    isError: dashboard.isError || metrics.isError || feedback.isError,
    error: dashboard.error || metrics.error || feedback.error,
    refetchAll: () => {
      dashboard.refetch();
      metrics.refetch();
      feedback.refetch();
    },
  };
}

// 실시간 모니터링을 위한 커스텀 훅
export function useRealTimeMonitoring() {
  const riskMonitoring = useRiskMonitoring();
  const dashboard = useAdminDashboard(undefined, {
    refetchInterval: 30 * 1000,
  });

  return {
    riskMonitoring,
    dashboard,
    isLoading: riskMonitoring.isLoading || dashboard.isLoading,
    isError: riskMonitoring.isError || dashboard.isError,
    alertLevel: riskMonitoring.data?.alertLevel || "NORMAL",
  };
}
