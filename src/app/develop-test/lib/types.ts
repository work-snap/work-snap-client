// 공통 상태/유틸 타입
export type LoadingState = string | null;

export interface TestResult {
  endpoint: string;
  method: string;
  status: number | null;
  data: unknown;
  error: unknown;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string | null;
  userId: string | null;
}

// Auth
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

// User
export interface UserUpdateForm {
  nickname?: string;
  userType?: "PART_TIME_JOB" | "BUSINESS_OWNER";
}

// Business Owner
export interface BusinessOwnerRegistrationForm {
  businessRegistrationImage: string;
}

export interface BusinessOwnerTestRequest {
  businessRegistrationNumber: string;
}

// Workplace
export interface WorkplaceRegistrationForm {
  name: string;
  address: string;
  phoneNumber?: string | null;
  description?: string | null;
  isMain?: boolean;
}

export interface Workplace {
  id: number;
  name: string;
  address: string;
}

// Work Schedule
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface WorkScheduleItem {
  employeeUserId: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface WorkScheduleBatchCreateForm {
  workplaceId: number;
  inviteCode?: string;
  schedules: WorkScheduleItem[];
}

export interface WorkScheduleBatchCreateResponse {
  success: boolean;
  createdCount: number;
}

export interface WorkScheduleUpdateForm {
  startTime?: string;
  endTime?: string;
  dayOfWeek?: DayOfWeek;
}

export interface WorkSchedule {
  id: number;
  workplaceId: number;
  employeeUserId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface WorkScheduleStatistics {
  totalSchedules: number;
  employees: number;
}

// Part-time / Invite
export interface InviteCodeResponse {
  inviteCode: string;
  createdAt?: string;
}

export interface PartTimeInfo {
  userId: number;
  nickname: string;
}

export const DAY_OF_WEEK_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MONDAY", label: "월" },
  { value: "TUESDAY", label: "화" },
  { value: "WEDNESDAY", label: "수" },
  { value: "THURSDAY", label: "목" },
  { value: "FRIDAY", label: "금" },
  { value: "SATURDAY", label: "토" },
  { value: "SUNDAY", label: "일" },
];

export const TIME_OPTIONS: Array<{ value: string; label: string }> = Array.from(
  { length: 24 * 2 },
  (_, i) => {
    const hours = String(Math.floor(i / 2)).padStart(2, "0");
    const minutes = i % 2 === 0 ? "00" : "30";
    const value = `${hours}:${minutes}`;
    return { value, label: value };
  }
);

// Attendance
export interface ClockInReq {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  note?: string;
  photoUrl?: string;
}

export interface ClockOutReq {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  note?: string;
  photoUrl?: string;
}
