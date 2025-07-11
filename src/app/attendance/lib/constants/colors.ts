import { AttendanceStatus } from "../types";

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.NOT_STARTED]: "text-gray-500",
  [AttendanceStatus.IN_PROGRESS]: "text-main",
  [AttendanceStatus.COMPLETED]: "text-green-500",
  [AttendanceStatus.LATE]: "text-red-500",
  [AttendanceStatus.ABSENT]: "text-red-700",
  [AttendanceStatus.BEFORE_WORK]: "text-gray-500",
  [AttendanceStatus.WORKING]: "text-main",
  [AttendanceStatus.AFTER_WORK]: "text-green-500",
  [AttendanceStatus.CLOCKED_IN]: "text-main",
  [AttendanceStatus.CLOCKED_OUT]: "text-green-500",
  [AttendanceStatus.EARLY_LEAVE]: "text-yellow-500", // assuming
} as const;

export const STATUS_MESSAGES: Record<AttendanceStatus, string> = {
  [AttendanceStatus.NOT_STARTED]: "근무 예정",
  [AttendanceStatus.IN_PROGRESS]: "근무 중",
  [AttendanceStatus.COMPLETED]: "근무 완료",
  [AttendanceStatus.LATE]: "지각",
  [AttendanceStatus.ABSENT]: "결근",
  [AttendanceStatus.BEFORE_WORK]: "근무 예정",
  [AttendanceStatus.WORKING]: "근무 중",
  [AttendanceStatus.AFTER_WORK]: "근무 완료",
  [AttendanceStatus.CLOCKED_IN]: "근무 중",
  [AttendanceStatus.CLOCKED_OUT]: "근무 완료",
  [AttendanceStatus.EARLY_LEAVE]: "조퇴",
} as const;
