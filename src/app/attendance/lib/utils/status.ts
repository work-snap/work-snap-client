import { AttendanceStatus, Attendance, WorkSchedule } from "../types";
import { isAfter, isBefore, parseISO } from "date-fns";
import { STATUS_COLORS, STATUS_MESSAGES } from "../constants/colors";

export const determineStatus = (
  schedule: WorkSchedule,
  attendance?: Attendance,
  currentTime: Date = new Date()
): AttendanceStatus => {
  // 출근 기록이 없는 경우
  if (!attendance) {
    const scheduleStart = parseISO(schedule.startTime);
    return isBefore(currentTime, scheduleStart)
      ? AttendanceStatus.NOT_STARTED
      : AttendanceStatus.ABSENT;
  }

  // 출근만 한 경우 (근무 중)
  if (attendance.clockInTime && !attendance.clockOutTime) {
    return AttendanceStatus.IN_PROGRESS;
  }

  // 출근, 퇴근 모두 한 경우 (근무 완료)
  if (attendance.clockInTime && attendance.clockOutTime) {
    return AttendanceStatus.COMPLETED;
  }

  // 출근 시간이 지났지만 출근하지 않은 경우 (지각)
  const scheduleStart = parseISO(schedule.startTime);
  if (isAfter(currentTime, scheduleStart)) {
    return AttendanceStatus.LATE;
  }

  // 기본값: 근무 예정
  return AttendanceStatus.NOT_STARTED;
};

export const getStatusColor = (status: AttendanceStatus): string => {
  return STATUS_COLORS[status];
};

export const getStatusMessage = (status: AttendanceStatus): string => {
  return STATUS_MESSAGES[status];
};
