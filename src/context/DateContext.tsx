"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { isToday, isSameDay, isValidDate } from "@/utils/dateUtils";

// 날짜 네비게이션 상태 타입
interface DateNavigationState {
  currentDate: Date;
  selectedDate: Date;
  isLoadingDate: boolean;
  dateHistory: Date[];
  maxFutureDate?: Date;
  maxPastDate?: Date;
}

// 날짜 네비게이션 액션 타입
interface DateNavigationActions {
  setDate: (date: Date) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  goBack: () => void;
  goForward: () => void;
  canGoToPreviousDay: boolean;
  canGoToNextDay: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  resetToToday: () => void;
  setDateRange: (pastDate?: Date, futureDate?: Date) => void;
}

// 컨텍스트 타입
type DateNavigationContextType = DateNavigationState & DateNavigationActions;

// 프로바이더 props
interface DateNavigationProviderProps {
  children: ReactNode;
  initialDate?: Date;
  maxFutureDate?: Date;
  maxPastDate?: Date;
  onDateChange?: (date: Date) => void;
  persistSelection?: boolean;
}

// 로컬 스토리지 키
const STORAGE_KEY = "worksnap_selected_date";

// 컨텍스트 생성
const DateNavigationContext = createContext<DateNavigationContextType | undefined>(undefined);

// 날짜 검증 함수
const validateDate = (date: Date): boolean => {
  return isValidDate(date.toISOString()) && !isNaN(date.getTime());
};

// 날짜 범위 확인 함수
const isDateInRange = (date: Date, minDate?: Date, maxDate?: Date): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

// 로컬 스토리지에서 날짜 로드
const loadDateFromStorage = (): Date | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const date = new Date(stored);
      return validateDate(date) ? date : null;
    }
  } catch (error) {
    console.warn("날짜 로드 실패:", error);
  }
  return null;
};

// 로컬 스토리지에 날짜 저장
const saveDateToStorage = (date: Date): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, date.toISOString());
  } catch (error) {
    console.warn("날짜 저장 실패:", error);
  }
};

/**
 * 날짜 네비게이션 컨텍스트 프로바이더
 */
export const DateNavigationProvider: React.FC<DateNavigationProviderProps> = ({
  children,
  initialDate,
  maxFutureDate,
  maxPastDate,
  onDateChange,
  persistSelection = true,
}) => {
  // 초기 날짜 설정
  const getInitialDate = useCallback((): Date => {
    // 1. 전달된 초기 날짜 사용
    if (initialDate && validateDate(initialDate)) {
      return initialDate;
    }
    
    // 2. 로컬 스토리지에서 날짜 로드 (persistSelection이 true인 경우)
    if (persistSelection) {
      const storedDate = loadDateFromStorage();
      if (storedDate && isDateInRange(storedDate, maxPastDate, maxFutureDate)) {
        return storedDate;
      }
    }
    
    // 3. 기본값은 오늘 날짜
    return new Date();
  }, [initialDate, maxFutureDate, maxPastDate, persistSelection]);

  // 상태 관리
  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);
  const [isLoadingDate, setIsLoadingDate] = useState<boolean>(false);
  const [dateHistory, setDateHistory] = useState<Date[]>([getInitialDate()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{
    maxPastDate?: Date;
    maxFutureDate?: Date;
  }>({
    maxPastDate,
    maxFutureDate,
  });

  // 날짜 설정 함수
  const setDate = useCallback(
    async (newDate: Date) => {
      if (!validateDate(newDate)) {
        console.warn("유효하지 않은 날짜:", newDate);
        return;
      }

      if (!isDateInRange(newDate, dateRange.maxPastDate, dateRange.maxFutureDate)) {
        console.warn("허용되지 않는 날짜 범위:", newDate);
        return;
      }

      setIsLoadingDate(true);

      try {
        // 현재 날짜와 선택된 날짜 업데이트
        setCurrentDate(newDate);
        setSelectedDate(newDate);

        // 히스토리 관리
        setDateHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(newDate);
          return newHistory;
        });
        setHistoryIndex(prev => prev + 1);

        // 로컬 스토리지에 저장
        if (persistSelection) {
          saveDateToStorage(newDate);
        }

        // 콜백 실행
        if (onDateChange) {
          onDateChange(newDate);
        }

        // 약간의 로딩 시간 시뮬레이션 (UX 개선)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error("날짜 설정 중 오류:", error);
      } finally {
        setIsLoadingDate(false);
      }
    },
    [dateRange, historyIndex, onDateChange, persistSelection]
  );

  // 이전 날짜로 이동
  const goToPreviousDay = useCallback(() => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setDate(previousDay);
  }, [currentDate, setDate]);

  // 다음 날짜로 이동
  const goToNextDay = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setDate(nextDay);
  }, [currentDate, setDate]);

  // 오늘 날짜로 이동
  const goToToday = useCallback(() => {
    const today = new Date();
    setDate(today);
  }, [setDate]);

  // 뒤로 가기
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevDate = dateHistory[prevIndex];
      setCurrentDate(prevDate);
      setSelectedDate(prevDate);
      setHistoryIndex(prevIndex);
      
      if (onDateChange) {
        onDateChange(prevDate);
      }
    }
  }, [historyIndex, dateHistory, onDateChange]);

  // 앞으로 가기
  const goForward = useCallback(() => {
    if (historyIndex < dateHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextDate = dateHistory[nextIndex];
      setCurrentDate(nextDate);
      setSelectedDate(nextDate);
      setHistoryIndex(nextIndex);
      
      if (onDateChange) {
        onDateChange(nextDate);
      }
    }
  }, [historyIndex, dateHistory, onDateChange]);

  // 오늘로 리셋
  const resetToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setDateHistory([today]);
    setHistoryIndex(0);
    
    if (persistSelection) {
      saveDateToStorage(today);
    }
    
    if (onDateChange) {
      onDateChange(today);
    }
  }, [onDateChange, persistSelection]);

  // 날짜 범위 설정
  const setDateRangeHandler = useCallback((pastDate?: Date, futureDate?: Date) => {
    setDateRange({ maxPastDate: pastDate, maxFutureDate: futureDate });
    
    // 현재 날짜가 새로운 범위를 벗어나면 조정
    if (!isDateInRange(currentDate, pastDate, futureDate)) {
      const today = new Date();
      if (isDateInRange(today, pastDate, futureDate)) {
        setDate(today);
      } else if (futureDate && today > futureDate) {
        setDate(futureDate);
      } else if (pastDate && today < pastDate) {
        setDate(pastDate);
      }
    }
  }, [currentDate, setDate]);

  // 이동 가능 여부 계산
  const canGoToPreviousDay = useMemo(() => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    return isDateInRange(previousDay, dateRange.maxPastDate, dateRange.maxFutureDate);
  }, [currentDate, dateRange]);

  const canGoToNextDay = useMemo(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return isDateInRange(nextDay, dateRange.maxPastDate, dateRange.maxFutureDate);
  }, [currentDate, dateRange]);

  const canGoBack = useMemo(() => {
    return historyIndex > 0;
  }, [historyIndex]);

  const canGoForward = useMemo(() => {
    return historyIndex < dateHistory.length - 1;
  }, [historyIndex, dateHistory.length]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에서는 키보드 이벤트 무시
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.altKey) {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            if (canGoBack) goBack();
            break;
          case "ArrowRight":
            event.preventDefault();
            if (canGoForward) goForward();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [canGoBack, canGoForward, goBack, goForward]);

  // 컨텍스트 값
  const contextValue = useMemo<DateNavigationContextType>(() => ({
    // 상태
    currentDate,
    selectedDate,
    isLoadingDate,
    dateHistory,
    maxFutureDate: dateRange.maxFutureDate,
    maxPastDate: dateRange.maxPastDate,
    
    // 액션
    setDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    goBack,
    goForward,
    canGoToPreviousDay,
    canGoToNextDay,
    canGoBack,
    canGoForward,
    resetToToday,
    setDateRange: setDateRangeHandler,
  }), [
    currentDate,
    selectedDate,
    isLoadingDate,
    dateHistory,
    dateRange,
    setDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    goBack,
    goForward,
    canGoToPreviousDay,
    canGoToNextDay,
    canGoBack,
    canGoForward,
    resetToToday,
    setDateRangeHandler,
  ]);

  return (
    <DateNavigationContext.Provider value={contextValue}>
      {children}
    </DateNavigationContext.Provider>
  );
};

