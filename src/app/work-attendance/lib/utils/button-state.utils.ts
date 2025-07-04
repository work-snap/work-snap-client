import {
  AttendanceRes,
  SmartButtonState,
  ButtonOption,
  ClockInType,
  ClockOutType,
  AttendanceStatus,
  ContextButtonState,
  ContextButtonConfig,
  CardType,
} from "../types";
import { getCurrentMinutes, timeToMinutes } from "./time.utils";

/**
 * 버튼 옵션 정의 (기획서에 따른 설정)
 */
export const BUTTON_OPTIONS = {
  CLOCK_IN: [
    {
      type: ClockInType.NORMAL,
      label: "출근하기",
      icon: "🏢",
      color: "bg-main",
    },
    {
      type: ClockInType.EARLY_ARRIVAL,
      label: "조기출근하기",
      icon: "⏰",
      color: "bg-blue-500",
    },
  ] as ButtonOption[],

  CLOCK_OUT: [
    {
      type: ClockOutType.NORMAL,
      label: "퇴근하기",
      icon: "🏠",
      color: "bg-green-500",
    },
    {
      type: ClockOutType.EARLY_DEPARTURE,
      label: "조퇴하기",
      icon: "🚪",
      color: "bg-orange-500",
    },
    {
      type: ClockOutType.LATE_DEPARTURE,
      label: "연장근무 종료",
      icon: "⏰",
      color: "bg-red-500",
    },
  ] as ButtonOption[],
} as const;

/**
 * 임계값 설정 (기획서 기준)
 */
export const TIME_THRESHOLDS = {
  EARLY_ARRIVAL: 15, // 15분 전까지 조기출근
  EARLY_DEPARTURE: 30, // 30분 전까지 조퇴
  OVERTIME: 10, // 10분 후부터 연장근무
} as const;

// AI 추천 기능 제거됨 - 모든 버튼 선택은 수동으로 처리

/**
 * 수동 선택 버튼 상태 계산
 * @param attendance 출근 기록
 * @param selectedIndex 선택된 옵션 인덱스
 * @returns 수동 선택 버튼 상태
 */
export const calculateManualButtonState = (
  attendance: AttendanceRes,
  selectedIndex: number
): SmartButtonState => {
  const action =
    attendance.status === AttendanceStatus.SCHEDULED ? "CLOCK_IN" : "CLOCK_OUT";
  const options = BUTTON_OPTIONS[action];
  const selectedOption = options[selectedIndex] || options[0];

  return {
    ...selectedOption,
    action,
    variant: getVariantFromType(selectedOption.type),
    isRecommended: false, // AI 추천 기능 제거됨
  };
};

/**
 * 타입에 따른 variant 반환
 * @param type 출근/퇴근 타입
 * @returns variant 문자열
 */
const getVariantFromType = (
  type: ClockInType | ClockOutType
): "default" | "early" | "late" | "overtime" => {
  switch (type) {
    case ClockInType.EARLY_ARRIVAL:
    case ClockOutType.EARLY_DEPARTURE:
      return "early";
    case ClockOutType.LATE_DEPARTURE:
      return "overtime";
    default:
      return "default";
  }
};

/**
 * 기본 버튼 상태 반환 (완료된 상태 등)
 * @param attendance 출근 기록
 * @returns 기본 버튼 상태
 */
export const getDefaultButtonState = (attendance: AttendanceRes): SmartButtonState => {
  if (attendance.status === AttendanceStatus.COMPLETED) {
    return {
      action: "CLOCK_OUT",
      type: ClockOutType.NORMAL,
      label: "업무 완료",
      icon: "✅",
      color: "bg-gray-400",
      variant: "default",
      isRecommended: false,
    };
  }

  // 기본 출근 상태 (첫 번째 옵션을 기본값으로)
  const action = attendance.status === AttendanceStatus.SCHEDULED ? "CLOCK_IN" : "CLOCK_OUT";
  const options = BUTTON_OPTIONS[action];
  const defaultOption = options[0];

  return {
    ...defaultOption,
    action,
    variant: getVariantFromType(defaultOption.type),
    isRecommended: false,
  };
};

/**
 * 다음 버튼 옵션 인덱스 계산
 * @param currentIndex 현재 인덱스
 * @param attendance 출근 기록
 * @returns 다음 인덱스
 */
export const getNextButtonOptionIndex = (
  currentIndex: number,
  attendance: AttendanceRes
): number => {
  const action =
    attendance.status === AttendanceStatus.SCHEDULED ? "CLOCK_IN" : "CLOCK_OUT";
  const options = BUTTON_OPTIONS[action];
  return (currentIndex + 1) % options.length;
};

/**
 * 버튼 상태에 따른 CSS 클래스 반환
 * @param buttonState 버튼 상태
 * @param isLoading 로딩 상태
 * @returns CSS 클래스 문자열
 */
export const getButtonClassName = (
  buttonState: SmartButtonState,
  isLoading: boolean = false
): string => {
  const baseClasses =
    "w-full py-4 px-4 rounded-lg font-medium text-white transition-all duration-200";

  if (isLoading) {
    return `${baseClasses} bg-gray-400 cursor-not-allowed`;
  }

  return `${baseClasses} ${buttonState.color} hover:opacity-90 active:scale-95`;
};

/**
 * 버튼 타입에 따른 칩 스타일 반환 (AI 추천 기능 제거됨)
 * @param variant 버튼 variant
 * @returns CSS 클래스 문자열
 */
