"use client";

import React, { useState, useCallback } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { ScheduleConflict, scheduleHelpers } from "@/services/scheduleService";

// 충돌 심각도 타입
export type ConflictSeverity = "low" | "medium" | "high" | "critical";

// 충돌 알림 타입
export type ConflictAlertType = "modal" | "inline" | "toast" | "banner";

// 충돌 액션 타입
export interface ConflictAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "warning" | "danger";
  loading?: boolean;
}

interface ConflictAlertProps {
  conflicts: ScheduleConflict[];
  type?: ConflictAlertType;
  severity?: ConflictSeverity;
  title?: string;
  showDetails?: boolean;
  canProceed?: boolean;
  recommendation?: string;
  actions?: ConflictAction[];
  onClose?: () => void;
  onProceed?: () => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

// 심각도별 스타일
const severityStyles: Record<ConflictSeverity, {
  container: string;
  icon: string;
  title: string;
  description: string;
  iconSymbol: string;
}> = {
  low: {
    container: "border-yellow-200 bg-yellow-50",
    icon: "text-yellow-600",
    title: "text-yellow-800",
    description: "text-yellow-700",
    iconSymbol: "⚠️",
  },
  medium: {
    container: "border-orange-200 bg-orange-50",
    icon: "text-orange-600",
    title: "text-orange-800",
    description: "text-orange-700",
    iconSymbol: "⚠️",
  },
  high: {
    container: "border-red-200 bg-red-50",
    icon: "text-red-600",
    title: "text-red-800",
    description: "text-red-700",
    iconSymbol: "🚨",
  },
  critical: {
    container: "border-red-300 bg-red-100",
    icon: "text-red-700",
    title: "text-red-900",
    description: "text-red-800",
    iconSymbol: "🛑",
  },
};

// 충돌 타입별 심각도 매핑
const getConflictSeverity = (conflicts: ScheduleConflict[]): ConflictSeverity => {
  if (conflicts.some(c => c.conflictType === "DUPLICATE")) return "critical";
  if (conflicts.some(c => c.conflictType === "OVERLAP" && c.conflictDurationMinutes > 60)) return "high";
  if (conflicts.some(c => c.conflictType === "OVERLAP")) return "medium";
  return "low";
};

/**
 * 스케줄 충돌 경고 컴포넌트
 * 다양한 형태로 충돌 정보를 표시하고 사용자 액션을 처리
 */
export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  conflicts,
  type = "inline",
  severity,
  title,
  showDetails = true,
  canProceed = false,
  recommendation,
  actions,
  onClose,
  onProceed,
  onCancel,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const actualSeverity = severity || getConflictSeverity(conflicts);
  const style = severityStyles[actualSeverity];
  
  const defaultTitle = title || "스케줄 충돌이 발생했습니다";
  
  // 기본 액션 생성
  const defaultActions: ConflictAction[] = [
    ...(onCancel ? [{
      label: "취소",
      action: onCancel,
      variant: "secondary" as const,
    }] : []),
    ...(canProceed && onProceed ? [{
      label: "무시하고 진행",
      action: onProceed,
      variant: actualSeverity === "critical" ? "danger" : "warning" as const,
    }] : []),
  ];
  
  const finalActions = actions || defaultActions;

