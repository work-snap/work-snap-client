"use client";

import React from "react";
import {
  AttendanceType,
  ATTENDANCE_TYPE_OPTIONS,
} from "../develop-test/lib/types";

interface AttendanceTypeSelectorProps {
  selectedType: AttendanceType | null;
  onTypeSelect: (type: AttendanceType | null) => void;
  className?: string;
}

export default function AttendanceTypeSelector({
  selectedType,
  onTypeSelect,
  className = "",
}: AttendanceTypeSelectorProps) {
  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        출근 타입 선택 (선택사항)
      </label>

      <div className="grid grid-cols-2 gap-2">
        {/* 자동 계산 옵션 */}
        <button
          type="button"
          onClick={() => onTypeSelect(null)}
          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
            selectedType === null
              ? "border-main bg-main/10 text-main"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="text-center">
            <div className="text-lg mb-1">⚡</div>
            <div>자동 계산</div>
          </div>
        </button>

        {/* 출근 타입 옵션들 */}
        {ATTENDANCE_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onTypeSelect(option.value)}
            className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
              selectedType === option.value
                ? "border-main bg-main/10 text-main"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">
                {getAttendanceTypeIcon(option.value)}
              </div>
              <div>{option.label}</div>
            </div>
          </button>
        ))}
      </div>

      {selectedType && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">
              {
                ATTENDANCE_TYPE_OPTIONS.find(
                  (opt) => opt.value === selectedType
                )?.label
              }
            </span>
            로 출근 처리됩니다.
          </p>
        </div>
      )}

      {selectedType === null && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            예정 시간과 실제 출근 시간을 비교하여 자동으로 계산됩니다.
          </p>
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
