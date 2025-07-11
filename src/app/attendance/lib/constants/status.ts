import { AttendanceStatus as CoreAttendanceStatus } from "../types";

export type AttendanceStatus = CoreAttendanceStatus;

export const STATUS_CONFIG: Record<
  AttendanceStatus,
  { text: string; color: string; description: string }
> = {
  BEFORE_WORK: {
    text: "근무 예정",
    color: "text-gray3",
    description: "아직 출근하지 않았습니다.",
  },
  WORKING: {
    text: "근무 중",
    color: "text-main",
    description: "현재 근무 중입니다.",
  },
  AFTER_WORK: {
    text: "근무 완료",
    color: "text-sub2",
    description: "오늘 근무를 완료했습니다.",
  },
  NOT_STARTED: {
    text: "근무 예정",
    color: "text-gray3",
    description: "아직 출근하지 않았습니다.",
  },
  CLOCKED_IN: {
    text: "근무 중",
    color: "text-main",
    description: "현재 근무 중입니다.",
  },
  CLOCKED_OUT: {
    text: "근무 완료",
    color: "text-sub2",
    description: "오늘 근무를 완료했습니다.",
  },
  LATE: {
    text: "지각",
    color: "text-sub3",
    description: "지각했습니다.",
  },
  EARLY_LEAVE: {
    text: "조퇴",
    color: "text-warning",
    description: "조기 퇴근했습니다.",
  },
  ABSENT: {
    text: "결근",
    color: "text-sub1",
    description: "출근하지 않았습니다.",
  },
  IN_PROGRESS: {
    text: "근무 중",
    color: "text-main",
    description: "현재 근무 중입니다.",
  },
  COMPLETED: {
    text: "근무 완료",
    color: "text-sub2",
    description: "오늘 근무를 완료했습니다.",
  },
};

export const ACTION_CONFIG: Record<
  CoreAttendanceStatus | "DEFAULT",
  { text: string; color: string; ariaLabel: string }
> = {
  BEFORE_WORK: {
    text: "출근하기",
    color: "bg-main hover:bg-main/90",
    ariaLabel: "출근 처리하기",
  },
  WORKING: {
    text: "퇴근하기",
    color: "bg-sub2 hover:bg-sub2/90",
    ariaLabel: "퇴근 처리하기",
  },
  AFTER_WORK: {
    text: "완료",
    color: "bg-gray3",
    ariaLabel: "근무 완료됨",
  },
  NOT_STARTED: {
    text: "출근하기",
    color: "bg-main hover:bg-main/90",
    ariaLabel: "출근 처리하기",
  },
  CLOCKED_IN: {
    text: "퇴근하기",
    color: "bg-sub2 hover:bg-sub2/90",
    ariaLabel: "퇴근 처리하기",
  },
  CLOCKED_OUT: {
    text: "완료",
    color: "bg-gray3",
    ariaLabel: "근무 완료됨",
  },
  LATE: {
    text: "출근하기",
    color: "bg-main hover:bg-main/90",
    ariaLabel: "출근 처리하기",
  },
  EARLY_LEAVE: {
    text: "퇴근하기",
    color: "bg-sub2 hover:bg-sub2/90",
    ariaLabel: "퇴근 처리하기",
  },
  ABSENT: {
    text: "출근하기",
    color: "bg-main hover:bg-main/90",
    ariaLabel: "출근 처리하기",
  },
  IN_PROGRESS: {
    text: "퇴근하기",
    color: "bg-sub2 hover:bg-sub2/90",
    ariaLabel: "퇴근 처리하기",
  },
  COMPLETED: {
    text: "완료",
    color: "bg-gray3",
    ariaLabel: "근무 완료됨",
  },
  DEFAULT: {
    text: "완료",
    color: "bg-gray3",
    ariaLabel: "근무 완료됨",
  },
};
