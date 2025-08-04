/**
 * 데이터 변환 유틸리티
 */

import { ScedulesProps, AttendanceRecordProps } from "@/app/attendance/components/types";

/**
 * 서버 응답을 클라이언트 타입으로 변환
 */
export const transformServerResponse = (serverData: any): ScedulesProps => {
  return {
    id: serverData.id,
    workplaceId: serverData.workplaceId,
    workplaceName: serverData.workplaceName,
    userId: serverData.userId,
    dayOfWeek: serverData.dayOfWeek,
    dayOfWeekKorean: serverData.dayOfWeekKorean,
    startTime: serverData.startTime,
    endTime: serverData.endTime,
    scheduledStartDate: serverData.scheduledStartDate,
    scheduledEndDate: serverData.scheduledEndDate,
    workingHours: serverData.workingHours,
    isActive: serverData.isActive,
    attendanceRecord: serverData.attendanceRecord ? transformAttendanceRecord(serverData.attendanceRecord) : null,
    currentStatus: serverData.currentStatus,
  };
};

/**
 * 출석 기록 데이터 변환
 */
export const transformAttendanceRecord = (serverRecord: any): AttendanceRecordProps => {
  return {
    id: serverRecord.id,
    scheduleId: serverRecord.scheduleId,
    attendanceType: serverRecord.attendanceType,
    attendanceStatus: serverRecord.attendanceStatus,
    checkInTime: serverRecord.checkInTime,
    checkOutTime: serverRecord.checkOutTime,
    workDurationMinutes: serverRecord.workDurationMinutes,
    overtimeDurationMinutes: serverRecord.overtimeDurationMinutes,
    // location 객체가 있으면 평면화된 필드로 변환
    locationLatitude: serverRecord.locationLatitude || serverRecord.location?.latitude,
    locationLongitude: serverRecord.locationLongitude || serverRecord.location?.longitude,
    locationAddress: serverRecord.locationAddress || serverRecord.location?.address,
  };
};

/**
 * 날짜 문자열을 Date 객체로 변환
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * 시간 문자열을 분으로 변환 (예: "09:30" -> 570)
 */
export const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 분을 시간 문자열로 변환 (예: 570 -> "09:30")
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * 근무 시간을 포맷팅 (분 단위를 시간:분 형태로)
 */
export const formatWorkDuration = (minutes: number): string => {
  if (minutes === 0) return "0분";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}분`;
  } else if (mins === 0) {
    return `${hours}시간`;
  } else {
    return `${hours}시간 ${mins}분`;
  }
};

/**
 * 출석 상태를 한글로 변환
 */
export const getAttendanceStatusText = (status: string): string => {
  switch (status) {
    case "NORMAL":
      return "정상";
    case "LATE":
      return "지각";
    case "EARLY":
      return "조기출근";
    case "OVERTIME":
      return "연장근무";
    case "ABSENT":
      return "결근";
    default:
      return status;
  }
};

/**
 * 출석 타입을 한글로 변환
 */
export const getAttendanceTypeText = (type: string): string => {
  switch (type) {
    case "WORK_START":
      return "출근";
    case "WORK_END":
      return "퇴근";
    case "OVERTIME_START":
      return "연장근무 시작";
    case "OVERTIME_END":
      return "연장근무 종료";
    default:
      return type;
  }
};

/**
 * 현재 상태를 한글로 변환
 */
export const getCurrentStatusText = (status: string): string => {
  switch (status) {
    case "NOT_STARTED":
      return "미시작";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    default:
      return status;
  }
};

/**
 * 출석 상태에 따른 색상 클래스 반환
 */
export const getStatusColorClass = (status: string): string => {
  switch (status) {
    case "NORMAL":
    case "COMPLETED":
      return "text-green-600 bg-green-50 border-green-200";
    case "LATE":
      return "text-red-600 bg-red-50 border-red-200";
    case "EARLY":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "OVERTIME":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "IN_PROGRESS":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "NOT_STARTED":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "ABSENT":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * 날짜가 과거인지 확인
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * 배열 데이터 유효성 검사
 */
export const validateSchedulesData = (data: any[]): data is ScedulesProps[] => {
  if (!Array.isArray(data)) return false;
  
  return data.every(item => 
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.workplaceId === 'number' &&
    typeof item.workplaceName === 'string' &&
    typeof item.userId === 'number' &&
    typeof item.dayOfWeek === 'string' &&
    typeof item.dayOfWeekKorean === 'string' &&
    typeof item.startTime === 'string' &&
    typeof item.endTime === 'string' &&
    typeof item.currentStatus === 'string'
  );
};

/**
 * 안전한 데이터 파싱
 */
export const safeParseSchedules = (data: unknown): ScedulesProps[] => {
  try {
    if (Array.isArray(data)) {
      return data.map(transformServerResponse).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error("스케줄 데이터 파싱 실패:", error);
    return [];
  }
};