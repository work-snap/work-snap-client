"use client";

import { DatePicker } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";

interface DateSelectorProps {
  date: string; // yyyy-MM-dd
  onChange: (value: string) => void;
}

export default function DateSelector({ date, onChange }: DateSelectorProps) {
  // 날짜 형식 검증 및 기본값 설정
  const getValidDate = (dateString: string): string => {
    // ISO 8601 형식 검증 (YYYY-MM-DD)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateRegex.test(dateString)) {
      return dateString;
    }
    
    // 잘못된 형식인 경우 오늘 날짜 반환
    console.warn(`Invalid date format: ${dateString}, using today's date`);
    return new Date().toISOString().split('T')[0];
  };

  const validDate = getValidDate(date);
  
  // Convert string date to CalendarDate for HeroUI
  const calendarDate = parseDate(validDate);

  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      // Convert CalendarDate back to yyyy-MM-dd string
      const formattedDate = `${newDate.year}-${String(newDate.month).padStart(
        2,
        "0"
      )}-${String(newDate.day).padStart(2, "0")}`;
      onChange(formattedDate);
    }
  };

  return (
    <div>
      <div className="text-[15px] font-bold mb-2">날짜</div>
      <DatePicker
        value={calendarDate}
        onChange={handleDateChange}
        label="날짜 선택"
        aria-label="날짜 선택"
        showMonthAndYearPickers
        granularity="day"
        disableAnimation={true}
        classNames={{
          base: "w-full",
          inputWrapper: "border-2 border-default-200 hover:border-default-300 rounded-xl bg-transparent",
          input: "h-14",
          popoverContent: "rounded-xl shadow-lg"
        }}
      />
    </div>
  );
}
