"use client";

import React from "react";
import {
  BaseButton,
  ButtonVariants,
  BaseButtonState,
} from "../../../components/BaseButton";

// Test action types
export type TestActionType = "get" | "post" | "put" | "delete" | "patch";

// Test action configuration
export interface TestActionConfig {
  label: string;
  description?: string;
  endpoint?: string;
  method?: TestActionType;
  payload?: any;
  expectedStatus?: number;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}

// Test action props
export interface TestActionButtonProps {
  config: TestActionConfig;
  onExecute: (config: TestActionConfig) => Promise<any>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * TestActionButton - API 테스트 액션을 위한 재사용 가능한 버튼 컴포넌트
 *
 * Features:
 * - 다양한 HTTP 메서드 지원
 * - 로딩 상태 관리
 * - 시각적 피드백
 * - 액션 설정 표시
 * - 에러 처리 통합
 */
export const TestActionButton: React.FC<TestActionButtonProps> = ({
  config,
  onExecute,
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const {
    label,
    description,
    method = "get",
    icon,
    variant = "primary",
  } = config;

  // Method에 따른 아이콘 결정
  const getMethodIcon = () => {
    if (icon) return icon;

    const iconMap = {
      get: "📥",
      post: "📤",
      put: "🔄",
      delete: "🗑️",
      patch: "✏️",
    };
    return iconMap[method];
  };

  // Method에 따른 버튼 variant 결정
  const getMethodVariant = () => {
    if (variant !== "primary") return variant;

    const variantMap = {
      get: "primary" as const,
      post: "success" as const,
      put: "warning" as const,
      delete: "danger" as const,
      patch: "secondary" as const,
    };
    return variantMap[method];
  };

  // 버튼 상태 생성
  const buttonState: BaseButtonState = {
    label,
    icon: getMethodIcon(),
    variant: getMethodVariant(),
    loading: isLoading,
    disabled: disabled,
    loadingText: "실행 중...",
  };

  const handleClick = async () => {
    if (!disabled && !isLoading) {
      try {
        await onExecute(config);
      } catch (error) {
        console.error("Test action failed:", error);
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <BaseButton
        buttonState={buttonState}
        onClick={handleClick}
        className="w-full"
        title={description || label}
      />

      {/* Action Details */}
      {(description || config.endpoint) && (
        <div className="text-xs text-gray-600 space-y-1">
          {description && <p className="italic">{description}</p>}
          {config.endpoint && (
            <div className="font-mono bg-gray-100 px-2 py-1 rounded">
              <span className={`font-bold ${getMethodColor()}`}>
                {method.toUpperCase()}
              </span>{" "}
              {config.endpoint}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function getMethodColor() {
    const colorMap = {
      get: "text-blue-600",
      post: "text-green-600",
      put: "text-orange-600",
      delete: "text-red-600",
      patch: "text-purple-600",
    };
    return colorMap[method];
  }
};

/**
 * TestActionGroup - 관련된 테스트 액션들을 그룹화하는 컴포넌트
 */
export interface TestActionGroupProps {
  title: string;
  description?: string;
  actions: TestActionConfig[];
  onExecute: (config: TestActionConfig) => Promise<any>;
  isLoading?: string; // 현재 로딩 중인 액션의 라벨
  className?: string;
}

export const TestActionGroup: React.FC<TestActionGroupProps> = ({
  title,
  description,
  actions,
  onExecute,
  isLoading,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {/* Group Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <TestActionButton
            key={index}
            config={action}
            onExecute={onExecute}
            isLoading={isLoading === action.label}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * TestActionGrid - 테스트 액션들을 그리드 형태로 표시하는 컴포넌트
 */
export interface TestActionGridProps {
  groups: Array<{
    title: string;
    description?: string;
    actions: TestActionConfig[];
  }>;
  onExecute: (config: TestActionConfig) => Promise<any>;
  isLoading?: string;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const TestActionGrid: React.FC<TestActionGridProps> = ({
  groups,
  onExecute,
  isLoading,
  columns = 2,
  className = "",
}) => {
  const getGridClass = () => {
    const gridMap = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };
    return gridMap[columns];
  };

  return (
    <div className={`grid ${getGridClass()} gap-6 ${className}`}>
      {groups.map((group, index) => (
        <TestActionGroup
          key={index}
          title={group.title}
          description={group.description}
          actions={group.actions}
          onExecute={onExecute}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

// Helper function to create test action configs
export const createTestAction = (
  label: string,
  options: Partial<TestActionConfig> = {}
): TestActionConfig => ({
  label,
  method: "get",
  variant: "primary",
  ...options,
});

// Common test action presets
export const TestActionPresets = {
  get: (label: string, endpoint: string, description?: string) =>
    createTestAction(label, { method: "get", endpoint, description }),

  post: (
    label: string,
    endpoint: string,
    payload?: any,
    description?: string
  ) =>
    createTestAction(label, { method: "post", endpoint, payload, description }),

  put: (label: string, endpoint: string, payload?: any, description?: string) =>
    createTestAction(label, { method: "put", endpoint, payload, description }),

  delete: (label: string, endpoint: string, description?: string) =>
    createTestAction(label, { method: "delete", endpoint, description }),

  patch: (
    label: string,
    endpoint: string,
    payload?: any,
    description?: string
  ) =>
    createTestAction(label, {
      method: "patch",
      endpoint,
      payload,
      description,
    }),
};
