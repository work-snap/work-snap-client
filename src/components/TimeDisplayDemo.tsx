"use client";

import React, { useState } from "react";
import {
  useEnhancedTime,
  useTimeSyncControl,
  useTimeInfo,
} from "./EnhancedTimeProvider";
import {
  useCurrentTime,
  useFormattedTime,
  useTimeZone,
} from "@/hooks/useCurrentTime";
import {
  formatTime,
  formatDate,
  formatRelativeTime,
  getDateLabel,
} from "@/utils/timeUtils";

/**
 * 시간 표시 데모 컴포넌트
 * 다양한 시간 훅의 사용법을 보여주는 예제
 */
export const TimeDisplayDemo: React.FC = () => {
  const [selectedTimeZone, setSelectedTimeZone] = useState("Asia/Seoul");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        시간 동기화 시스템 데모
      </h1>

      {/* 기본 시간 정보 */}
      <BasicTimeDisplay />

      {/* 향상된 시간 정보 */}
      <EnhancedTimeDisplay />

      {/* 시간 동기화 제어 */}
      <TimeSyncControlPanel />

      {/* 다양한 시간 포맷 */}
      <FormattedTimeDisplay />

      {/* 시간대 선택 */}
      <TimeZoneSelector
        selectedTimeZone={selectedTimeZone}
        onTimeZoneChange={setSelectedTimeZone}
      />

      {/* 시간 유틸리티 데모 */}
      <TimeUtilityDemo />
    </div>
  );
};

// 기본 시간 표시 컴포넌트
const BasicTimeDisplay: React.FC = () => {
  const { currentTime, formattedTime } = useCurrentTime();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        기본 시간 정보
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-mono text-blue-600">
            {formattedTime}
          </div>
          <div className="text-sm text-gray-500 mt-1">현재 시간</div>
        </div>
        <div className="text-center">
          <div className="text-lg text-gray-700">{formatDate(currentTime)}</div>
          <div className="text-sm text-gray-500 mt-1">현재 날짜</div>
        </div>
      </div>
    </div>
  );
};

// 향상된 시간 표시 컴포넌트
const EnhancedTimeDisplay: React.FC = () => {
  const {
    currentTime,
    formattedTime,
    formattedDate,
    isServerSynced,
    lastSyncTime,
    timeDifference,
    syncAccuracy,
  } = useEnhancedTime();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        향상된 시간 정보
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 시간 표시 */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-mono text-green-600">
              {formattedTime}
            </div>
            <div className="text-lg text-gray-600 mt-1">{formattedDate}</div>
          </div>

          <div className="flex justify-center">
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                isServerSynced
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isServerSynced ? "서버 동기화 완료" : "로컬 시간"}
            </div>
          </div>
        </div>

        {/* 동기화 정보 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">동기화 정확도</span>
            <span className="text-sm font-medium text-blue-600">
              {syncAccuracy}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">시간 차이</span>
            <span className="text-sm font-medium text-purple-600">
              {timeDifference > 0
                ? `+${timeDifference}ms`
                : `${timeDifference}ms`}
            </span>
          </div>

          {lastSyncTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">마지막 동기화</span>
              <span className="text-sm font-medium text-gray-700">
                {formatRelativeTime(lastSyncTime)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 시간 동기화 제어 패널
const TimeSyncControlPanel: React.FC = () => {
  const {
    syncWithServer,
    toggleAutoSync,
    isAutoSyncEnabled,
    syncStatus,
    syncError,
    isServerSynced,
  } = useTimeSyncControl();

  const handleManualSync = async () => {
    try {
      await syncWithServer();
    } catch (error) {
      console.error("수동 동기화 실패:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">동기화 제어</h2>

      <div className="space-y-4">
        {/* 상태 표시 */}
        <div className="flex items-center space-x-4">
          <div
            className={`w-3 h-3 rounded-full ${
              syncStatus === "success"
                ? "bg-green-500"
                : syncStatus === "syncing"
                ? "bg-yellow-500"
                : syncStatus === "error"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            상태:{" "}
            {syncStatus === "success"
              ? "동기화 완료"
              : syncStatus === "syncing"
              ? "동기화 중..."
              : syncStatus === "error"
              ? "동기화 실패"
              : "대기 중"}
          </span>
        </div>

        {syncError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            오류: {syncError}
          </div>
        )}

        {/* 제어 버튼 */}
        <div className="flex space-x-3">
          <button
            onClick={handleManualSync}
            disabled={syncStatus === "syncing"}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncStatus === "syncing" ? "동기화 중..." : "수동 동기화"}
          </button>

          <button
            onClick={toggleAutoSync}
            className={`px-4 py-2 rounded ${
              isAutoSyncEnabled
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            자동 동기화 {isAutoSyncEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 다양한 시간 포맷 표시
const FormattedTimeDisplay: React.FC = () => {
  const {
    currentTime,
    time24Hour,
    time12Hour,
    date,
    dateTime,
    iso,
    timestamp,
  } = useFormattedTime();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        다양한 시간 포맷
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">24시간 형식:</span>
          <span className="font-mono">{time24Hour}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">12시간 형식:</span>
          <span className="font-mono">{time12Hour}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">날짜:</span>
          <span className="font-mono">{date}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">날짜 라벨:</span>
          <span className="font-mono">{getDateLabel(currentTime)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">ISO 형식:</span>
          <span className="font-mono text-xs">{iso}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">타임스탬프:</span>
          <span className="font-mono text-xs">{timestamp}</span>
        </div>
      </div>
    </div>
  );
};

// 시간대 선택 컴포넌트
const TimeZoneSelector: React.FC<{
  selectedTimeZone: string;
  onTimeZoneChange: (timeZone: string) => void;
}> = ({ selectedTimeZone, onTimeZoneChange }) => {
  const { currentTime, formattedTime, formattedDate } =
    useTimeZone(selectedTimeZone);

  const timeZones = [
    { value: "Asia/Seoul", label: "서울 (KST)" },
    { value: "America/New_York", label: "뉴욕 (EST)" },
    { value: "Europe/London", label: "런던 (GMT)" },
    { value: "Asia/Tokyo", label: "도쿄 (JST)" },
    { value: "Australia/Sydney", label: "시드니 (AEST)" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">시간대 선택</h2>

      <div className="space-y-4">
        <select
          value={selectedTimeZone}
          onChange={(e) => onTimeZoneChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {timeZones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>

        <div className="text-center">
          <div className="text-2xl font-mono text-indigo-600">
            {formattedTime}
          </div>
          <div className="text-sm text-gray-500 mt-1">{formattedDate}</div>
          <div className="text-xs text-gray-400 mt-1">{selectedTimeZone}</div>
        </div>
      </div>
    </div>
  );
};

// 시간 유틸리티 데모
const TimeUtilityDemo: React.FC = () => {
  const { currentTime } = useTimeInfo();

  const pastTime = new Date(currentTime.getTime() - 1000 * 60 * 30); // 30분 전
  const futureTime = new Date(currentTime.getTime() + 1000 * 60 * 60 * 2); // 2시간 후

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        시간 유틸리티 데모
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">30분 전:</span>
          <span className="font-mono">
            {formatRelativeTime(pastTime, currentTime)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">2시간 후:</span>
          <span className="font-mono">
            {formatRelativeTime(futureTime, currentTime)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">어제:</span>
          <span className="font-mono">
            {getDateLabel(
              new Date(currentTime.getTime() - 1000 * 60 * 60 * 24)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">내일:</span>
          <span className="font-mono">
            {getDateLabel(
              new Date(currentTime.getTime() + 1000 * 60 * 60 * 24)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
