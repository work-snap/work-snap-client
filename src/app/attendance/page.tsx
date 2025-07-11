"use client";

import React, { useState } from "react";
import {
  DateNavigation,
  AttendanceCard,
  AdditionalWorkButton,
} from "./components";
import { useAttendanceData } from "./lib/hooks";
import { WorkType } from "./lib/types";
import { format } from "date-fns";

const AttendancePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const {
    attendanceRecords,
    loading,
    error,
    refetch,
    handleClockIn,
    handleClockOut,
  } = useAttendanceData(formattedDate);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleClockInWrapper = (
    attendanceId: number,
    clockInType?: WorkType
  ) => {
    handleClockIn(attendanceId, clockInType?.toString());
  };

  const handleClockOutWrapper = (
    attendanceId: number,
    clockOutType?: WorkType
  ) => {
    handleClockOut(attendanceId, clockOutType?.toString());
  };

  return (
    <div className="min-h-screen bg-gray1">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto">
          <DateNavigation
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
            <p className="text-sm text-error-600">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-error-700 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && attendanceRecords.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Attendance Cards */}
        {attendanceRecords.length > 0 && (
          <div className="space-y-4 mb-6">
            {attendanceRecords.map((record: any) => (
              <AttendanceCard
                key={record.id}
                record={record}
                onClockIn={handleClockInWrapper}
                onClockOut={handleClockOutWrapper}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && attendanceRecords.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-gray3 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <p className="text-gray4 text-sm">
              이 날짜에 배정된 근무가 없습니다.
            </p>
          </div>
        )}

        {/* Additional Work Button */}
        <AdditionalWorkButton
          selectedDate={formattedDate}
          onWorkAdded={refetch}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default AttendancePage;
