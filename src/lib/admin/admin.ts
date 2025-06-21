import { AxiosResponse } from "axios";
import api from "../api";
import {
  ApiResponse,
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

const BASE_URL = "/api/admin";

// ==================== 대시보드 API ====================

export const adminDashboardApi = {
  // 대시보드 데이터 조회
  getDashboard: (
    params?: PaginationRequest
  ): Promise<AxiosResponse<ApiResponse<DashboardData>>> => {
    return api.get<ApiResponse<DashboardData>>(
      `${BASE_URL}/business-verification/dashboard`,
      { params }
    );
  },

  // 고급 메트릭 조회
  getAdvancedMetrics: (): Promise<AxiosResponse<AdvancedMetrics>> => {
    return api.get<AdvancedMetrics>(`${BASE_URL}/analytics/advanced-metrics`);
  },

  // 피드백 분석 조회
  getFeedbackAnalytics: (
    includeTrends: boolean = false
  ): Promise<AxiosResponse<FeedbackAnalytics>> => {
    return api.get<FeedbackAnalytics>(`${BASE_URL}/feedback/analytics`, {
      params: { includeTrends },
    });
  },

  // 실시간 위험도 모니터링
  getRiskMonitoring: (): Promise<AxiosResponse<RiskMonitoring>> => {
    return api.get<RiskMonitoring>(`${BASE_URL}/analytics/risk-monitoring`);
  },

  // 자동화 성능 분석
  getAutomationPerformance: (): Promise<
    AxiosResponse<AutomationPerformance>
  > => {
    return api.get<AutomationPerformance>(
      `${BASE_URL}/analytics/automation-performance`
    );
  },

  // 패턴 분석 상세
  getPatternAnalysis: (): Promise<AxiosResponse<PatternAnalysis>> => {
    return api.get<PatternAnalysis>(`${BASE_URL}/analytics/pattern-analysis`);
  },

  // 예측 분석
  getPredictiveAnalysis: (): Promise<AxiosResponse<PredictiveAnalysis>> => {
    return api.get<PredictiveAnalysis>(
      `${BASE_URL}/analytics/predictive-analysis`
    );
  },
};

// ==================== 사업자 검증 관리 API ====================

export const businessVerificationApi = {
  // 사업자등록번호 검증 테스트
  testBusinessNumber: (
    request: BusinessNumberTestRequest
  ): Promise<AxiosResponse<ApiResponse<BusinessNumberTestResponse>>> => {
    return api.post<ApiResponse<BusinessNumberTestResponse>>(
      `${BASE_URL}/business-verification/test-number`,
      null,
      { params: request }
    );
  },

  // 사업자 검증 상세 정보 조회
  getVerificationDetail: (
    businessOwnerId: number
  ): Promise<AxiosResponse<ApiResponse<VerificationDetail>>> => {
    return api.get<ApiResponse<VerificationDetail>>(
      `${BASE_URL}/business-verification/${businessOwnerId}/detail`
    );
  },

  // 사업자 프로필 조회
  getBusinessOwnerProfile: (
    businessOwnerId: number
  ): Promise<AxiosResponse<ApiResponse<BusinessOwnerProfile>>> => {
    return api.get<ApiResponse<BusinessOwnerProfile>>(
      `${BASE_URL}/business-verification/${businessOwnerId}/profile`
    );
  },

  // 자동 검증 재실행
  rerunVerification: (
    businessOwnerId: number
  ): Promise<AxiosResponse<ApiResponse<{ businessOwnerId: number }>>> => {
    return api.post<ApiResponse<{ businessOwnerId: number }>>(
      `${BASE_URL}/business-verification/${businessOwnerId}/rerun-verification`
    );
  },

  // 개별 검증 처리 (승인/거부)
  processVerification: (
    businessOwnerId: number,
    action: "approve" | "reject",
    request?: BusinessVerificationRequest
  ): Promise<AxiosResponse<ApiResponse<any>>> => {
    return api.post<ApiResponse<any>>(
      `${BASE_URL}/business-verification/${businessOwnerId}/${action}`,
      request
    );
  },

  // 대량 검증 처리
  bulkProcessVerifications: (
    action: "approve" | "reject",
    request: BulkVerificationRequest
  ): Promise<AxiosResponse<ApiResponse<any>>> => {
    return api.post<ApiResponse<any>>(
      `${BASE_URL}/business-verification/bulk/${action}`,
      request
    );
  },

  // 검증 타임라인 조회
  getVerificationTimeline: (
    businessOwnerId: number
  ): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return api.get<ApiResponse<any[]>>(
      `${BASE_URL}/business-verification/${businessOwnerId}/timeline`
    );
  },

  // 사업자 문서 목록 조회
  getBusinessDocuments: (
    businessOwnerId: number,
    page?: number,
    limit?: number
  ): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return api.get<ApiResponse<any[]>>(
      `${BASE_URL}/business-verification/${businessOwnerId}/documents`,
      { params: { page, limit } }
    );
  },

  // 문서 다운로드
  downloadDocument: (
    businessOwnerId: number,
    documentId: number
  ): Promise<AxiosResponse<Blob>> => {
    return api.get<Blob>(
      `${BASE_URL}/business-verification/${businessOwnerId}/documents/${documentId}/download`,
      { responseType: "blob" }
    );
  },
};