/**
 * 날짜 네비게이션 훅
 */
export const useDateNavigation = (): DateNavigationContextType => {
  const context = useContext(DateNavigationContext);
  if (!context) {
    throw new Error("useDateNavigation must be used within a DateNavigationProvider");
  }
  return context;
};

/**
 * 날짜 선택 상태 관리 훅
 */
export const useDateSelection = () => {
  const { currentDate, selectedDate, setDate } = useDateNavigation();
  
  const isSelected = useCallback((date: Date) => {
    return isSameDay(date, selectedDate);
  }, [selectedDate]);
  
  const isCurrentDate = useCallback((date: Date) => {
    return isSameDay(date, currentDate);
  }, [currentDate]);
  
  const isTodaySelected = useMemo(() => {
    return isToday(selectedDate);
  }, [selectedDate]);
  
  return {
    currentDate,
    selectedDate,
    setDate,
    isSelected,
    isCurrentDate,
    isTodaySelected,
  };
};

/**
 * 날짜 범위 관리 훅
 */
export const useDateRange = () => {
  const { maxPastDate, maxFutureDate, setDateRange } = useDateNavigation();
  
  const isDateInAllowedRange = useCallback((date: Date) => {
    return isDateInRange(date, maxPastDate, maxFutureDate);
  }, [maxPastDate, maxFutureDate]);
  
  const getDateRangeInfo = useMemo(() => {
    return {
      hasRange: !!(maxPastDate || maxFutureDate),
      minDate: maxPastDate,
      maxDate: maxFutureDate,
      rangeText: maxPastDate && maxFutureDate 
        ? `${maxPastDate.toLocaleDateString()} ~ ${maxFutureDate.toLocaleDateString()}`
        : maxPastDate
        ? `${maxPastDate.toLocaleDateString()} 이후`
        : maxFutureDate
        ? `${maxFutureDate.toLocaleDateString()} 이전`
        : "제한 없음",
    };
  }, [maxPastDate, maxFutureDate]);
  
  return {
    ...getDateRangeInfo,
    setDateRange,
    isDateInAllowedRange,
  };
};

/**
 * 날짜 히스토리 관리 훅
 */
export const useDateHistory = () => {
  const { dateHistory, canGoBack, canGoForward, goBack, goForward } = useDateNavigation();
  
  const getHistoryInfo = useMemo(() => {
    return {
      totalItems: dateHistory.length,
      canNavigateBack: canGoBack,
      canNavigateForward: canGoForward,
      historyDates: dateHistory.map(date => ({
        date,
        label: date.toLocaleDateString(),
        isToday: isToday(date),
      })),
    };
  }, [dateHistory, canGoBack, canGoForward]);
  
  return {
    ...getHistoryInfo,
    goBack,
    goForward,
  };
};