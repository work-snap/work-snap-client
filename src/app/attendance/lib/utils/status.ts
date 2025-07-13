import { AttendanceStatus, WorkSchedule } from "../types";

export const determineStatus = (schedule: WorkSchedule): AttendanceStatus => {
  if (!schedule.clockInTime) {
    return AttendanceStatus.NOT_STARTED;
  }

  if (schedule.clockInTime && !schedule.clockOutTime) {
    return AttendanceStatus.IN_PROGRESS;
  }

  return AttendanceStatus.COMPLETED;
};

export const getStatusColor = (status: AttendanceStatus): string => {
  const colorMap: Record<AttendanceStatus, string> = {
    [AttendanceStatus.NOT_STARTED]: "gray-3",
    [AttendanceStatus.IN_PROGRESS]: "main",
    [AttendanceStatus.COMPLETED]: "sub2",
  };

  return colorMap[status];
};

export const getStatusMessage = (status: AttendanceStatus): string => {
  const messageMap: Record<AttendanceStatus, string> = {
    [AttendanceStatus.NOT_STARTED]: "근무 시작 전",
    [AttendanceStatus.IN_PROGRESS]: "근무 중",
    [AttendanceStatus.COMPLETED]: "근무 완료",
  };

  return messageMap[status];
};
