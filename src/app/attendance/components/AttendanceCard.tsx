import React from "react";
import { AttendanceRecord, AttendanceStatus, WorkType } from "../lib/types";
import {
  getAttendanceStatus,
  getWorkTypeLabel,
  getWorkTypeLabelFromString,
} from "../lib/utils";
import { StatusMessage } from "./StatusMessage";
import { TimeDisplay } from "./TimeDisplay";
import { ActionButton } from "./ActionButton";
import { parse } from "date-fns";

interface AttendanceCardProps {
  record: AttendanceRecord;
  onClockIn: (attendanceId: number, clockInType?: WorkType) => void;
  onClockOut: (attendanceId: number, clockOutType?: WorkType) => void;
  loading?: boolean;
  className?: string;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  record,
  onClockIn,
  onClockOut,
  loading = false,
  className = "",
}) => {
  const status = getAttendanceStatus(record);

  const getCardBackgroundColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.BEFORE_WORK:
        return "bg-gray1";
      case AttendanceStatus.WORKING:
        return "bg-primary-50";
      case AttendanceStatus.AFTER_WORK:
        return "bg-warning-50";
      default:
        return "bg-white";
    }
  };

  const getWorkTypeDisplay = () => {
    if (status === AttendanceStatus.BEFORE_WORK) {
      return null;
    }

    const clockInTypes = record.clockInTypes;
    const clockOutTypes = record.clockOutTypes;

    if (
      status === AttendanceStatus.WORKING &&
      clockInTypes &&
      clockInTypes.length > 0
    ) {
      const label = getWorkTypeLabelFromString(clockInTypes[0]);
      if (label) {
        return (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
            [{label}]
          </span>
        );
      }
    }

    if (
      status === AttendanceStatus.AFTER_WORK &&
      clockOutTypes &&
      clockOutTypes.length > 0
    ) {
      const label = getWorkTypeLabelFromString(clockOutTypes[0]);
      if (label) {
        return (
          <span className="text-xs bg-warning-100 text-warning-700 px-2 py-1 rounded-full">
            [{label}]
          </span>
        );
      }
    }

    return null;
  };

  const handleClockIn = (clockInType?: WorkType) => {
    onClockIn(record.id, clockInType);
  };

  const handleClockOut = (clockOutType?: WorkType) => {
    onClockOut(record.id, clockOutType);
  };

  const startTime = parse(
    `${record.workDate} ${record.actualStartTime ?? record.scheduledStartTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  const endTime =
    record.actualEndTime || record.scheduledEndTime
      ? parse(
          `${record.workDate} ${
            record.actualEndTime ?? record.scheduledEndTime
          }`,
          "yyyy-MM-dd HH:mm",
          new Date()
        )
      : undefined;
  const isOvernight = false; // TODO: derive if needed

  return (
    <div
      className={`rounded-lg border border-gray2 p-4 ${getCardBackgroundColor(
        status
      )} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray5">
            {record.workplaceName || "근무지"}
          </h3>
          {getWorkTypeDisplay()}
        </div>

        {record.isAdditionalWork && (
          <button className="text-gray3 hover:text-gray4">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Status */}
      <StatusMessage status={status} className="mb-4" />

      {/* Time Display */}
      <TimeDisplay
        startTime={startTime}
        endTime={endTime}
        isOvernight={isOvernight}
        className="mb-4"
      />

      {/* Action Button */}
      <ActionButton
        status={status}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        isLoading={loading}
      />
    </div>
  );
};

export default AttendanceCard;
