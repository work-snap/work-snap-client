"use client";

import React from "react";
import AttendanceCard from "../../components/AttendanceCard";
import { AttendanceRes } from "../lib/types";

export default function AttendanceCardExample() {
  const sampleAttendance: AttendanceRes = {
    id: 1,
    workScheduleId: 1,
    userId: 1,
    workplaceId: 1,
    workDate: "6월 24일",
    scheduledStartTime: "09:00",
    scheduledEndTime: "15:00",
    actualStartTime: undefined,
    actualEndTime: undefined,
    attendanceTypes: [],
    attendanceTypesKorean: "",
    status: "SCHEDULED",
    statusKorean: "예정",
    isAdditionalWork: false,
    isOvernightWork: false,
    scheduledWorkingMinutes: 360,
    actualWorkingMinutes: undefined,
    notes: undefined,
    createdAt: "2024-06-24T09:00:00",
    updatedAt: "2024-06-24T09:00:00",
  };

  const handleUpdate = () => {
    console.log("출근 처리 완료!");
    // 실제로는 여기서 데이터를 다시 불러올 것
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-main2">
          출근 카드 예시
        </h1>

        <AttendanceCard attendance={sampleAttendance} onUpdate={handleUpdate} />

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold mb-2">사용법:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 오른쪽 위 칩을 클릭하여 출근 타입 변경</li>
            <li>• 칩을 누를 때마다 순환적으로 타입이 변경됩니다</li>
            <li>• 선택된 타입에 따라 출근 처리됩니다</li>
            <li>
              • 자동 계산 → 정상출근 → 조기출근 → 연장근무 → 조퇴 → 추가근무
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
