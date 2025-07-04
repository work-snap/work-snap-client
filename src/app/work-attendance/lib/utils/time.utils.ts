import { TimeCalculation } from "../types";

/**
 * 시간 문자열을 분(minute) 단위로 변환
 * @param timeStr "HH:MM" 형식의 시간 문자열
 * @returns 분 단위 숫자
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * 분 단위 숫자를 시간 문자열로 변환
 * @param minutes 분 단위 숫자
 * @returns "HH:MM" 형식의 시간 문자열
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * 현재 시간을 분 단위로 반환
 * @param currentTime 현재 시간 (기본값: new Date())
 * @returns 현재 시간의 분 단위 숫자
 */
export const getCurrentMinutes = (currentTime: Date = new Date()): number => {
  return currentTime.getHours() * 60 + currentTime.getMinutes();
};

/**
 * 두 시간 사이의 차이를 분 단위로 계산
 * @param startTime 시작 시간 "HH:MM"
 * @param endTime 종료 시간 "HH:MM"
 * @returns 시간 차이 (분 단위)
 */
export const getTimeDifference = (
  startTime: string,
  endTime: string
): number => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // 야간 근무 고려 (종료 시간이 시작 시간보다 작은 경우)
  if (endMinutes < startMinutes) {
    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
};

/**
 * 특정 시간이 다른 시간보다 임계값만큼 이전인지 확인
 * @param currentTime 현재 시간 "HH:MM"
 * @param targetTime 목표 시간 "HH:MM"
 * @param thresholdMinutes 임계값 (분)
 * @returns 임계값만큼 이전인지 여부
 */
export const isTimeBefore = (
  currentTime: string,
  targetTime: string,
  thresholdMinutes: number
): boolean => {
  const currentMinutes = timeToMinutes(currentTime);
  const targetMinutes = timeToMinutes(targetTime);

  return currentMinutes < targetMinutes - thresholdMinutes;
};

/**
 * 특정 시간이 다른 시간보다 임계값만큼 이후인지 확인
 * @param currentTime 현재 시간 "HH:MM"
 * @param targetTime 목표 시간 "HH:MM"
 * @param thresholdMinutes 임계값 (분)
 * @returns 임계값만큼 이후인지 여부
 */
export const isTimeAfter = (
  currentTime: string,
  targetTime: string,
  thresholdMinutes: number
): boolean => {
  const currentMinutes = timeToMinutes(currentTime);
  const targetMinutes = timeToMinutes(targetTime);

  return currentMinutes > targetMinutes + thresholdMinutes;
};

/**
 * 현재 시간과 예정된 시간들을 기반으로 시간 계산 정보 반환
 * @param scheduledStartTime 예정 시작 시간 "HH:MM"
 * @param scheduledEndTime 예정 종료 시간 "HH:MM"
 * @param currentTime 현재 시간 (기본값: new Date())
 * @returns TimeCalculation 객체
 */
export const calculateTimeInfo = (
  scheduledStartTime: string,
  scheduledEndTime: string,
  currentTime: Date = new Date()
): TimeCalculation => {
  const currentMinutes = getCurrentMinutes(currentTime);
  const scheduledStartMinutes = timeToMinutes(scheduledStartTime);
  const scheduledEndMinutes = timeToMinutes(scheduledEndTime);

  // 야간 근무 고려
  let adjustedEndMinutes = scheduledEndMinutes;
  if (scheduledEndMinutes < scheduledStartMinutes) {
    adjustedEndMinutes += 24 * 60; // 다음날로 조정
  }

  const timeUntilStart = Math.max(0, scheduledStartMinutes - currentMinutes);
  const timeUntilEnd = Math.max(0, adjustedEndMinutes - currentMinutes);

  return {
    currentMinutes,
    scheduledStartMinutes,
    scheduledEndMinutes: adjustedEndMinutes,
    timeUntilStart,
    timeUntilEnd,
  };
};

/**
 * 분 단위 시간을 사람이 읽기 쉬운 형태로 변환
 * @param minutes 분 단위 시간
 * @returns "X시간 Y분" 형태의 문자열
 */
export const formatDuration = (minutes: number): string => {
  if (minutes === 0) return "0분";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;

  return `${hours}시간 ${mins}분`;
};

/**
 * 현재 시간을 "HH:MM" 형식으로 반환
 * @param date 날짜 객체 (기본값: new Date())
 * @returns "HH:MM" 형식의 시간 문자열
 */
