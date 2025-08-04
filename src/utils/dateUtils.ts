/**
 * 날짜 관련 유틸리티 함수들
 */

// 날짜 포맷 옵션 인터페이스
export interface DateFormatOptions {
  showWeekday?: boolean;
  shortWeekday?: boolean;
  showYear?: boolean;
  showMonth?: boolean;
  showDay?: boolean;
  locale?: string;
}

// 날짜 비교 옵션 인터페이스
export interface DateCompareOptions {
  ignoreTime?: boolean;
  timezone?: string;
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDate = (
  date: Date,
  options: DateFormatOptions = {}
): string => {
  const {
    showWeekday = true,
    shortWeekday = true,
    showYear = true,
    showMonth = true,
    showDay = true,
    locale = "ko-KR",
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {};

  if (showYear) formatOptions.year = "numeric";
  if (showMonth) formatOptions.month = "2-digit";
  if (showDay) formatOptions.day = "2-digit";
  if (showWeekday) {
    formatOptions.weekday = shortWeekday ? "short" : "long";
  }

  try {
    return date.toLocaleDateString(locale, formatOptions);
  } catch (error) {
    console.warn("날짜 포맷팅 실패:", error);
    return date.toLocaleDateString();
  }
};

/**
 * 날짜를 간단한 형식으로 포맷팅 (YYYY-MM-DD)
 */
export const formatDateSimple = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 날짜를 표시용 형식으로 포맷팅
 */
export const formatDateDisplay = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) {
    return "오늘";
  } else if (isSameDay(date, yesterday)) {
    return "어제";
  } else if (isSameDay(date, tomorrow)) {
    return "내일";
  } else {
    return formatDate(date, { showYear: false });
  }
};

/**
 * 날짜 라벨 생성 (오늘, 어제, 내일 또는 날짜)
 */
export const getDateLabel = (date: Date): string => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === -1) {
    return "어제";
  } else if (diffDays === 1) {
    return "내일";
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays}일 후`;
  } else if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)}일 전`;
  } else {
    return formatDate(date, { showYear: false, showWeekday: true });
  }
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * 날짜가 어제인지 확인
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * 날짜가 내일인지 확인
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
};

/**
 * 날짜가 이번 주인지 확인
 */
export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
};

/**
 * 날짜가 이번 달인지 확인
 */
export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
};

/**
 * 날짜가 이번 해인지 확인
 */
export const isThisYear = (date: Date): boolean => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear();
};

/**
 * 날짜가 과거인지 확인
 */
export const isPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

/**
 * 날짜가 미래인지 확인
 */
export const isFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate > today;
};

/**
 * 날짜가 주말인지 확인
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
};

/**
 * 날짜가 평일인지 확인
 */
export const isWeekday = (date: Date): boolean => {
  return !isWeekend(date);
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 날짜에 일수 추가
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 날짜에서 일수 빼기
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * 날짜에 월 추가
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * 날짜에서 월 빼기
 */
export const subtractMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

/**
 * 주의 시작일 (월요일) 가져오기
 */
export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * 주의 마지막일 (일요일) 가져오기
 */
export const getEndOfWeek = (date: Date): Date => {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * 월의 시작일 가져오기
 */
export const getStartOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * 월의 마지막일 가져오기
 */
export const getEndOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * 년의 시작일 가져오기
 */
export const getStartOfYear = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * 년의 마지막일 가져오기
 */
export const getEndOfYear = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * 날짜 범위 생성
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * 주 범위 생성 (월요일 시작)
 */
export const getWeekRange = (date: Date): Date[] => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  return getDateRange(startOfWeek, endOfWeek);
};

/**
 * 월 범위 생성
 */
export const getMonthRange = (date: Date): Date[] => {
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);
  return getDateRange(startOfMonth, endOfMonth);
};

/**
 * 요일 이름 가져오기
 */
export const getDayName = (date: Date, short = false): string => {
  const days = short
    ? ["일", "월", "화", "수", "목", "금", "토"]
    : ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return days[date.getDay()];
};

/**
 * 월 이름 가져오기
 */
export const getMonthName = (date: Date, short = false): string => {
  const months = short
    ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    : [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ];
  return months[date.getMonth()];
};

/**
 * 날짜 문자열 유효성 검사
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * 날짜 문자열을 Date 객체로 변환
 */
export const parseDate = (dateString: string): Date | null => {
  if (!isValidDate(dateString)) {
    return null;
  }
  return new Date(dateString);
};

/**
 * 날짜를 ISO 문자열로 변환 (시간 부분 제거)
 */
export const toDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * 날짜 비교 (이전, 동일, 이후)
 */
export const compareDate = (date1: Date, date2: Date): -1 | 0 | 1 => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * 날짜 정렬 (오름차순)
 */
export const sortDatesAsc = (dates: Date[]): Date[] => {
  return [...dates].sort((a, b) => compareDate(a, b));
};

/**
 * 날짜 정렬 (내림차순)
 */
export const sortDatesDesc = (dates: Date[]): Date[] => {
  return [...dates].sort((a, b) => compareDate(b, a));
};

/**
 * 가장 가까운 평일 찾기
 */
export const getClosestWeekday = (date: Date): Date => {
  const result = new Date(date);

  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};

/**
 * 가장 가까운 주말 찾기
 */
export const getClosestWeekend = (date: Date): Date => {
  const result = new Date(date);

  while (isWeekday(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};

/**
 * 날짜 형식 변환 (YYYY-MM-DD -> Date)
 */
export const fromDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 상대적 날짜 표현 ("2일 전", "1주일 후")
 */
export const getRelativeDateString = (
  date: Date,
  baseDate: Date = new Date()
): string => {
  const diffTime = date.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "내일";
  } else if (diffDays === -1) {
    return "어제";
  } else if (diffDays > 1 && diffDays < 7) {
    return `${diffDays}일 후`;
  } else if (diffDays < -1 && diffDays > -7) {
    return `${Math.abs(diffDays)}일 전`;
  } else if (diffDays >= 7 && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}주 후`;
  } else if (diffDays <= -7 && diffDays > -30) {
    const weeks = Math.floor(Math.abs(diffDays) / 7);
    return `${weeks}주 전`;
  } else if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    return `${months}개월 후`;
  } else {
    const months = Math.floor(Math.abs(diffDays) / 30);
    return `${months}개월 전`;
  }
};

/**
 * 날짜 차이 계산 (년, 월, 일)
 */
export const getDateDifference = (
  startDate: Date,
  endDate: Date
): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
} => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonthEnd = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonthEnd.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = getDaysBetween(start, end);

  return { years, months, days, totalDays };
};

/**
 * 날짜 배열에서 중복 제거
 */
export const uniqueDates = (dates: Date[]): Date[] => {
  const unique: Date[] = [];
  const seen = new Set<string>();

  for (const date of dates) {
    const dateString = toDateString(date);
    if (!seen.has(dateString)) {
      seen.add(dateString);
      unique.push(date);
    }
  }

  return unique;
};

/**
 * 날짜가 특정 범위 내에 있는지 확인
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  d.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return d >= start && d <= end;
};

/**
 * 날짜를 "a월 b일" 형식으로 포맷팅
 */
export const formatMonthDay = (date: Date): string => {
  const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
  const day = date.getDate();

  return `${month}월 ${day}일`;
};
