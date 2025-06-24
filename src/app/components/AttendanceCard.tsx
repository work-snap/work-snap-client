"use client";

import React, { useState } from "react";
import {
  AttendanceType,
  AttendanceRes,
  ClockInReq,
  ATTENDANCE_TYPE_OPTIONS,
} from "../develop-test/lib/types";
import { testApis } from "../develop-test/lib/api";

interface AttendanceCardProps {
  attendance: AttendanceRes;
  onUpdate?: () => void;
}

export default function AttendanceCard({
  attendance,
  onUpdate,
}: AttendanceCardProps) {
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [selectedAttendanceType, setSelectedAttendanceType] =
    useState<AttendanceType | null>("EARLY_ARRIVAL");

  // 출근 타입 순환 변경
  const handleTypeChipClick = () => {
    const typeOptions = [
      null,
      ...ATTENDANCE_TYPE_OPTIONS.map((opt) => opt.value),
    ];
    const currentIndex = typeOptions.indexOf(selectedAttendanceType);
    const nextIndex = (currentIndex + 1) % typeOptions.length;
    setSelectedAttendanceType(typeOptions[nextIndex]);
  };

  // 선택된 타입 정보 가져오기
  const getSelectedTypeInfo = () => {
    if (!selectedAttendanceType) {
      return {
        label: "자동 계산",
        icon: "⚡",
        color: "bg-gray-100 text-gray-700",
      };
    }

    const typeOption = ATTENDANCE_TYPE_OPTIONS.find(
      (opt) => opt.value === selectedAttendanceType
    );
    return {
      label: typeOption?.label || "자동 계산",
      icon: getAttendanceTypeIcon(selectedAttendanceType),
      color: "bg-orange-100 text-orange-700 border-orange-200",
    };
  };

  const handleClockIn = async () => {
    setIsClockingIn(true);

    try {
      const clockInData: ClockInReq = {
        actualTime: undefined, // 현재 시간 사용
        notes: selectedAttendanceType
          ? `${getTypeName(selectedAttendanceType)} 출근`
          : undefined,
        manualAttendanceType: selectedAttendanceType || undefined,
      };

      await testApis.attendance.clockIn(attendance.id, clockInData);

      // 성공 시 부모 컴포넌트에 업데이트 알림
      onUpdate?.();

      const selectedTypeInfo = getSelectedTypeInfo();
      alert(`${selectedTypeInfo.label}로 출근 처리되었습니다!`);
    } catch (error) {
      console.error("출근 처리 실패:", error);
      alert("출근 처리에 실패했습니다.");
    } finally {
      setIsClockingIn(false);
    }
  };

  const getTypeName = (type: AttendanceType) => {
    const typeMap = {
      NORMAL: "정상출근",
      EARLY_ARRIVAL: "조기출근",
      LATE_DEPARTURE: "연장근무",
      EARLY_DEPARTURE: "조퇴",
      ADDITIONAL_WORK: "추가근무",
    };
    return typeMap[type];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedTypeInfo = getSelectedTypeInfo();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4 max-w-md mx-auto relative">
      {/* 출근 타입 칩 (오른쪽 위) */}
      {attendance.status === "SCHEDULED" && (
        <button
          onClick={handleTypeChipClick}
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium 
            border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95
            ${selectedTypeInfo.color}`}
        >
          <span className="mr-1">{selectedTypeInfo.icon}</span>
          {selectedTypeInfo.label}
        </button>
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4 pr-20">
        <h2 className="text-xl font-bold text-main2">
          {attendance.isAdditionalWork ? "추가 근무" : "스타벅스 해운대점"}
        </h2>
        {attendance.status !== "SCHEDULED" && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              attendance.status
            )}`}
          >
            {attendance.statusKorean}
          </span>
        )}
      </div>

      {/* 출근 전 상태 표시 */}
      {attendance.status === "SCHEDULED" && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center text-gray-600 mb-4">
            <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm mr-2">
              ⏰
            </span>
            아직 출근 전입니다.
          </div>
        </div>
      )}

      {/* 시간 정보 */}
      <div className="flex justify-between items-center mb-8">
        {/* 시작 시간 */}
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-1">
            {attendance.workDate}
          </div>
          <div className="text-4xl font-bold text-main2">
            {attendance.scheduledStartTime}
          </div>
          {attendance.actualStartTime && (
            <div className="text-blue-600 text-sm mt-1">
              현재시각 {attendance.actualStartTime}
            </div>
          )}
        </div>

        {/* 종료 시간 */}
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-1">
            {attendance.workDate}
          </div>
          <div className="text-4xl font-bold text-main2">
            {attendance.scheduledEndTime}
          </div>
          {attendance.actualEndTime && (
            <div className="text-green-600 text-sm mt-1">
              실제 {attendance.actualEndTime}
            </div>
          )}
        </div>
      </div>

      {/* 출근 타입 정보 표시 */}
      {attendance.attendanceTypesKorean &&
        attendance.status !== "SCHEDULED" && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-center">
              <span className="text-blue-700 font-medium">
                {attendance.attendanceTypesKorean}
              </span>
            </div>
          </div>
        )}

      {/* 출근 버튼 (예정 상태일 때만 표시) */}
      {attendance.status === "SCHEDULED" && (
        <div className="space-y-3">
          {/* 선택된 타입 미리보기 */}
          <div className="text-center text-sm text-gray-600">
            <span className="font-medium">{selectedTypeInfo.label}</span> 모드로
            출근 처리됩니다
          </div>

          {/* 출근 버튼 */}
          <button
            onClick={handleClockIn}
            disabled={isClockingIn}
            className="w-full bg-main text-white font-bold py-4 px-6 rounded-2xl 
              shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50
              disabled:cursor-not-allowed"
          >
            {isClockingIn ? "출근 처리 중..." : "출근하기"}
          </button>
        </div>
      )}

      {/* 메모 */}
      {attendance.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">메모:</span> {attendance.notes}
          </p>
        </div>
      )}

      {/* 야간 근무 표시 */}
      {attendance.isOvernightWork && (
        <div className="mt-3 flex items-center justify-center text-sm text-purple-600">
          <span className="mr-1">🌙</span>
          야간 근무
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
