/**
 * 근무 일정 타입 정의
 * 사용자의 정기적인 근무 일정을 나타냅니다.
 */
export interface WorkSchedule {
  id: number;
  workplaceId: number;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  nextDayEndTime?: string;
}

export interface Attendance {
  id: number;
  workplaceId: number;
  clockInTime?: string;
  clockOutTime?: string;
  isAdditionalWork: boolean;
  status: AttendanceStatus;
}

export enum AttendanceStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  LATE = "LATE",
  ABSENT = "ABSENT",
  // Legacy values for backward compatibility
  BEFORE_WORK = "BEFORE_WORK",
  WORKING = "WORKING",
  AFTER_WORK = "AFTER_WORK",
  CLOCKED_IN = "CLOCKED_IN",
  CLOCKED_OUT = "CLOCKED_OUT",
  EARLY_LEAVE = "EARLY_LEAVE",
}

export interface DailyAttendanceResponse {
  date: string;
  schedules: WorkSchedule[];
  attendances: Attendance[];
}

export interface AttendanceCardViewModel {
  id: number;
  workplaceId: number;
  workplaceName: string;
  schedule: WorkSchedule;
  attendance?: Attendance;
  isAdditionalWork: boolean;
}

// ----- Legacy Compatibility Types -----

/**
 * 출퇴근 타입 (클라이언트 전용 비즈니스 로직)
 */
export enum WorkType {
  NORMAL = "NORMAL",
  EARLY_ARRIVAL = "EARLY_ARRIVAL",
  EARLY_DEPARTURE = "EARLY_DEPARTURE",
  LATE_DEPARTURE = "LATE_DEPARTURE",
}

/**
 * 기존 컴포넌트에서 사용하던 AttendanceRecord 타입.
 * 서버 응답 DTO와 1:1 매핑되지는 않습니다.
 */
export interface AttendanceRecord {
  id: number;
  workplaceId: number;
  workplaceName?: string;
  workScheduleId?: number;
  userId: number;
  workDate: string; // YYYY-MM-DD
  scheduledStartTime: string; // HH:mm
  scheduledEndTime: string; // HH:mm
  actualStartTime?: string; // HH:mm
  actualEndTime?: string; // HH:mm
  clockInTypes: string[]; // WorkType string values
  clockOutTypes: string[]; // WorkType string values
  isAdditionalWork: boolean;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  statusKorean?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdditionalWorkRequest {
  workplaceId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
