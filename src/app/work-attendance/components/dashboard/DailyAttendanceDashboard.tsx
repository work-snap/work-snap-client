"use client";

import React, { useMemo } from "react";
import {
  AttendanceRes,
  ClockInType,
  ClockOutType,
  DailyAttendanceRes,
} from "../../lib/types";
import {
  getCardsForDate,
  determineCardType,
  getCardDisplayConfig,
  getCurrentDateString,
} from "../../lib/utils";
import { DailyScheduleCard, AdditionalWorkCard } from "../schedule-card";
import { LoadingSpinner } from "../common";

interface DailyAttendanceDashboardProps {
  dailyAttendance?: DailyAttendanceRes | null;
  targetDate?: string;
  isLoading?: boolean;
  error?: Error | null;
  onUpdate?: () => void;
  className?: string;
}

/**
 * 일별 출근 기록 대시보드 컴포넌트
 * Single Responsibility: 일별 모든 근무 카드 통합 관리
 */
export const DailyAttendanceDashboard: React.FC<DailyAttendanceDashboardProps> = ({
  dailyAttendance,
  targetDate = getCurrentDateString(),
  isLoading = false,
  error = null,
  onUpdate,
  className = "",
}) => {
  // 해당 날짜에 표시할 카드들 계산
  const cardsToDisplay = useMemo(() => {
    if (!dailyAttendance?.attendances) return [];

    return getCardsForDate(dailyAttendance.attendances, targetDate);
  }, [dailyAttendance, targetDate]);

  // 메인 액션 핸들러 (AI 추천 버튼)
  const handleMainAction = async (
    attendanceId: number,
    type: "normal"
  ): Promise<void> => {
    console.log(`Main action: ${type} for attendance ${attendanceId}`);
    // 메인 액션은 AI가 추천하는 정상 출근/퇴근으로 처리됨
  };


  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <DashboardSkeleton />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`${className}`}>
        <ErrorDisplay error={error} onRetry={onUpdate} />
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!dailyAttendance || cardsToDisplay.length === 0) {
    return (
      <div className={`${className}`}>
        <EmptyDisplay date={targetDate} onRefresh={onUpdate} />
      </div>
    );
  }

  // 카드 렌더링
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 일별 요약 정보 */}
      <DailySummary dailyAttendance={dailyAttendance} targetDate={targetDate} />

      {/* 근무 카드들 */}
      <div className="space-y-4">
        {cardsToDisplay.map(({ attendance, cardConfig }, index) => {
          // 추가 근무인 경우 전용 카드 사용
          if (cardConfig.cardType === "additional") {
            return (
              <AdditionalWorkCard
                key={`${attendance.id}-${cardConfig.cardType}-${index}`}
                attendance={attendance}
                cardConfig={cardConfig}
                onMainAction={(type) => handleMainAction(attendance.id, type)}
                onUpdate={onUpdate}
              />
            );
          }

          // 일반/야간 근무는 기본 카드 사용
          return (
            <DailyScheduleCard
              key={`${attendance.id}-${cardConfig.cardType}-${index}`}
              attendance={attendance}
              cardConfig={cardConfig}
              onMainAction={(type) => handleMainAction(attendance.id, type)}
              onUpdate={onUpdate}
            />
          );
        })}
      </div>

      {/* 도움말 섹션 */}
      <HelpSection />
    </div>
  );
};

/**
 * 일별 요약 정보 컴포넌트
 */
const DailySummary: React.FC<{
  dailyAttendance: DailyAttendanceRes;
  targetDate: string;
}> = ({ dailyAttendance, targetDate }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "오늘";
    } else if (dateStr === tomorrow.toISOString().split("T")[0]) {
      return "내일";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    }
  };

  return (
    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-blue-800">
          📅 {formatDate(targetDate)} 근무 현황
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-700">
            {dailyAttendance.totalCount}
          </div>
          <div className="text-sm text-blue-600">전체 일정</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {dailyAttendance.completedCount}
          </div>
          <div className="text-sm text-green-600">완료</div>
        </div>
      </div>

      {dailyAttendance.inProgressCount > 0 && (
        <div className="mt-3 p-2 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-700 text-center">
            🔄 진행 중인 근무: {dailyAttendance.inProgressCount}개
          </div>
        </div>
      )}

      {dailyAttendance.additionalWorkCount > 0 && (
        <div className="mt-2 p-2 bg-purple-100 rounded-lg">
          <div className="text-sm text-purple-700 text-center">
            ⚡ 추가 근무: {dailyAttendance.additionalWorkCount}개
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 빈 상태 표시 컴포넌트
 */
const EmptyDisplay: React.FC<{
  date: string;
  onRefresh?: () => void;
}> = ({ date, onRefresh }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📅</div>
    <h3 className="text-lg font-semibold text-main2 mb-2">
      근무 일정이 없습니다
    </h3>
    <p className="text-gray-600 mb-4">
      {new Date(date).toLocaleDateString("ko-KR")}에 등록된 근무 일정이 없습니다
    </p>
    {onRefresh && (
      <button
        onClick={onRefresh}
        className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
      >
        새로고침
      </button>
    )}
  </div>
);

/**
 * 에러 표시 컴포넌트
 */
const ErrorDisplay: React.FC<{
  error: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">😔</div>
    <h3 className="text-lg font-semibold text-main2 mb-2">
      데이터를 불러올 수 없습니다
    </h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-main text-white px-6 py-2 rounded-lg font-medium hover:bg-main2 transition-colors"
      >
        다시 시도
      </button>
    )}
  </div>
);

/**
 * 로딩 스켈레톤 컴포넌트
 */
const DashboardSkeleton: React.FC = () => (
  <>
    {/* 요약 정보 스켈레톤 */}
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>

    {/* 카드 스켈레톤 */}
    {[1, 2].map((i) => (
      <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    ))}
  </>
);

/**
 * 도움말 섹션 컴포넌트
 */
const HelpSection: React.FC = () => (
  <div className="bg-sub1/10 rounded-2xl p-6">
    <h3 className="text-md font-semibold text-sub2 mb-3">💡 사용 가이드</h3>
    
    <div className="space-y-2 text-sm text-sub2">
      <p>• <strong>메인 버튼</strong>: 선택된 타입으로 출근/퇴근 처리</p>
      <p>• <strong>우측 버튼</strong>: 상황별 빠른 액션 (조기출근, 조퇴 등)</p>
      <p>• <strong>타입 변경</strong>: "다른 타입 선택" 버튼으로 출근/퇴근 타입을 변경할 수 있습니다</p>
      <p>• <strong>야간 근무</strong>: 시작일과 종료일에 각각 카드가 표시됩니다</p>
      <p>• <strong>추가 근무</strong>: 정규 근무와 별도로 관리되는 업무입니다</p>
    </div>
  </div>
);

export default DailyAttendanceDashboard;