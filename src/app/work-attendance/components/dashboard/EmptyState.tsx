"use client";

import React from "react";
import { BaseButton, ButtonVariants } from "../base";

interface EmptyStateProps {
  date: string;
  onRefresh?: () => void;
  className?: string;
}

/**
 * EmptyState - 데이터가 없을 때 표시하는 컴포넌트
 * 
 * Features:
 * - 날짜별 메시지 표시
 * - 새로고침 기능
 * - 사용자 친화적인 안내
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  date,
  onRefresh,
  className = "",
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getEmptyMessage = () => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (date === today) {
      return {
        title: "오늘 등록된 근무 일정이 없습니다",
        description: "새로운 근무 일정을 등록하거나 관리자에게 문의하세요.",
        icon: "📅",
      };
    } else if (date === tomorrowStr) {
      return {
        title: "내일 등록된 근무 일정이 없습니다",
        description: "내일의 근무 일정이 아직 등록되지 않았습니다.",
        icon: "📆",
      };
    } else {
      return {
        title: "근무 일정이 없습니다",
        description: `${formatDate(date)}에 등록된 근무 일정이 없습니다.`,
        icon: "📋",
      };
    }
  };

  const { title, description, icon } = getEmptyMessage();

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Icon */}
      <div className="text-6xl mb-4" role="img" aria-label="빈 상태">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {/* Actions */}
      <div className="space-y-3">
        {onRefresh && (
          <BaseButton
            buttonState={ButtonVariants.secondary("새로고침", {
              icon: "🔄",
              size: "md",
            })}
            onClick={onRefresh}
            className="mx-auto"
          />
        )}

        {date === new Date().toISOString().split("T")[0] && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              근무 일정을 추가하려면 관리자에게 문의하세요
            </p>
            <div className="flex justify-center space-x-2 text-xs text-gray-400">
              <span>💡 도움이 필요하신가요?</span>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          📞 문의 방법
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• 관리자에게 근무 일정 등록 요청</p>
          <p>• 기존 일정 수정이 필요한 경우 문의</p>
          <p>• 시스템 관련 문제 신고</p>
        </div>
      </div>
    </div>
  );
};