export const getCurrentTimeString = (date: Date = new Date()): string => {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

/**
 * 날짜를 "YYYY-MM-DD" 형식으로 반환
 * @param date 날짜 객체 (기본값: new Date())
 * @returns "YYYY-MM-DD" 형식의 날짜 문자열
 */
export const getCurrentDateString = (date: Date = new Date()): string => {
  return date.toISOString().split("T")[0];
};

/**
 * 시간이 야간 근무 시간대인지 확인
 * @param startTime 시작 시간 "HH:MM"
 * @param endTime 종료 시간 "HH:MM"
 * @returns 야간 근무 여부
 */
export const isOvernightShift = (
  startTime: string,
  endTime: string
): boolean => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return endMinutes <= startMinutes;
};

/**
 * ISO 문자열 또는 시간 문자열을 "HH:MM" 형식으로 포맷
 * @param timeStr ISO 문자열 또는 "HH:MM" 형식 문자열
 * @returns "HH:MM" 형식의 시간 문자열
 */
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return "";

  // ISO 문자열인 경우 (예: "2024-01-01T09:00:00")
  if (timeStr.includes("T")) {
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // 이미 "HH:MM" 형식인 경우
  return timeStr;
};

/**
 * 야간 근무 총 시간 계산 (분 단위)
 * @param startTime 시작 시간 "HH:MM"
 * @param endTime 종료 시간 "HH:MM"
 * @returns 총 근무 시간 (분)
 */
export const calculateOvernightDuration = (
  startTime: string,
  endTime: string
): number => {
  if (!isOvernightShift(startTime, endTime)) {
    return getTimeDifference(startTime, endTime);
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // 야간 근무: 시작 시간부터 자정까지 + 자정부터 종료 시간까지
  const toMidnight = 24 * 60 - startMinutes;
  const fromMidnight = endMinutes;

  return toMidnight + fromMidnight;
};

/**
 * 날짜에 하루 추가
 * @param dateStr "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns 다음날 날짜 문자열
 */
export const addDays = (dateStr: string, days: number = 1): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

/**
 * 날짜에서 하루 빼기
 * @param dateStr "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns 이전날 날짜 문자열
 */
export const subtractDays = (dateStr: string, days: number = 1): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

/**
 * 야간 근무의 실제 시작일 계산
 * 예: 11PM-2AM 근무를 1월 1일에 시작하면, 시작일은 1월 1일
 * @param workDate 근무 일자
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @returns 실제 시작일
 */
export const getOvernightStartDate = (
  workDate: string,
  startTime: string,
  endTime: string
): string => {
  // 야간 근무가 아니면 원래 날짜 반환
  if (!isOvernightShift(startTime, endTime)) {
    return workDate;
  }

  // 야간 근무인 경우 workDate가 실제 시작일
  return workDate;
};

/**
 * 야간 근무의 실제 종료일 계산
 * 예: 11PM-2AM 근무를 1월 1일에 시작하면, 종료일은 1월 2일
 * @param workDate 근무 일자
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @returns 실제 종료일
 */
export const getOvernightEndDate = (
  workDate: string,
  startTime: string,
  endTime: string
): string => {
  // 야간 근무가 아니면 원래 날짜 반환
  if (!isOvernightShift(startTime, endTime)) {
    return workDate;
  }

  // 야간 근무인 경우 다음날이 종료일
  return addDays(workDate, 1);
};

/**
 * 특정 날짜에 야간 근무가 표시되어야 하는지 확인
 * @param targetDate 확인할 날짜 "YYYY-MM-DD"
 * @param workDate 원본 근무 일자
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @returns 해당 날짜에 표시 여부와 카드 타입
 */
export const getOvernightDisplayInfo = (
  targetDate: string,
  workDate: string,
  startTime: string,
  endTime: string
): { shouldDisplay: boolean; cardType: "overnight-start" | "overnight-end" | null } => {
  if (!isOvernightShift(startTime, endTime)) {
    return { shouldDisplay: targetDate === workDate, cardType: null };
  }

  const startDate = getOvernightStartDate(workDate, startTime, endTime);
  const endDate = getOvernightEndDate(workDate, startTime, endTime);

  if (targetDate === startDate) {
    return { shouldDisplay: true, cardType: "overnight-start" };
  }

  if (targetDate === endDate) {
    return { shouldDisplay: true, cardType: "overnight-end" };
  }

  return { shouldDisplay: false, cardType: null };
};
