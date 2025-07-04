"use client";

import React from "react";
import { BaseButton, ButtonVariants } from "../base";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState - 에러 상태를 표시하는 컴포넌트
 * 
 * Features:
 * - 에러 타입별 메시지 표시
 * - 재시도 기능
 * - 사용자 친화적인 에러 안내
 * - 문제 해결 가이드
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  className = "",
}) => {
  // 에러 타입별 메시지 생성
  const getErrorInfo = () => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: "네트워크 연결 오류",
        description: "인터넷 연결을 확인하고 다시 시도해주세요.",
        icon: "🌐",
        solutions: [
          "인터넷 연결 상태 확인",
          "Wi-Fi 또는 모바일 데이터 재연결",
          "잠시 후 다시 시도",
        ],
      };
    }

    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return {
        title: "접근 권한 오류",
        description: "로그인이 필요하거나 권한이 없습니다.",
        icon: "🔒",
        solutions: [
          "다시 로그인 시도",
          "관리자에게 권한 요청",
          "계정 상태 확인",
        ],
      };
    }

    if (errorMessage.includes('server') || errorMessage.includes('500')) {
      return {
        title: "서버 오류",
        description: "서버에 일시적인 문제가 발생했습니다.",
        icon: "🔧",
        solutions: [
          "잠시 후 다시 시도",
          "문제가 지속되면 관리자 문의",
          "서버 상태 확인",
        ],
      };
    }

    if (errorMessage.includes('timeout')) {
      return {
        title: "응답 시간 초과",
        description: "서버 응답 시간이 초과되었습니다.",
        icon: "⏰",
        solutions: [
          "네트워크 상태 확인",
          "잠시 후 다시 시도",
          "페이지 새로고침",
        ],
      };
    }

    // 기본 에러 메시지
    return {
      title: "데이터 로딩 실패",
      description: "데이터를 불러오는 중 오류가 발생했습니다.",
      icon: "😔",
      solutions: [
        "페이지 새로고침",
        "잠시 후 다시 시도",
        "문제가 지속되면 관리자 문의",
      ],
    };
  };

  const { title, description, icon, solutions } = getErrorInfo();

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Icon */}
      <div className="text-6xl mb-4" role="img" aria-label="에러">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-red-600 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <div className="mb-6">
          <BaseButton
            buttonState={ButtonVariants.primary("다시 시도", {
              icon: "🔄",
              size: "md",
            })}
            onClick={onRetry}
            className="mx-auto"
          />
        </div>
      )}

      {/* Error Details (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-6 text-left max-w-md mx-auto">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            🔍 개발자 정보 (클릭하여 펼치기)
          </summary>
          <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-700 font-mono">
            <div className="mb-2">
              <strong>Error Name:</strong> {error.name}
            </div>
            <div className="mb-2">
              <strong>Error Message:</strong> {error.message}
            </div>
            {error.stack && (
              <div>
                <strong>Stack Trace:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Solutions */}
      <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
        <h4 className="text-sm font-medium text-blue-700 mb-3">
          💡 해결 방법
        </h4>
        <ul className="text-xs text-blue-600 space-y-1 text-left">
          {solutions.map((solution, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{solution}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Support */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          📞 문제가 지속되나요?
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• 관리자에게 문의하여 기술 지원 요청</p>
          <p>• 에러 메시지와 발생 시간을 함께 전달</p>
          <p>• 사용 중인 브라우저 및 기기 정보 제공</p>
        </div>
      </div>
    </div>
  );
};