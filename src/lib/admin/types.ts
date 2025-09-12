// ==================== 공통 타입 ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginationRequest {
  page?: number;
  size?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

// ==================== 검증 관련 타입 ====================

export interface VerificationStats {
  total: number;
  notRequested: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  verified: number;
}

export interface PendingVerification {
  id?: number; // 선택적 필드로 변경
  businessOwnerId: number; // 실제 서버에서 전송되는 필드
  businessNumber?: string;
  businessRegistrationNumber?: string; // 서버에서 실제로 사용하는 필드명
  businessName: string;
  ownerName: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  riskScore: number;
  estimatedProcessingTime: number;
  submittedAt?: string;
  createdAt?: string; // 실제 데이터에 있는 필드
  verificationStatus: string;
  lastActivityAt?: string;
  phoneNumber?: string; // 추가 필드
  email?: string; // 추가 필드
  // 추가로 실제 데이터에 있는 필드들
  businessAddress?: string;
  businessType?: string;
  completionRate?: number;
  progressPercentage?: number;
  riskLevelText?: string;
  statusDisplay?: string;
  isActive?: boolean;
  isInProgress?: boolean;
  isRejected?: boolean;
  isVerified?: boolean;
  autoVerificationResult?: string;
  topRiskFactors?: any[];
  verificationChecklist?: any;
  verificationHistory?: any[];
  businessOwner?: any;
  verificationRequestedAt?: string;
  updatedAt?: string;
  generatedAt?: string;
}

export interface BusinessOwnerProfile {
  user: {
    id: number;
    username: string;
    userType: string;
    createdAt: string;
  };
  businessOwner: {
    id: number;
    businessNumber: string;
    businessName: string;
    ownerName: string;
    verificationStatus: string;
    registeredAt: string;
    verifiedAt?: string;
  } | null;
  isRegistered: boolean;
  isVerified: boolean;
}

export interface BusinessVerificationRequest {
  businessOwnerId: number;
  decision: string; // "APPROVE" | "REJECT"
  reason?: string;
  adminNote?: string;
}

export interface BulkVerificationRequest {
  businessOwnerIds: number[];
  decision: string; // "APPROVE" | "REJECT"
  reason: string;
}

export interface BusinessNumberTestRequest {
  businessNumber: string;
  businessName?: string;
  ownerName?: string;
}

export interface BusinessNumberTestResponse {
  businessNumber: string;
  formatValid: boolean;
  verificationResult: {
    status: string;
    isValid: boolean;
    reason?: string;
    verifiedAt?: string;
  };
  apiResponse?: Record<string, any>;
}

export interface VerificationDetail {
  businessOwner: {
    id: number;
    businessNumber: string;
    businessName: string;
    ownerName: string;
  };
  checklist: {
    businessNumberFormat: boolean;
    nationalTaxVerification: boolean;
    documentIntegrity: boolean;
    behaviorPattern: boolean;
    timePattern: boolean;
    duplicateCheck: boolean;
    blacklistCheck: boolean;
    riskAssessment: boolean;
  };
  riskScore: number;
  priority: string;
  ocrResults?: any[];
  verificationHistory: Array<{
    timestamp: string;
    action: string;
    result: string;
    adminId?: string;
  }>;
  automatedResults: {
    passed: number;
    failed: number;
    pending: number;
  };
}

// ==================== 대시보드 관련 타입 ====================

export interface DashboardData {
  statistics: VerificationStats;
  pendingVerifications: PaginationResponse<PendingVerification>;
  priorityDistribution: Record<
    string,
    {
      count: number;
      avgRiskScore: number;
      avgProcessingTime: number;
    }
  >;
  summary: {
    totalApplications: number;
    pendingReview: number;
    completed: number;
    approvalRate: string;
  };
}

// ==================== 고급 분석 관련 타입 ====================

export interface TrendAnalysis {
  direction: "INCREASING" | "DECREASING" | "STABLE";
  changeRate: number;
  prediction: number;
  confidence: number;
}

export interface AdvancedMetrics {
  riskDistribution: {
    byRiskLevel: Record<
      string,
      {
        count: number;
        percentage: number;
      }
    >;
    highRiskTrend: TrendAnalysis;
    riskFactorFrequency: Record<string, number>;
  };
  automationEffectiveness: {
    automationRate: number;
    automationAccuracy: number;
    timeReduction: number;
  };
  performanceMetrics: {
    avgProcessingTime: number;
    throughput: number;
    queueLength: number;
    slaCompliance: number;
  };
  patternSummary: {
    detectedAnomalies: number;
    patternDetails: Array<{
      patternType: string;
      riskLevel: string;
      lastOccurrence: string;
      frequency: number;
    }>;
  };
  periodStats: {
    today: {
      newSubmissions: number;
      processedCount: number;
    };
    thisWeek: {
      totalSubmissions: number;
      dayOfWeekDistribution: Record<string, number>;
    };
    thisMonth: {
      totalSubmissions: number;
      approvalRate: number;
    };
  };
}

