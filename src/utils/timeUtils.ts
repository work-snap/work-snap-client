/**
 * 시간 관련 유틸리티 함수들
 */

// 시간 포맷 옵션
export interface TimeFormatOptions {
  showSeconds?: boolean;
  hour12?: boolean;
  locale?: string;
}

export interface DateFormatOptions {
  showWeekday?: boolean;
  shortWeekday?: boolean;
  showYear?: boolean;
  locale?: string;
}

// 기본 시간 포맷팅
export const formatTime = (
  date: Date,
  options: TimeFormatOptions = {}
): string => {
  const {
    showSeconds = true,
    hour12 = false,
    locale = "ko-KR",
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12,
  };

  if (showSeconds) {
    formatOptions.second = "2-digit";
  }

  return date.toLocaleTimeString(locale, formatOptions);
};

// 날짜 포맷팅
export const formatDate = (
  date: Date,
  options: DateFormatOptions = {}
): string => {
  const {
    showWeekday = true,
    shortWeekday = true,
    showYear = true,
    locale = "ko-KR",
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
  };

  if (showYear) {
    formatOptions.year = "numeric";
  }

  if (showWeekday) {
    formatOptions.weekday = shortWeekday ? "short" : "long";
  }

  return date.toLocaleDateString(locale, formatOptions);
};

// 날짜와 시간 함께 포맷팅
export const formatDateTime = (
  date: Date,
  timeOptions: TimeFormatOptions = {},
  dateOptions: DateFormatOptions = {}
): string => {
  const formattedDate = formatDate(date, dateOptions);
  const formattedTime = formatTime(date, timeOptions);
  
  return `${formattedDate} ${formattedTime}`;
};

// 상대 시간 계산 (예: "2분 전", "1시간 후")
export const formatRelativeTime = (
  date: Date,
  baseDate: Date = new Date(),
  locale: string = "ko-KR"
): string => {
  const diffInSeconds = Math.floor((date.getTime() - baseDate.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  
  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (interval >= 1) {
      return rtf.format(
        diffInSeconds < 0 ? -interval : interval,
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }
  
  return rtf.format(0, "second");
};

// 시간 차이 계산 (밀리초)
export const getTimeDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime());
};

// 시간 차이를 읽기 쉬운 형태로 변환
export const formatTimeDifference = (
  milliseconds: number,
  locale: string = "ko-KR"
): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}일 ${hours % 24}시간`;
  } else if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  } else {
    return `${seconds}초`;
  }
};

// 시간 범위 확인 (특정 시간이 범위 내에 있는지)
export const isTimeInRange = (
  time: Date,
  startTime: Date,
  endTime: Date
): boolean => {
  return time >= startTime && time <= endTime;
};

// 오늘 날짜 확인
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// 어제 날짜 확인
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

// 내일 날짜 확인
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

// 날짜를 한국어로 표현 (오늘, 어제, 내일, 또는 날짜)
export const getDateLabel = (date: Date): string => {
  if (isToday(date)) return "오늘";
  if (isYesterday(date)) return "어제";
  if (isTomorrow(date)) return "내일";
  
  return formatDate(date, { showWeekday: true, shortWeekday: true });
};

// 시간대 변환
export const convertToTimeZone = (
  date: Date,
  timeZone: string = "Asia/Seoul"
): Date => {
  return new Date(date.toLocaleString("en-US", { timeZone }));
};

// 근무시간 계산 (시작 시간과 종료 시간 사이의 시간)
export const calculateWorkingHours = (
  startTime: Date,
  endTime: Date,
  breakTimeMinutes: number = 60
): {
  totalMinutes: number;
  totalHours: number;
  formattedDuration: string;
} => {
  const diffInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const workingMinutes = Math.max(0, diffInMinutes - breakTimeMinutes);
  const workingHours = Math.floor(workingMinutes / 60);
  const remainingMinutes = workingMinutes % 60;
  
  return {
    totalMinutes: workingMinutes,
    totalHours: parseFloat((workingMinutes / 60).toFixed(2)),
    formattedDuration: `${workingHours}시간 ${remainingMinutes}분`,
  };
};

// 출근 상태 판단 (정상, 지각, 조기출근 등)
export const getAttendanceStatus = (
  actualTime: Date,
  scheduledTime: Date,
  earlyThresholdMinutes: number = 30,
  lateThresholdMinutes: number = 10
): "EARLY" | "NORMAL" | "LATE" => {
  const diffInMinutes = Math.floor((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < -earlyThresholdMinutes) {
    return "EARLY"; // 조기출근
  } else if (diffInMinutes > lateThresholdMinutes) {
    return "LATE"; // 지각
  } else {
    return "NORMAL"; // 정상출근
  }
};

// 시간을 24시간 형식으로 변환
export const convertTo24Hour = (time: string): string => {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");
  
  if (hours === "12") {
    hours = "00";
  }
  
  if (modifier === "PM" || modifier === "오후") {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  
  return `${hours.padStart(2, "0")}:${minutes}`;
};

// 시간을 12시간 형식으로 변환
export const convertTo12Hour = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  
  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
};

// 시간 검증
export const isValidTime = (timeString: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// 날짜 검증
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// 네트워크 지연 시간 계산
export const calculateNetworkDelay = (
  requestTime: number,
  responseTime: number
): number => {
  return Math.max(0, Math.round((responseTime - requestTime) / 2));
};

// 시간 동기화 정확도 계산
export const calculateTimeSyncAccuracy = (
  clientTime: Date,
  serverTime: Date,
  networkDelay: number = 0
): {
  accuracy: number;
  isAccurate: boolean;
  message: string;
} => {
  const adjustedServerTime = new Date(serverTime.getTime() + networkDelay);
  const timeDiff = Math.abs(clientTime.getTime() - adjustedServerTime.getTime());
  
  // 1초 이내는 매우 정확, 5초 이내는 정확, 그 이상은 부정확
  const isVeryAccurate = timeDiff <= 1000;
  const isAccurate = timeDiff <= 5000;
  
  let message = "";
  if (isVeryAccurate) {
    message = "시간 동기화가 매우 정확합니다";
  } else if (isAccurate) {
    message = "시간 동기화가 정확합니다";
  } else {
    message = "시간 동기화가 부정확합니다. 네트워크 연결을 확인해주세요";
  }
  
  return {
    accuracy: Math.max(0, 100 - (timeDiff / 1000 * 10)), // 0-100 점수
    isAccurate,
    message,
  };
};