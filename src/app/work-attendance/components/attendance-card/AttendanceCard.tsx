"use client";

import React, { useState } from "react";
import { AttendanceRes, ClockInType, ClockOutType } from "../../lib/types";
import { useAppFeatures } from "../../lib/hooks";
import { useSmartButton } from "../../lib/hooks";
import { useClockIn, useClockOut } from "../../lib/hooks/use-attendance";
import { AttendanceHeader } from "./AttendanceHeader";
import { SmartActionButton } from "../smart-button";
import { LoadingSpinner, AppEnvironmentBadge } from "../common";

interface AttendanceCardProps {
  attendance: AttendanceRes;
  onUpdate?: () => void;
  className?: string;
}

/**
 * 출근기록 메인 카드 컴포넌트
 * Single Responsibility: 출근/퇴근 액션과 상태 표시 통합
 */
export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  attendance,
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

  const handleAction = async () => {
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

      // 성공 시 데이터 새로고침
      onUpdate?.();
    } catch (error) {
      console.error("Action failed:", error);

      // 실패 피드백
      await errorFeedback(
        "처리 실패",
        error instanceof Error ? error.message : "처리 중 오류가 발생했습니다"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const isActionDisabled = () => {
    // 로딩 중이거나 뮤테이션 진행 중
    const isLoading =
      isProcessing || clockInMutation.isPending || clockOutMutation.isPending;
    if (isLoading) return true;

    // 이미 완료된 경우
    if (attendance.status === "COMPLETED") return true;

    // 출근하지 않았는데 퇴근 시도하는 경우
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
    <div className={`space-y-4 ${className}`}>
      {/* 환경 표시 배지 */}
      <AppEnvironmentBadge isApp={isApp} />

      {/* 출근기록 헤더 */}
      <AttendanceHeader
        attendance={attendance}
        buttonState={currentButtonState}
        onCycleOption={cycleButtonOption}
      />

      {/* 스마트 액션 버튼 */}
      <div className="space-y-3">
        <SmartActionButton
          buttonState={currentButtonState}
          onAction={handleAction}
          isLoading={isLoading}
          disabled={isActionDisabled()}
          className="w-full h-16 text-lg font-semibold"
        />

        {/* 비활성화 이유 표시 */}
        {isActionDisabled() && !isLoading && (
          <div className="text-center text-sm text-gray-500">
            {attendance.status === "COMPLETED" && "오늘 근무가 완료되었습니다"}
            {currentButtonState.action === "CLOCK_OUT" &&
              !attendance.actualStartTime &&
              "출근 후 퇴근할 수 있습니다"}
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};