export interface RiskMonitoring {
  currentRiskDistribution: Record<
    string,
    { count: number; percentage: number }
  >;
  activePatterns: Array<{
    patternType: string;
    riskLevel: string;
    lastOccurrence: string;
    frequency: number;
  }>;
  riskTrend: string;
  alertLevel: "NORMAL" | "HIGH" | "CRITICAL";
}

export interface AutomationPerformance {
  automationEffectiveness: {
    automationRate: number;
    automationAccuracy: number;
    timeReduction: number;
  };
  performanceMetrics: {
    avgProcessingTime: number;
    throughput: number;
    queueLength: number;
    slaCompliance: number;
  };
  improvementAreas: string[];
  benchmark: {
    automationRate: {
      current: number;
      industryAverage: number;
      benchmark: number;
    };
    processingTime: {
      current: number;
      industryAverage: number;
      benchmark: number;
    };
    accuracy: { current: number; industryAverage: number; benchmark: number };
  };
}

export interface PatternAnalysis {
  patternSummary: {
    detectedAnomalies: number;
    patternDetails: Array<{
      patternType: string;
      riskLevel: string;
      lastOccurrence: string;
      frequency: number;
    }>;
  };
  riskFactorAnalysis: Record<string, number>;
  temporalPatterns: {
    hourlyDistribution: Record<string, number>;
    weeklyTrend: Record<string, number>;
    monthlyTrend: Array<{
      month: string;
      submissions: number;
      riskScore: number;
    }>;
    seasonalEffects: Record<string, any>;
  };
  anomalyDetection: {
    totalAnomalies: number;
    anomalyTypes: Record<string, any[]>;
    severityDistribution: Record<string, number>;
    recentAnomalies: any[];
  };
}

export interface PredictiveAnalysis {
  volumePrediction: {
    nextDayPrediction: number;
    nextWeekPrediction: number;
    confidence: number;
    trend: "INCREASING" | "STABLE" | "DECREASING";
  };
  riskTrendPrediction: string;
  resourceRequirement: {
    estimatedProcessingTime: number;
    requiredCapacity: Record<string, any>;
    bottleneckPrediction: string[];
    resourceAllocation: Record<string, any>;
  };
  seasonalityAnalysis: {
    monthlyPattern: Record<string, number>;
    weeklyPattern: Record<string, number>;
    holidayEffect: { beforeHoliday: number; afterHoliday: number };
    businessCycle: string;
  };
}

// ==================== 피드백 관련 타입 ====================

export interface FeedbackAnalytics {
  statistics: {
    totalFeedbacks: number;
    processedFeedbacks: number;
    averageRating: number;
    unprocessedCount: number;
  };
  learningEffectiveness: {
    modelAccuracy: number;
    improvementRate: number;
    lastTrainingDate: string;
  };
  qualityMetrics: {
    averageConfidenceRating: number;
    consistencyScore: number;
    detailRichness: number;
    timeToProvision: number;
    topIssues: string[];
    improvementSuggestions: string[];
  };
  trends?: {
    feedbackTypeDistribution: Record<string, number>;
    seasonalPatterns: {
      weekdayVsWeekend: { weekday: number; weekend: number };
      hourlyDistribution: Record<string, number>;
    };
  };
}

export interface CreateFeedbackRequest {
  feedbackType: string;
  message: string;
  rating?: number;
}

export interface FeedbackResponse {
  id: number;
  businessOwnerId: number;
  adminId: string;
  feedbackType: string;
  message: string;
  rating?: number;
  processed: boolean;
  createdAt: string;
  processedAt?: string;
}

export interface FeedbackImpactAnalysis {
  feedbackId: number;
  modelAccuracyChange: number;
  affectedPredictions: number;
  parameterChanges: Record<string, number>;
  performanceImprovement: boolean;
  incorporationDate: string;
  validationResults: {
    beforeAccuracy: number;
    afterAccuracy: number;
    beforeF1Score: number;
    afterF1Score: number;
  };
}

// ==================== 모델 학습 관련 타입 ====================

export interface ModelPerformanceResponse {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  lastEvaluationDate: string;
  modelVersion: string;
}

export interface ModelTrainingResponse {
  status: "started" | "completed" | "failed";
  message: string;
  estimatedCompletionTime?: string;
  jobId?: string;
}

export interface ABTestRequest {
  newWeights: Record<string, number>;
  testDuration?: number;
}

export interface ABTestResponse {
  testId: string;
  status: "started" | "running" | "completed";
  startDate: string;
  endDate: string;
  preliminaryResults?: {
    controlGroupAccuracy: number;
    testGroupAccuracy: number;
    sampleSize: number;
  };
}

// ==================== 리포트 관련 타입 ====================

export interface ReportRequest {
  date?: string;
  weekStart?: string;
  month?: string;
  format?: "PDF" | "EXCEL" | "CSV";
}

// ==================== 에러 관련 타입 ====================

export interface AdminErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp?: string;
  relatedId?: any;
}
