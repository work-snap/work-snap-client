"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { ko } from "date-fns/locale";

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange,
  className = "",
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onDateChange(addDays(selectedDate, 1));
    }
    if (isRightSwipe) {
      onDateChange(subDays(selectedDate, 1));
    }
  };

  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  return (
    <div
      className={`relative flex items-center justify-center gap-4 ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={handlePrevDay}
        className="p-2 text-gray3 hover:text-gray4 transition-colors"
      >
        ←
      </button>

      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="px-4 py-2 text-lg font-medium text-main2 hover:text-main transition-colors"
      >
        {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
      </button>

      <button
        onClick={handleNextDay}
        className="p-2 text-gray3 hover:text-gray4 transition-colors"
      >
        →
      </button>

      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute top-full mt-2 p-4 bg-white rounded-lg shadow-lg z-10"
        >
          {/* Calendar implementation will be added here */}
          <div className="text-sm text-gray3">
            달력 기능은 추후 구현 예정입니다.
          </div>
        </div>
      )}
    </div>
  );
};

export default DateNavigation;
