"use client";

import React, { useState } from "react";
import {
  AttendanceType,
  ATTENDANCE_TYPE_OPTIONS,
} from "../develop-test/lib/types";

interface ClockInButtonProps {
  onClockIn: (attendanceType: AttendanceType | null) => void;
  isLoading?: boolean;
  className?: string;
}

export default function ClockInButton({
  onClockIn,
  isLoading = false,
  className = "",
}: ClockInButtonProps) {
  const [selectedType, setSelectedType] = useState<AttendanceType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleQuickClockIn = (type: AttendanceType | null) => {
    setSelectedType(type);
    onClockIn(type);
  };

  const mainClockInOptions = [
    {
      type: null as AttendanceType | null,
      label: "출근하기",
      icon: "⏰",
      color: "bg-main",
    },
    {
      type: "EARLY_ARRIVAL" as AttendanceType,
      label: "조기출근",
      icon: "🌅",
      color: "bg-blue-500",
    },
  ];

  return (
    <div className={`${className}`}>
      {/* 메인 출근 버튼들 */}
      <div className="flex gap-3 mb-4">
        {mainClockInOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleQuickClockIn(option.type)}
            disabled={isLoading}
            className={`flex-1 ${option.color} text-white font-bold py-4 px-6 rounded-2xl 
              shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50
              disabled:cursor-not-allowed`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-lg">{option.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* 더 많은 옵션 버튼 */}
      <button
        onClick={() => setShowTypeSelector(!showTypeSelector)}
        className="w-full text-gray-600 text-sm py-2 border border-gray-300 rounded-lg
          hover:bg-gray-50 transition-colors"
      >
        {showTypeSelector ? "옵션 접기" : "다른 출근 타입 선택"}
      </button>

      {/* 추가 출근 타입 선택기 */}
      {showTypeSelector && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            {ATTENDANCE_TYPE_OPTIONS.filter(
              (opt) => opt.value !== "EARLY_ARRIVAL"
            ).map((option) => (
              <button
                key={option.value}
                onClick={() => handleQuickClockIn(option.value)}
                disabled={isLoading}
                className="p-3 bg-white border border-gray-200 rounded-lg text-sm
                  hover:border-main hover:bg-main/5 transition-colors disabled:opacity-50"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">
                    {getAttendanceTypeIcon(option.value)}
                  </div>
                  <div className="font-medium">{option.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 타입 표시 */}
      {selectedType && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            <span className="font-medium">
              {selectedType
                ? ATTENDANCE_TYPE_OPTIONS.find(
                    (opt) => opt.value === selectedType
                  )?.label
                : "자동 계산"}
            </span>{" "}
            모드로 출근 처리됩니다
          </p>
        </div>
      )}

      {isLoading && (
        <div className="mt-3 p-2 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">출근 처리 중...</p>
        </div>
      )}
    </div>
  );
}

// 출근 타입별 아이콘
function getAttendanceTypeIcon(type: AttendanceType): string {
  switch (type) {
    case "NORMAL":
      return "✅";
    case "EARLY_ARRIVAL":
      return "🌅";
    case "LATE_DEPARTURE":
      return "🌙";
    case "EARLY_DEPARTURE":
      return "🏃‍♂️";
    case "ADDITIONAL_WORK":
      return "💪";
    default:
      return "⏰";
  }
}
