import {
  AttendanceRes,
  CardDisplayConfig,
  OvernightWorkData,
  CardType,
} from "../types";
import {
  isOvernightShift,
  getOvernightStartDate,
  getOvernightEndDate,
  getOvernightDisplayInfo,
  formatTime,
} from "./time.utils";

/**
 * 출근 기록을 카드 표시용 데이터로 변환
 * @param attendance 출근 기록
 * @param targetDate 표시할 날짜 (YYYY-MM-DD)
 * @returns 카드 표시 설정 배열 (야간 근무인 경우 여러 개)
 */
export const processAttendanceForDisplay = (
  attendance: AttendanceRes,
  targetDate: string
): CardDisplayConfig[] => {
  const { scheduledStartTime, scheduledEndTime, workDate, isAdditionalWork } = attendance;

  // 추가 근무인 경우
  if (isAdditionalWork) {
    if (workDate !== targetDate) return [];
    
    return [{
      cardType: "additional",
      displayDate: targetDate,
      title: "추가 근무",
      subtitle: `${formatTime(scheduledStartTime)} - ${formatTime(scheduledEndTime)}`,
      showTimeRange: true,
      isOvernightPart: false,
    }];
  }

  // 야간 근무 확인
  const isOvernight = isOvernightShift(scheduledStartTime, scheduledEndTime);
  
  if (!isOvernight) {
    // 일반 근무
    if (workDate !== targetDate) return [];
    
    return [{
      cardType: "normal",
      displayDate: targetDate,
      title: "정규 근무",
      subtitle: `${formatTime(scheduledStartTime)} - ${formatTime(scheduledEndTime)}`,
      showTimeRange: true,
      isOvernightPart: false,
    }];
  }

  // 야간 근무 처리
  const displayInfo = getOvernightDisplayInfo(
    targetDate,
    workDate,
    scheduledStartTime,
    scheduledEndTime
  );

  if (!displayInfo.shouldDisplay) return [];

  const cardType = displayInfo.cardType as CardType;
  
  return [{
    cardType,
    displayDate: targetDate,
    title: getOvernightCardTitle(cardType),
    subtitle: getOvernightCardSubtitle(cardType, scheduledStartTime, scheduledEndTime),
    showTimeRange: true,
    isOvernightPart: true,
  }];
};

/**
 * 야간 근무 카드 제목 반환
 */
const getOvernightCardTitle = (cardType: CardType): string => {
  switch (cardType) {
    case "overnight-start":
      return "야간 근무 (시작)";
    case "overnight-end":
      return "야간 근무 (종료)";
    default:
      return "야간 근무";
  }
};

/**
 * 야간 근무 카드 부제목 반환
 */
const getOvernightCardSubtitle = (
  cardType: CardType,
  startTime: string,
  endTime: string
): string => {
  switch (cardType) {
    case "overnight-start":
      return `${formatTime(startTime)}부터 시작`;
    case "overnight-end":
      return `${formatTime(endTime)}까지`;
    default:
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
};

/**
 * 여러 출근 기록을 날짜별 카드로 그룹화
 * @param attendances 출근 기록 배열
 * @param targetDate 표시할 날짜
 * @returns 해당 날짜에 표시할 카드 설정 배열
 */
export const groupAttendancesByDate = (
  attendances: AttendanceRes[],
  targetDate: string
): { attendance: AttendanceRes; cardConfig: CardDisplayConfig }[] => {
  const result: { attendance: AttendanceRes; cardConfig: CardDisplayConfig }[] = [];

  attendances.forEach(attendance => {
    const cardConfigs = processAttendanceForDisplay(attendance, targetDate);
    
    cardConfigs.forEach(cardConfig => {
      result.push({
        attendance,
        cardConfig,
      });
    });
  });

  // 카드 타입별 정렬 (normal > overnight-start > overnight-end > additional)
  result.sort((a, b) => {
    const order = { "normal": 0, "overnight-start": 1, "overnight-end": 2, "additional": 3 };
    return order[a.cardConfig.cardType] - order[b.cardConfig.cardType];
  });

  return result;
};

/**
 * 야간 근무 데이터 생성 (레거시 지원용)
 * @param attendance 출근 기록
 * @returns 야간 근무 데이터 또는 null
 */
export const createOvernightWorkData = (
  attendance: AttendanceRes
): OvernightWorkData | null => {
  const { scheduledStartTime, scheduledEndTime, workDate } = attendance;
  
  if (!isOvernightShift(scheduledStartTime, scheduledEndTime)) {
    return null;
  }

  const startDate = getOvernightStartDate(workDate, scheduledStartTime, scheduledEndTime);
  const endDate = getOvernightEndDate(workDate, scheduledStartTime, scheduledEndTime);

  return {
    originalAttendance: attendance,
    startDateCard: {
      cardType: "overnight-start",
      displayDate: startDate,
      title: "야간 근무 (시작)",
      subtitle: `${formatTime(scheduledStartTime)}부터 시작`,
      showTimeRange: false,
      isOvernightPart: true,
    },
    endDateCard: {
      cardType: "overnight-end",
      displayDate: endDate,
      title: "야간 근무 (종료)",
      subtitle: `${formatTime(scheduledEndTime)}까지`,
      showTimeRange: false,
      isOvernightPart: true,
    },
  };
};

/**
 * 특정 날짜에 표시할 모든 근무 카드 정보 반환
 * @param attendances 출근 기록 배열
 * @param date 표시할 날짜
 * @returns 카드 표시 정보 배열
 */
export const getCardsForDate = (
  attendances: AttendanceRes[],
  date: string
): { attendance: AttendanceRes; cardConfig: CardDisplayConfig }[] => {
  return groupAttendancesByDate(attendances, date);
};

/**
 * 출근 기록이 특정 날짜에 표시되어야 하는지 확인
 * @param attendance 출근 기록
 * @param targetDate 확인할 날짜
 * @returns 표시 여부
 */
export const shouldDisplayOnDate = (
  attendance: AttendanceRes,
  targetDate: string
): boolean => {
  const configs = processAttendanceForDisplay(attendance, targetDate);
  return configs.length > 0;
};

/**
 * 야간 근무의 전체 기간 반환 (시작일~종료일)
 * @param attendance 출근 기록
 * @returns 시작일과 종료일 배열
 */
export const getOvernightDateRange = (
  attendance: AttendanceRes
): string[] => {
  const { scheduledStartTime, scheduledEndTime, workDate } = attendance;
  
  if (!isOvernightShift(scheduledStartTime, scheduledEndTime)) {
    return [workDate];
  }

  const startDate = getOvernightStartDate(workDate, scheduledStartTime, scheduledEndTime);
  const endDate = getOvernightEndDate(workDate, scheduledStartTime, scheduledEndTime);

  return [startDate, endDate];
};