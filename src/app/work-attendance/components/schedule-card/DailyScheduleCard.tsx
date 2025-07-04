"use client";

import React, { useState } from "react";
import {
  DailyScheduleCardProps,
  ClockInType,
  ClockOutType,
  AttendanceStatus,
} from "../../lib/types";
import { useAppFeatures } from "../../lib/hooks";
import { useSmartButton } from "../../lib/hooks";
import { useClockIn, useClockOut } from "../../lib/hooks/use-attendance";
import {
  getCardTypeClassName,
  getCardTypeIcon,
  getCardTypeTitleColor,
} from "../../lib/utils";
import { SmartActionButton } from "../smart-button";
import { StatusBadge } from "../feedback";
import { RealTimeClock, WorkScheduleTime } from "../time-display";
import { LoadingSpinner } from "../common";

/**
 * 일별 스케줄 카드 컴포넌트
 * Single Responsibility: 개별 근무 일정 표시 및 액션 처리
 */
export const DailyScheduleCard: React.FC<DailyScheduleCardProps> = ({
  attendance,
  cardConfig,
  onMainAction,
  onUpdate,
  className = "",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 스마트 버튼 상태 (타입 변경 기능 포함)
  const { currentButtonState, cycleButtonOption } = useSmartButton(attendance);

  const {
    showNotification,
    vibrate,
    processLocationBasedAction,
    errorFeedback,
    isApp,
  } = useAppFeatures();

  // API 뮤테이션 훅
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();


  // 메인 액션 처리
  const handleMainAction = async () => {
    try {
      setIsProcessing(true);

      // 위치 기반 액션 처리
      const { location, notes } = await processLocationBasedAction(
        currentButtonState.action === "CLOCK_IN" ? "clock-in" : "clock-out"
      );

      // API 호출 준비
      const actionType = currentButtonState.action;
      const requestData = {
        notes,
        ...(actionType === "CLOCK_IN"
          ? { manualClockInType: currentButtonState.type as ClockInType }
          : { manualClockOutType: currentButtonState.type as ClockOutType }),
      };

      // 실제 API 호출
      if (actionType === "CLOCK_IN") {
        await clockInMutation.mutateAsync({
          attendanceId: attendance.id,
          request: requestData,
        });
      } else {
        await clockOutMutation.mutateAsync({
          attendanceId: attendance.id,
          request: requestData,
        });
      }

      // 정상 출근/퇴근으로 기록됨
      await onMainAction("normal");
      onUpdate?.();
    } catch (error) {
      console.error("Main action failed:", error);
      await errorFeedback(
        "처리 실패",
        error instanceof Error ? error.message : "처리 중 오류가 발생했습니다"
      );
    } finally {
      setIsProcessing(false);
    }
  };


  // 액션 비활성화 여부 확인
  const isMainActionDisabled = () => {
    const isLoading =
      isProcessing || clockInMutation.isPending || clockOutMutation.isPending;
    if (isLoading) return true;

    if (attendance.status === "COMPLETED") return true;

    if (
      currentButtonState.action === "CLOCK_OUT" &&
      !attendance.actualStartTime
    ) {
      return true;
    }

    return false;
  };


  const isLoading =
    isProcessing || clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <div className={`${getCardTypeClassName(cardConfig.cardType)} ${className}`}>
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">{getCardTypeIcon(cardConfig.cardType)}</span>
            <h3 className={`text-lg font-semibold ${getCardTypeTitleColor(cardConfig.cardType)}`}>
              {cardConfig.title}
            </h3>
          </div>
          {cardConfig.subtitle && (
            <p className="text-sm text-gray-600 mb-2">{cardConfig.subtitle}</p>
          )}
          <div className="flex items-center space-x-3">
            <StatusBadge
              status={attendance.status}
              statusKorean={attendance.statusKorean}
            />
          </div>
        </div>

        {/* 타입 변경 버튼 (우측 상단) */}
        <div className="ml-4">
          <button
            onClick={cycleButtonOption}
            disabled={attendance.status === AttendanceStatus.COMPLETED || isLoading}
            className="px-3 py-2 text-sm rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {(() => {
              if (currentButtonState.action === "CLOCK_IN") {
                return currentButtonState.type === ClockInType.NORMAL ? "조기출근" : "정상출근";
              } else {
                if (currentButtonState.type === ClockOutType.NORMAL) return "조퇴";
                if (currentButtonState.type === ClockOutType.EARLY_DEPARTURE) return "연장근무";
                return "정상퇴근";
              }
            })()}
          </button>
        </div>
      </div>

      {/* 시간 정보 */}
      {cardConfig.showTimeRange && (
        <div className="mb-4">
          <RealTimeClock className="text-lg font-bold text-main2 mb-2" />
          <WorkScheduleTime
            attendance={attendance}
            className="text-sm font-medium text-gray-600"
          />
        </div>
      )}

      {/* 근무 시간 정보 (진행 중인 경우) */}
      {attendance.actualStartTime && attendance.status === AttendanceStatus.IN_PROGRESS && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">현재 근무 시간</span>
            <span className="text-lg font-bold text-blue-800">
              {(() => {
                const startTime = new Date(attendance.actualStartTime!);
                const now = new Date();
                const diffMs = now.getTime() - startTime.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}시간 ${minutes}분`;
              })()}
            </span>
          </div>
        </div>
      )}

      {/* 메인 액션 버튼 */}
      <div className="space-y-3">
        <SmartActionButton
          buttonState={currentButtonState}
          onAction={handleMainAction}
          isLoading={isLoading}
          disabled={isMainActionDisabled()}
          className="w-full h-14 text-base font-semibold"
        />

        {/* 비활성화 이유 표시 */}
        {isMainActionDisabled() && !isLoading && (
          <div className="text-center text-sm text-gray-500">
            {attendance.status === "COMPLETED" && "근무가 완료되었습니다"}
            {currentButtonState.action === "CLOCK_OUT" &&
              !attendance.actualStartTime &&
              "출근 후 퇴근할 수 있습니다"}
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center py-4 mt-4">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* 야간 근무 안내 */}
      {cardConfig.isOvernightPart && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center text-sm text-yellow-800">
            <span className="mr-2">💡</span>
            {cardConfig.cardType === "overnight-start" 
              ? "야간 근무가 시작됩니다. 다음날에 종료 버튼이 나타납니다."
              : "야간 근무를 종료할 수 있습니다."}
          </div>
        </div>
      )}
    </div>
  );
};