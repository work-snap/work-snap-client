"use client";

import React, { useState, useCallback, useEffect } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { useDateNavigation } from "@/context/DateContext";
import { formatDate, getDateLabel, isToday } from "@/utils/dateUtils";

interface DateNavigationProps {
  className?: string;
  showDateLabel?: boolean;
  showTodayButton?: boolean;
  onDateChange?: (date: Date) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * 날짜 네비게이션 컴포넌트
 * 사용자가 날짜를 앞뒤로 이동하거나 오늘로 돌아갈 수 있는 컴포넌트
 */
export const DateNavigation: React.FC<DateNavigationProps> = ({
  className = "",
  showDateLabel = true,
  showTodayButton = true,
  onDateChange,
  disabled = false,
  size = "md",
}) => {
  const {
    currentDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    canGoToPreviousDay,
    canGoToNextDay,
    isLoadingDate,
  } = useDateNavigation();

  // 날짜 변경 콜백 실행
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate);
    }
  }, [currentDate, onDateChange]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || isLoadingDate) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (canGoToPreviousDay) {
            goToPreviousDay();
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (canGoToNextDay) {
            goToNextDay();
          }
          break;
        case "Home":
          event.preventDefault();
          goToToday();
          break;
        case "t":
        case "T":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            goToToday();
          }
          break;
      }
    },
    [
      disabled,
      isLoadingDate,
      canGoToPreviousDay,
      canGoToNextDay,
      goToPreviousDay,
      goToNextDay,
      goToToday,
    ]
  );

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // 크기별 스타일 설정
  const getSizeStyles = (size: string) => {
    switch (size) {
      case "sm":
        return {
          container: "space-x-2",
          button: "px-3 py-1.5 text-sm",
          icon: "w-4 h-4",
          dateText: "text-sm",
        };
      case "lg":
        return {
          container: "space-x-4",
          button: "px-5 py-3 text-lg",
          icon: "w-6 h-6",
          dateText: "text-lg",
        };
      default: // md
        return {
          container: "space-x-3",
          button: "px-4 py-2 text-base",
          icon: "w-5 h-5",
          dateText: "text-base",
        };
    }
  };

  const sizeStyles = getSizeStyles(size);

  return (
    <div
      className={`flex items-center justify-center ${sizeStyles.container} ${className}`}
      role="navigation"
      aria-label="날짜 네비게이션"
    >
      {/* 이전 날짜 버튼 */}
      <BaseButton
        buttonState={{
          label: "",
          icon: (
            <svg
              className={sizeStyles.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          ),
          variant: "secondary",
          disabled: disabled || !canGoToPreviousDay || isLoadingDate,
        }}
        onClick={goToPreviousDay}
        className={`${sizeStyles.button} rounded-full aspect-square flex items-center justify-center`}
        title="이전 날짜 (←)"
        aria-label="이전 날짜로 이동"
      />

      {/* 현재 날짜 표시 */}
      {showDateLabel && (
        <div className="flex flex-col items-center min-w-0 flex-1">
          <div
            className={`font-semibold text-gray-800 ${sizeStyles.dateText} whitespace-nowrap`}
            role="text"
            aria-live="polite"
          >
            {getDateLabel(currentDate)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {formatDate(currentDate, { showYear: false, showWeekday: false })}
          </div>
        </div>
      )}

      {/* 오늘 버튼 */}
      {showTodayButton && (
        <BaseButton
          buttonState={{
            label: "오늘",
            variant: isToday(currentDate) ? "primary" : "secondary",
            disabled: disabled || isLoadingDate,
          }}
          onClick={goToToday}
          className={`${sizeStyles.button} min-w-0 flex-shrink-0`}
          title="오늘 날짜로 이동 (Ctrl/Cmd + T)"
          aria-label="오늘 날짜로 이동"
        />
      )}

      {/* 다음 날짜 버튼 */}
      <BaseButton
        buttonState={{
          label: "",
          icon: (
            <svg
              className={sizeStyles.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          ),
          variant: "secondary",
          disabled: disabled || !canGoToNextDay || isLoadingDate,
        }}
        onClick={goToNextDay}
        className={`${sizeStyles.button} rounded-full aspect-square flex items-center justify-center`}
        title="다음 날짜 (→)"
        aria-label="다음 날짜로 이동"
      />
    </div>
  );
};

/**
 * 간단한 날짜 네비게이션 컴포넌트 (컴팩트 버전)
 */
export const CompactDateNavigation: React.FC<{
  className?: string;
  onDateChange?: (date: Date) => void;
}> = ({ className = "", onDateChange }) => {
  return (
    <DateNavigation
      className={className}
      showDateLabel={true}
      showTodayButton={false}
      onDateChange={onDateChange}
      size="sm"
    />
  );
};

/**
 * 날짜 네비게이션 헤더 컴포넌트
 */
export const DateNavigationHeader: React.FC<{
  title?: string;
  subtitle?: string;
  className?: string;
  onDateChange?: (date: Date) => void;
}> = ({ title, subtitle, className = "", onDateChange }) => {
  const { currentDate } = useDateNavigation();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {title && (
            <h1 className="text-xl font-semibold text-gray-900 mb-1">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        
        <div className="flex-shrink-0">
          <DateNavigation
            onDateChange={onDateChange}
            size="md"
            className="bg-gray-50 rounded-lg px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 날짜 퀵 선택 컴포넌트
 */
export const DateQuickSelect: React.FC<{
  className?: string;
  onDateChange?: (date: Date) => void;
}> = ({ className = "", onDateChange }) => {
  const { currentDate, setDate } = useDateNavigation();

  const quickDateOptions = [
    {
      label: "어제",
      getValue: () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date;
      },
    },
    {
      label: "오늘",
      getValue: () => new Date(),
    },
    {
      label: "내일",
      getValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      },
    },
    {
      label: "이번 주 시작",
      getValue: () => {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
      },
    },
  ];

  const handleQuickSelect = (getDate: () => Date) => {
    const newDate = getDate();
    setDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {quickDateOptions.map((option, index) => {
        const optionDate = option.getValue();
        const isSelected = 
          optionDate.toDateString() === currentDate.toDateString();
        
        return (
          <BaseButton
            key={index}
            buttonState={{
              label: option.label,
              variant: isSelected ? "primary" : "secondary",
            }}
            onClick={() => handleQuickSelect(option.getValue)}
            className="text-sm px-3 py-1.5"
          />
        );
      })}
    </div>
  );
};

/**
 * 날짜 네비게이션 상태 표시 컴포넌트
 */
export const DateNavigationStatus: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { currentDate, isLoadingDate } = useDateNavigation();

  if (isLoadingDate) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin h-4 w-4 border-2 border-main border-t-transparent rounded-full" />
        <span className="text-sm text-gray-600">날짜 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span>선택된 날짜: {formatDate(currentDate)}</span>
    </div>
  );
};