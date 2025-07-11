import { AttendanceStatus, AttendanceRecord, WorkType } from "./types";

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getAttendanceStatus = (
  record: AttendanceRecord
): AttendanceStatus => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (record.workDate !== today) {
    return record.actualEndTime
      ? AttendanceStatus.AFTER_WORK
      : AttendanceStatus.BEFORE_WORK;
  }

  // Use server status if available
  if (record.status) {
    switch (record.status) {
      case "SCHEDULED":
        return AttendanceStatus.BEFORE_WORK;
      case "IN_PROGRESS":
        return AttendanceStatus.WORKING;
      case "COMPLETED":
        return AttendanceStatus.AFTER_WORK;
      default:
        break;
    }
  }

  // Fallback to time-based logic
  if (record.actualEndTime) {
    return AttendanceStatus.AFTER_WORK;
  }

  if (record.actualStartTime) {
    return AttendanceStatus.WORKING;
  }

  return AttendanceStatus.BEFORE_WORK;
};

export const getDateNavigation = (currentDate: string) => {
  const date = new Date(currentDate);
  const prevDate = new Date(date);
  prevDate.setDate(date.getDate() - 1);

  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);

  return {
    prevDate: prevDate.toISOString().split("T")[0],
    nextDate: nextDate.toISOString().split("T")[0],
    currentDateFormatted: new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date),
  };
};

export const getWorkTypeLabel = (workType: WorkType): string => {
  const labels = {
    [WorkType.NORMAL]: "",
    [WorkType.EARLY_ARRIVAL]: "조기출근",
    [WorkType.EARLY_DEPARTURE]: "조퇴",
    [WorkType.LATE_DEPARTURE]: "연장근무",
  };
  return labels[workType];
};

export const getWorkTypeLabelFromString = (workTypeString: string): string => {
  switch (workTypeString) {
    case "EARLY_ARRIVAL":
      return "조기출근";
    case "EARLY_DEPARTURE":
      return "조퇴";
    case "LATE_DEPARTURE":
      return "연장근무";
    default:
      return "";
  }
};

export const getStatusMessage = (status: AttendanceStatus): string => {
  const messages: Record<AttendanceStatus, string> = {
    [AttendanceStatus.BEFORE_WORK]: "✅ 아직 출근 전입니다.",
    [AttendanceStatus.WORKING]: "✅ 열심히 일하고 있어요.",
    [AttendanceStatus.AFTER_WORK]: "✅ 오늘 업무 완료",
  } as Record<AttendanceStatus, string>;
  return messages[status];
};
