import { useState, useCallback } from "react";
import { AttendanceRes, SmartButtonState } from "../types";
import {
  calculateManualButtonState,
  getNextButtonOptionIndex,
} from "../utils";

/**
 * 수동 버튼 선택 훅
 * Single Responsibility: 사용자가 직접 선택하는 버튼 상태 관리만 담당
 */
export const useSmartButton = (attendance: AttendanceRes) => {
  // 선택된 버튼 옵션 인덱스
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 현재 선택된 버튼 상태 계산
  const currentButtonState = calculateManualButtonState(attendance, selectedIndex);

  // 다음 버튼 옵션으로 순환
  const cycleButtonOption = useCallback(() => {
    const nextIndex = getNextButtonOptionIndex(selectedIndex, attendance);
    setSelectedIndex(nextIndex);
  }, [selectedIndex, attendance]);

  // 특정 버튼 타입으로 직접 설정
  const setButtonType = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // 선택 인덱스 초기화
  const resetSelection = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  return {
    // 버튼 상태
    currentButtonState,
    selectedIndex,

    // 액션 함수
    cycleButtonOption,
    setButtonType,
    resetSelection,

    // 호환성을 위한 기본값 (기존 컴포넌트에서 사용될 수 있음)
    isManualSelection: true, // 항상 수동 모드
  };
};
