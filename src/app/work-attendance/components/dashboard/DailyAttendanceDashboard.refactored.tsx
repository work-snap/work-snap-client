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
import { DailySummary } from "./DailySummary";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { HelpSection } from "./HelpSection";

interface DailyAttendanceDashboardProps {
  dailyAttendance?: DailyAttendanceRes | null;
  targetDate?: string;
  isLoading?: boolean;
  error?: Error | null;
  onUpdate?: () => void;
  className?: string;
}

/**
 * DailyAttendanceDashboard - 리팩터링된 일별 출근 기록 대시보드 컴포넌트
 * 
 * Improvements:
 * - 컴포넌트 분리로 단일 책임 원칙 준수
 * - 재사용 가능한 서브 컴포넌트들
 * - 향상된 에러 처리 및 로딩 상태
 * - 더 나은 사용자 경험
 * - 유지보수성 향상
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
        <LoadingSkeleton />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`${className}`}>
        <ErrorState error={error} onRetry={onUpdate} />
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!dailyAttendance || cardsToDisplay.length === 0) {
    return (
      <div className={`${className}`}>
        <EmptyState date={targetDate} onRefresh={onUpdate} />
      </div>
    );
  }

  // 메인 렌더링
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 일별 요약 정보 */}
      <DailySummary 
        dailyAttendance={dailyAttendance} 
        targetDate={targetDate} 
      />

      {/* 근무 카드들 */}
      <AttendanceCardsList
        cardsToDisplay={cardsToDisplay}
        onMainAction={handleMainAction}
        onUpdate={onUpdate}
      />

      {/* 도움말 섹션 */}
      <HelpSection />
    </div>
  );
};

/**
 * AttendanceCardsList - 출근 카드 목록 컴포넌트
 */
interface AttendanceCardsListProps {
  cardsToDisplay: Array<{ attendance: AttendanceRes; cardConfig: any }>;
  onMainAction: (attendanceId: number, type: "normal") => Promise<void>;
  onUpdate?: () => void;
}

const AttendanceCardsList: React.FC<AttendanceCardsListProps> = ({
  cardsToDisplay,
  onMainAction,
  onUpdate,
}) => {
  // 카드를 타입별로 분류
  const { regularCards, additionalCards } = useMemo(() => {
    const regular: typeof cardsToDisplay = [];
    const additional: typeof cardsToDisplay = [];

    cardsToDisplay.forEach((card) => {
      if (card.cardConfig.cardType === "additional") {
        additional.push(card);
      } else {
        regular.push(card);
      }
    });

    return { regularCards: regular, additionalCards: additional };
  }, [cardsToDisplay]);

  return (
    <div className="space-y-6">
      {/* 일반 근무 카드들 */}
      {regularCards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🏢</span>
            정규 근무
          </h3>
          <div className="space-y-4">
            {regularCards.map(({ attendance, cardConfig }, index) => (
              <DailyScheduleCard
                key={`regular-${attendance.id}-${cardConfig.cardType}-${index}`}
                attendance={attendance}
                cardConfig={cardConfig}
                onMainAction={(type) => onMainAction(attendance.id, type)}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* 추가 근무 카드들 */}
      {additionalCards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">⚡</span>
            추가 근무
          </h3>
          <div className="space-y-4">
            {additionalCards.map(({ attendance, cardConfig }, index) => (
              <AdditionalWorkCard
                key={`additional-${attendance.id}-${cardConfig.cardType}-${index}`}
                attendance={attendance}
                cardConfig={cardConfig}
                onMainAction={(type) => onMainAction(attendance.id, type)}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendanceDashboard;