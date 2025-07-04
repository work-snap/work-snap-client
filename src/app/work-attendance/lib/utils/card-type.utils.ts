import {
  AttendanceRes,
  CardType,
  CardDisplayConfig,
} from "../types";
import {
  isOvernightShift,
  getOvernightDisplayInfo,
  formatTime,
} from "./time.utils";

/**
 * 출근 기록으로부터 카드 타입 결정
 * @param attendance 출근 기록
 * @param targetDate 표시할 날짜 (선택사항)
 * @returns 카드 타입
 */
export const determineCardType = (
  attendance: AttendanceRes,
  targetDate?: string
): CardType => {
  // 추가 근무인 경우
  if (attendance.isAdditionalWork) {
    return "additional";
  }

  // 야간 근무 확인
  const { scheduledStartTime, scheduledEndTime, workDate } = attendance;
  const isOvernight = isOvernightShift(scheduledStartTime, scheduledEndTime);

  if (!isOvernight) {
    return "normal";
  }

  // 야간 근무이고 특정 날짜가 지정된 경우
  if (targetDate) {
    const displayInfo = getOvernightDisplayInfo(
      targetDate,
      workDate,
      scheduledStartTime,
      scheduledEndTime
    );
    
    return displayInfo.cardType || "normal";
  }

  // 기본적으로 야간 근무 시작으로 간주
  return "overnight-start";
};

/**
 * 카드 타입에 따른 기본 설정 반환
 * @param cardType 카드 타입
 * @param attendance 출근 기록
 * @returns 카드 표시 설정
 */
export const getCardDisplayConfig = (
  cardType: CardType,
  attendance: AttendanceRes,
  displayDate: string
): CardDisplayConfig => {
  const { scheduledStartTime, scheduledEndTime } = attendance;

  switch (cardType) {
    case "normal":
      return {
        cardType: "normal",
        displayDate,
        title: "정규 근무",
        subtitle: `${formatTime(scheduledStartTime)} - ${formatTime(scheduledEndTime)}`,
        showTimeRange: true,
        isOvernightPart: false,
      };

    case "additional":
      return {
        cardType: "additional",
        displayDate,
        title: "추가 근무",
        subtitle: `${formatTime(scheduledStartTime)} - ${formatTime(scheduledEndTime)}`,
        showTimeRange: true,
        isOvernightPart: false,
      };

    case "overnight-start":
      return {
        cardType: "overnight-start",
        displayDate,
        title: "야간 근무 (시작)",
        subtitle: `${formatTime(scheduledStartTime)}부터 시작`,
        showTimeRange: false,
        isOvernightPart: true,
      };

    case "overnight-end":
      return {
        cardType: "overnight-end",
        displayDate,
        title: "야간 근무 (종료)",
        subtitle: `${formatTime(scheduledEndTime)}까지`,
        showTimeRange: false,
        isOvernightPart: true,
      };

    default:
      return {
        cardType: "normal",
        displayDate,
        title: "근무",
        subtitle: `${formatTime(scheduledStartTime)} - ${formatTime(scheduledEndTime)}`,
        showTimeRange: true,
        isOvernightPart: false,
      };
  }
};

/**
 * 카드 타입별 CSS 클래스 반환
 * @param cardType 카드 타입
 * @returns CSS 클래스 문자열
 */
export const getCardTypeClassName = (cardType: CardType): string => {
  const baseClasses = "rounded-2xl p-6 shadow-sm border";

  switch (cardType) {
    case "normal":
      return `${baseClasses} bg-white border-gray-200`;
    
    case "additional":
      return `${baseClasses} bg-purple-50 border-purple-200`;
    
    case "overnight-start":
      return `${baseClasses} bg-indigo-50 border-indigo-200`;
    
    case "overnight-end":
      return `${baseClasses} bg-orange-50 border-orange-200`;
    
    default:
      return `${baseClasses} bg-white border-gray-200`;
  }
};

/**
 * 카드 타입별 아이콘 반환
 * @param cardType 카드 타입
 * @returns 아이콘 문자열
 */
export const getCardTypeIcon = (cardType: CardType): string => {
  switch (cardType) {
    case "normal":
      return "🏢";
    case "additional":
      return "⚡";
    case "overnight-start":
      return "🌙";
    case "overnight-end":
      return "🌅";
    default:
      return "📋";
  }
};

/**
 * 카드 타입별 제목 색상 반환
 * @param cardType 카드 타입
 * @returns Tailwind 색상 클래스
 */
export const getCardTypeTitleColor = (cardType: CardType): string => {
  switch (cardType) {
    case "normal":
      return "text-main2";
    case "additional":
      return "text-purple-700";
    case "overnight-start":
      return "text-indigo-700";
    case "overnight-end":
      return "text-orange-700";
    default:
      return "text-gray-700";
  }
};

/**
 * 카드가 액션 가능한지 확인
 * @param cardType 카드 타입
 * @param attendance 출근 기록
 * @returns 액션 가능 여부
 */
export const isCardActionable = (
  cardType: CardType,
  attendance: AttendanceRes
): boolean => {
  // 완료된 근무는 액션 불가
  if (attendance.status === "COMPLETED") {
    return false;
  }

  // 야간 근무 종료 카드는 진행 중일 때만 액션 가능
  if (cardType === "overnight-end" && attendance.status !== "IN_PROGRESS") {
    return false;
  }

  return true;
};

/**
 * 카드 우선순위 반환 (정렬용)
 * @param cardType 카드 타입
 * @returns 우선순위 숫자 (낮을수록 우선)
 */
export const getCardTypePriority = (cardType: CardType): number => {
  switch (cardType) {
    case "normal":
      return 1;
    case "overnight-start":
      return 2;
    case "overnight-end":
      return 3;
    case "additional":
      return 4;
    default:
      return 999;
  }
};

/**
 * 렌더링 조건 확인
 * @param attendance 출근 기록
 * @param cardType 카드 타입
 * @param targetDate 표시할 날짜
 * @returns 렌더링 여부
 */
export const shouldRenderCard = (
  attendance: AttendanceRes,
  cardType: CardType,
  targetDate: string
): boolean => {
  // 추가 근무는 해당 날짜에만 표시
  if (attendance.isAdditionalWork) {
    return attendance.workDate === targetDate && cardType === "additional";
  }

  // 일반 근무는 해당 날짜에만 표시
  if (cardType === "normal") {
    return attendance.workDate === targetDate && 
           !isOvernightShift(attendance.scheduledStartTime, attendance.scheduledEndTime);
  }

  // 야간 근무 처리
  if (cardType === "overnight-start" || cardType === "overnight-end") {
    const displayInfo = getOvernightDisplayInfo(
      targetDate,
      attendance.workDate,
      attendance.scheduledStartTime,
      attendance.scheduledEndTime
    );
    
    return displayInfo.shouldDisplay && displayInfo.cardType === cardType;
  }

  return false;
};