export const getChipClassName = (variant: "default" | "early" | "late" | "overtime"): string => {
  const baseClasses =
    "px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 active:scale-95";

  switch (variant) {
    case "early":
      return `${baseClasses} bg-blue-100 text-blue-700 border-blue-200`;
    case "late":
    case "overtime":
      return `${baseClasses} bg-orange-100 text-orange-700 border-orange-200`;
    default:
      return `${baseClasses} bg-green-100 text-green-700 border-green-200`;
  }
};

/**
 * 상황별 버튼 설정 (우측 버튼)
 */
export const CONTEXT_BUTTON_CONFIGS: ContextButtonConfig = {
  normal: {
    [AttendanceStatus.SCHEDULED]: {
      label: "조기출근",
      icon: "⏰",
      color: "bg-blue-500",
      type: ClockInType.EARLY_ARRIVAL,
      disabled: false,
    },
    [AttendanceStatus.IN_PROGRESS]: {
      label: "퇴근하기",
      icon: "🏠",
      color: "bg-green-500",
      type: ClockOutType.NORMAL,
      disabled: false,
    },
    [AttendanceStatus.COMPLETED]: {
      label: "완료됨",
      icon: "✅",
      color: "bg-gray-400",
      type: null,
      disabled: true,
    },
  },
  additional: {
    [AttendanceStatus.SCHEDULED]: {
      label: "추가근무 시작",
      icon: "⚡",
      color: "bg-purple-500",
      type: ClockInType.NORMAL,
      disabled: false,
    },
    [AttendanceStatus.IN_PROGRESS]: {
      label: "추가근무 종료",
      icon: "🏁",
      color: "bg-purple-600",
      type: ClockOutType.NORMAL,
      disabled: false,
    },
    [AttendanceStatus.COMPLETED]: {
      label: "추가근무 완료",
      icon: "✅",
      color: "bg-gray-400",
      type: null,
      disabled: true,
    },
  },
  "overnight-start": {
    [AttendanceStatus.SCHEDULED]: {
      label: "야간근무 시작",
      icon: "🌙",
      color: "bg-indigo-500",
      type: ClockInType.NORMAL,
      disabled: false,
    },
    [AttendanceStatus.IN_PROGRESS]: {
      label: "진행중",
      icon: "⏳",
      color: "bg-blue-500",
      type: null,
      disabled: true,
    },
    [AttendanceStatus.COMPLETED]: {
      label: "시작 완료",
      icon: "✅",
      color: "bg-gray-400",
      type: null,
      disabled: true,
    },
  },
  "overnight-end": {
    [AttendanceStatus.SCHEDULED]: {
      label: "대기중",
      icon: "⏳",
      color: "bg-gray-400",
      type: null,
      disabled: true,
    },
    [AttendanceStatus.IN_PROGRESS]: {
      label: "야간근무 종료",
      icon: "🌅",
      color: "bg-orange-500",
      type: ClockOutType.NORMAL,
      disabled: false,
    },
    [AttendanceStatus.COMPLETED]: {
      label: "야간근무 완료",
      icon: "✅",
      color: "bg-gray-400",
      type: null,
      disabled: true,
    },
  },
};

/**
 * 상황별 버튼 상태 계산
 * @param attendance 출근 기록
 * @param cardType 카드 타입
 * @returns 상황별 버튼 상태
 */
export const calculateContextButtonState = (
  attendance: AttendanceRes,
  cardType: CardType = "normal"
): ContextButtonState => {
  const configKey = attendance.isAdditionalWork ? "additional" : cardType;
  const statusConfig = CONTEXT_BUTTON_CONFIGS[configKey]?.[attendance.status];

  if (!statusConfig) {
    return getDefaultContextState();
  }

  const action = statusConfig.disabled
    ? "DISABLED"
    : statusConfig.type && Object.values(ClockInType).includes(statusConfig.type as ClockInType)
    ? "CLOCK_IN"
    : "CLOCK_OUT";

  return {
    action,
    type: statusConfig.type,
    label: statusConfig.label,
    icon: statusConfig.icon,
    color: statusConfig.color,
    disabled: statusConfig.disabled,
    variant: getContextVariantFromType(statusConfig.type, cardType),
  };
};

/**
 * 기본 상황별 버튼 상태
 */
const getDefaultContextState = (): ContextButtonState => ({
  action: "DISABLED",
  type: null,
  label: "이용불가",
  icon: "⚠️",
  color: "bg-gray-400",
  disabled: true,
  variant: "completed",
});

/**
 * 타입에 따른 상황별 버튼 variant 반환
 */
const getContextVariantFromType = (
  type: ClockInType | ClockOutType | null,
  cardType: CardType
): "early" | "normal" | "late" | "additional" | "completed" => {
  if (!type) return "completed";
  
  if (cardType === "additional") return "additional";
  
  switch (type) {
    case ClockInType.EARLY_ARRIVAL:
    case ClockOutType.EARLY_DEPARTURE:
      return "early";
    case ClockOutType.LATE_DEPARTURE:
      return "late";
    default:
      return "normal";
  }
};

/**
 * 상황별 버튼 CSS 클래스 반환
 */
export const getContextButtonClassName = (
  contextState: ContextButtonState,
  size: "sm" | "md" = "sm"
): string => {
  const sizeClasses = size === "sm" 
    ? "px-3 py-2 text-sm" 
    : "px-4 py-3 text-base";
    
  const baseClasses = `${sizeClasses} rounded-lg font-medium text-white transition-all duration-200 whitespace-nowrap`;

  if (contextState.disabled) {
    return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
  }

  return `${baseClasses} ${contextState.color} hover:opacity-90 active:scale-95`;
};