  // 액션 실행 핸들러
  const handleAction = useCallback(async (action: ConflictAction) => {
    setIsProcessing(true);
    try {
      await action.action();
    } catch (error) {
      console.error("액션 실행 실패:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 모달 타입 렌더링
  if (type === "modal") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}>
          <div className={`border-l-4 ${style.container.includes('border-') ? '' : 'border-red-400'} p-6`}>
            {/* 모달 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`text-2xl ${style.icon}`} role="img" aria-hidden="true">
                  {style.iconSymbol}
                </span>
                <h2 className={`text-xl font-semibold ${style.title}`}>
                  {defaultTitle}
                </h2>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 충돌 목록 */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {conflicts.map((conflict, index) => (
                <ConflictItem
                  key={index}
                  conflict={conflict}
                  severity={actualSeverity}
                  showDetails={showDetails}
                />
              ))}
            </div>

            {/* 권장사항 */}
            {recommendation && (
              <div className={`p-3 rounded-md bg-blue-50 border border-blue-200 mb-6`}>
                <p className="text-sm text-blue-800">
                  <strong>권장사항:</strong> {recommendation}
                </p>
              </div>
            )}

            {/* 액션 버튼 */}
            {finalActions.length > 0 && (
              <div className="flex justify-end space-x-3">
                {finalActions.map((action, index) => (
                  <BaseButton
                    key={index}
                    buttonState={{
                      label: action.label,
                      variant: action.variant || "primary",
                      loading: isProcessing && action.loading !== false,
                      disabled: isProcessing,
                    }}
                    onClick={() => handleAction(action)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 토스트 타입 렌더링
  if (type === "toast") {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${className}`}>
        <div className={`rounded-lg shadow-lg border ${style.container} p-4`}>
          <div className="flex items-start space-x-3">
            <span className={`text-lg ${style.icon} flex-shrink-0`} role="img" aria-hidden="true">
              {style.iconSymbol}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${style.title}`}>
                {defaultTitle}
              </h3>
              <p className={`text-sm ${style.description} mt-1`}>
                {conflicts.length === 1 
                  ? scheduleHelpers.getConflictMessage(conflicts[0])
                  : `${conflicts.length}개의 충돌이 발생했습니다`
                }
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`${style.icon} hover:opacity-75`}
                aria-label="닫기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 배너 타입 렌더링
  if (type === "banner") {
    return (
      <div className={`${style.container} border-l-4 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`text-lg ${style.icon}`} role="img" aria-hidden="true">
              {style.iconSymbol}
            </span>
            <div>
              <h3 className={`text-sm font-medium ${style.title}`}>
                {defaultTitle}
              </h3>
              <p className={`text-sm ${style.description}`}>
                {conflicts.length}개의 스케줄 충돌이 발견되었습니다.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-sm ${style.title} hover:underline`}
              >
                {isExpanded ? "숨기기" : "자세히 보기"}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className={`${style.icon} hover:opacity-75`}
                aria-label="닫기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-2">
            {conflicts.map((conflict, index) => (
              <ConflictItem
                key={index}
                conflict={conflict}
                severity={actualSeverity}
                compact
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 인라인 타입 렌더링 (기본)
  return (
    <div className={`rounded-lg border ${style.container} p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <span className={`text-xl ${style.icon} flex-shrink-0 mt-0.5`} role="img" aria-hidden="true">
          {style.iconSymbol}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium ${style.title} mb-2`}>
            {defaultTitle}
          </h3>
          
          <div className="space-y-3 mb-4">
            {conflicts.map((conflict, index) => (
              <ConflictItem
                key={index}
                conflict={conflict}
                severity={actualSeverity}
                showDetails={showDetails}
              />
            ))}
          </div>

          {recommendation && (
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200 mb-4">
              <p className="text-sm text-blue-800">
                <strong>권장사항:</strong> {recommendation}
              </p>
            </div>
          )}

          {finalActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {finalActions.map((action, index) => (
                <BaseButton
                  key={index}
                  buttonState={{
                    label: action.label,
                    variant: action.variant || "primary",
                    loading: isProcessing && action.loading !== false,
                    disabled: isProcessing,
                  }}
                  onClick={() => handleAction(action)}
                  className="text-sm"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 개별 충돌 항목 컴포넌트
 */
const ConflictItem: React.FC<{
  conflict: ScheduleConflict;
  severity: ConflictSeverity;
  showDetails?: boolean;
  compact?: boolean;
}> = ({ conflict, severity, showDetails = true, compact = false }) => {
  const style = severityStyles[severity];
  const message = scheduleHelpers.getConflictMessage(conflict);

  if (compact) {
    return (
      <div className="text-sm">
        <span className={`font-medium ${style.title}`}>
          {conflict.conflictingSchedule.employeeName || "직원"}
        </span>
        <span className={`ml-2 ${style.description}`}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className={`border-l-2 border-current pl-3 ${style.description}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-medium ${style.title}`}>
          {conflict.conflictingSchedule.employeeName || "직원"} ({conflict.conflictingSchedule.workDate})
        </span>
        <span className={`text-xs px-2 py-1 rounded-full bg-current bg-opacity-20 ${style.title}`}>
          {conflict.conflictType}
        </span>
      </div>
      
      <p className={`text-sm ${style.description} mb-2`}>
        {message}
      </p>
      
      {showDetails && (
        <div className={`text-xs ${style.description} bg-white bg-opacity-50 rounded p-2`}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">기존 스케줄:</span>
              <br />
              {conflict.conflictingSchedule.startTime} - {conflict.conflictingSchedule.endTime}
            </div>
            <div>
              <span className="font-medium">충돌 시간:</span>
              <br />
              {conflict.conflictStartTime} - {conflict.conflictEndTime}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 충돌 알림 훅
 */
export const useConflictAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [alertProps, setAlertProps] = useState<Partial<ConflictAlertProps>>({});

  const showAlert = useCallback((
    conflictData: ScheduleConflict[],
    props: Partial<ConflictAlertProps> = {}
  ) => {
    setConflicts(conflictData);
    setAlertProps(props);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setConflicts([]);
    setAlertProps({});
  }, []);

  return {
    isVisible,
    conflicts,
    alertProps,
    showAlert,
    hideAlert,
  };
};

/**
 * 충돌 요약 정보 컴포넌트
 */
export const ConflictSummary: React.FC<{
  conflicts: ScheduleConflict[];
  className?: string;
}> = ({ conflicts, className = "" }) => {
  const conflictCounts = conflicts.reduce((counts, conflict) => {
    counts[conflict.conflictType] = (counts[conflict.conflictType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const totalDuration = conflicts.reduce((total, conflict) => {
    return total + conflict.conflictDurationMinutes;
  }, 0);

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h4 className="font-medium text-gray-900 mb-3">충돌 요약</h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">총 충돌 수:</span>
          <span className="ml-2 font-medium">{conflicts.length}개</span>
        </div>
        
        <div>
          <span className="text-gray-600">총 충돌 시간:</span>
          <span className="ml-2 font-medium">{totalDuration}분</span>
        </div>
      </div>
      
      {Object.entries(conflictCounts).length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-gray-600">
            충돌 유형별:
            {Object.entries(conflictCounts).map(([type, count]) => (
              <span key={type} className="ml-2">
                {type}: {count}개
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};