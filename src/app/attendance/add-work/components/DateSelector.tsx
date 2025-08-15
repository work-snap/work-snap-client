"use client";

import { DatePicker } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";

interface DateSelectorProps {
  date: string; // yyyy-MM-dd
  onChange: (value: string) => void;
}

export default function DateSelector({ date, onChange }: DateSelectorProps) {
  // Convert string date to CalendarDate for HeroUI
  const calendarDate = parseDate(date);

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
      />
    </div>
  );
}
