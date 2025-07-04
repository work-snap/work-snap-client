/**
 * 출근 타입 (서버 ClockInType과 동일)
 */
export enum ClockInType {
  NORMAL = "NORMAL",
  EARLY_ARRIVAL = "EARLY_ARRIVAL",
}

/**
 * 퇴근 타입 (서버 ClockOutType과 동일)
 */
export enum ClockOutType {
  NORMAL = "NORMAL",
  EARLY_DEPARTURE = "EARLY_DEPARTURE",
  LATE_DEPARTURE = "LATE_DEPARTURE",
}

/**
 * 출근 상태 (서버 AttendanceStatus와 동일)
 */
export enum AttendanceStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABSENT = "ABSENT",
}

/**
 * 서버 API 응답 공통 형식
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * 알림 타입
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * 위치 데이터
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * 출근 요청 DTO
 */
export interface ClockInReq {
  actualTime?: string;
  notes?: string;
  manualClockInType?: ClockInType;
}

/**
 * 퇴근 요청 DTO
 */
export interface ClockOutReq {
  actualTime?: string;
  notes?: string;
  manualClockOutType?: ClockOutType;
}

/**
 * 출근 기록 응답 DTO (서버 API 스펙과 일치)
 */
export interface AttendanceRes {
  id: number;
  workScheduleId?: number;
  userId: number;
  workplaceId: number;
  workDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  clockInTypes: string[];
  clockInTypesKorean: string;
  clockOutTypes: string[];
  clockOutTypesKorean: string;
  status: AttendanceStatus;
  statusKorean: string;
  isAdditionalWork: boolean;
  actualWorkingMinutes?: number;
  allAttendanceInfo: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 일별 출근 현황 응답 DTO
 */
export interface DailyAttendanceRes {
  date: string;
  attendances: AttendanceRes[];
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  additionalWorkCount: number;
}

/**
 * 수동 선택 버튼 상태
 */
export interface SmartButtonState {
  action: "CLOCK_IN" | "CLOCK_OUT";
  type: ClockInType | ClockOutType;
  label: string;
  icon: string;
  color: string;
  variant: "default" | "early" | "late" | "overtime";
  isRecommended: false; // AI 추천 기능 제거됨 - 항상 false
}

/**
 * 버튼 옵션 정의
 */
export interface ButtonOption {
  type: ClockInType | ClockOutType;
  label: string;
  icon: string;
  color: string;
}

/**
 * 시간 계산 유틸리티 타입
 */
export interface TimeCalculation {
  currentMinutes: number;
  scheduledStartMinutes: number;
  scheduledEndMinutes: number;
  timeUntilStart: number;
  timeUntilEnd: number;
}

/**
 * 상황별 액션 버튼 상태
 */
export interface ContextButtonState {
  action: "CLOCK_IN" | "CLOCK_OUT" | "DISABLED";
  type: ClockInType | ClockOutType | null;
  label: string;
  icon: string;
  color: string;
  disabled: boolean;
  variant: "early" | "normal" | "late" | "additional" | "completed";
}

/**
 * 카드 타입 정의
 */
export type CardType = "normal" | "overnight-start" | "overnight-end" | "additional";

/**
 * 카드 표시 설정
 */
export interface CardDisplayConfig {
  cardType: CardType;
  displayDate: string;
  title: string;
  subtitle?: string;
  showTimeRange: boolean;
  isOvernightPart: boolean;
}

/**
 * 야간 근무 데이터
 */
export interface OvernightWorkData {
  originalAttendance: AttendanceRes;
  startDateCard: CardDisplayConfig;
  endDateCard: CardDisplayConfig;
}

/**
 * 일별 스케줄 카드 Props
 */
export interface DailyScheduleCardProps {
  attendance: AttendanceRes;
  cardConfig: CardDisplayConfig;
  onMainAction: (type: "normal") => Promise<void>;
  onUpdate?: () => void;
  className?: string;
}

/**
 * 상황별 버튼 설정
 */
export interface ContextButtonConfig {
  [key: string]: {
    [status: string]: {
      label: string;
      icon: string;
      color: string;
      type: ClockInType | ClockOutType | null;
      disabled: boolean;
    };
  };
}