// ==================== 피드백 관리 API ====================

export const feedbackManagementApi = {
  // 피드백 생성
  createFeedback: (
    businessOwnerId: number,
    adminId: string,
    request: CreateFeedbackRequest
  ): Promise<AxiosResponse<FeedbackResponse>> => {
    return api.post<FeedbackResponse>(
      `${BASE_URL}/feedback/${businessOwnerId}`,
      request,
      { params: { adminId } }
    );
  },

  // 피드백 조회
  getFeedbacks: (params?: {
    businessOwnerId?: number;
    adminId?: string;
    pending?: boolean;
  }): Promise<AxiosResponse<FeedbackResponse[]>> => {
    return api.get<FeedbackResponse[]>(`${BASE_URL}/feedback`, { params });
  },

  // 피드백 처리 상태 변경 (단일)
  processFeedback: (
    feedbackId: number
  ): Promise<AxiosResponse<FeedbackResponse>> => {
    return api.post<FeedbackResponse>(`${BASE_URL}/feedback/process`, null, {
      params: { feedbackId },
    });
  },

  // 대량 피드백 처리
  processBulkFeedbacks: (
    feedbackIds: number[]
  ): Promise<AxiosResponse<FeedbackResponse[]>> => {
    return api.put<FeedbackResponse[]>(
      `${BASE_URL}/feedback/process`,
      feedbackIds
    );
  },

  // 피드백 영향도 분석
  analyzeFeedbackImpact: (
    feedbackId: number
  ): Promise<AxiosResponse<FeedbackImpactAnalysis>> => {
    return api.get<FeedbackImpactAnalysis>(
      `${BASE_URL}/feedback/${feedbackId}/impact`
    );
  },
};

// ==================== 모델 학습 관리 API ====================

export const modelLearningApi = {
  // 모델 성능 평가
  evaluatePerformance: (): Promise<AxiosResponse<ModelPerformanceResponse>> => {
    return api.get<ModelPerformanceResponse>(
      `${BASE_URL}/feedback/model/performance`
    );
  },

  // 모델 재학습
  retrainModel: (): Promise<AxiosResponse<ModelTrainingResponse>> => {
    return api.post<ModelTrainingResponse>(
      `${BASE_URL}/feedback/model/retrain`
    );
  },

  // 증분 학습
  incrementalLearning: (): Promise<AxiosResponse<ModelTrainingResponse>> => {
    return api.post<ModelTrainingResponse>(
      `${BASE_URL}/feedback/model/incremental`
    );
  },

  // 하이퍼파라미터 튜닝
  hyperparameterTuning: (): Promise<AxiosResponse<ModelTrainingResponse>> => {
    return api.post<ModelTrainingResponse>(
      `${BASE_URL}/feedback/model/hyperparameter`
    );
  },

  // A/B 테스트
  runABTest: (
    request: ABTestRequest
  ): Promise<AxiosResponse<ABTestResponse>> => {
    return api.post<ABTestResponse>(
      `${BASE_URL}/feedback/model/ab-test`,
      request.newWeights,
      { params: { testDuration: request.testDuration || 7 } }
    );
  },
};

// ==================== 리포트 다운로드 API ====================

export const reportApi = {
  // 일일 리포트 다운로드
  downloadDailyReport: (
    request?: ReportRequest
  ): Promise<AxiosResponse<Blob>> => {
    return api.get<Blob>(`${BASE_URL}/reports/daily`, {
      params: request,
      responseType: "blob",
    });
  },

  // 주간 리포트 다운로드
  downloadWeeklyReport: (
    request?: ReportRequest
  ): Promise<AxiosResponse<Blob>> => {
    return api.get<Blob>(`${BASE_URL}/reports/weekly`, {
      params: request,
      responseType: "blob",
    });
  },

  // 월간 리포트 다운로드
  downloadMonthlyReport: (
    request?: ReportRequest
  ): Promise<AxiosResponse<Blob>> => {
    return api.get<Blob>(`${BASE_URL}/reports/monthly`, {
      params: request,
      responseType: "blob",
    });
  },
};

// ==================== 전체 관리자 API 통합 ====================

export const adminApis = {
  dashboard: adminDashboardApi,
  verification: businessVerificationApi,
  feedback: feedbackManagementApi,
  model: modelLearningApi,
  reports: reportApi,
};
