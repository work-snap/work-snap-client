"use client";

import { useState, useCallback, useRef } from "react";

// Error types
export type ErrorType = "network" | "validation" | "auth" | "server" | "client" | "unknown";
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error context interface
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

// Error information interface
export interface ErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: ErrorContext;
  timestamp: Date;
  retryCount?: number;
  isRetryable?: boolean;
}

// Error handler configuration
export interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  showNotification?: boolean;
  logErrors?: boolean;
  reportErrors?: boolean;
  fallbackMessage?: string;
  onError?: (errorInfo: ErrorInfo) => void;
  onRetry?: (errorInfo: ErrorInfo, attempt: number) => void;
  onMaxRetriesReached?: (errorInfo: ErrorInfo) => void;
}

// Error handler state
export interface ErrorHandlerState {
  errors: ErrorInfo[];
  lastError: ErrorInfo | null;
  hasErrors: boolean;
  isRetrying: boolean;
}

// Error handler result
export interface ErrorHandlerResult {
  state: ErrorHandlerState;
  handleError: (error: Error | string, context?: Partial<ErrorContext>) => ErrorInfo;
  retry: (errorId: string, actionFn: () => Promise<any>) => Promise<any>;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  getErrorsByType: (type: ErrorType) => ErrorInfo[];
  getErrorsBySeverity: (severity: ErrorSeverity) => ErrorInfo[];
}

/**
 * useErrorHandler - 에러 처리를 추상화한 커스텀 훅
 * 
 * Features:
 * - 다양한 에러 타입 및 심각도 분류
 * - 에러 컨텍스트 추적
 * - 자동 재시도 로직
 * - 에러 로깅 및 리포팅
 * - 알림 및 피드백 통합
 * - 에러 기록 관리
 * 
 * @param config - 에러 핸들러 설정
 * @returns 에러 처리 함수 및 상태
 */
export function useErrorHandler(
  config: ErrorHandlerConfig = {}
): ErrorHandlerResult {
  
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showNotification = true,
    logErrors = true,
    reportErrors = false,
    fallbackMessage = "예기치 않은 오류가 발생했습니다.",
    onError,
    onRetry,
    onMaxRetriesReached,
  } = config;

  // State management
  const [state, setState] = useState<ErrorHandlerState>({
    errors: [],
    lastError: null,
    hasErrors: false,
    isRetrying: false,
  });

  // Error ID generator
  const errorIdCounter = useRef(0);
  const generateErrorId = () => `error_${Date.now()}_${++errorIdCounter.current}`;

  // Error type detection
  const detectErrorType = (error: Error | string): ErrorType => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = typeof error === 'string' ? '' : error.name;

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return "network";
    }
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return "validation";
    }
    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return "auth";
    }
    if (errorMessage.includes('server') || errorName === 'InternalError') {
      return "server";
    }
    if (errorName === 'TypeError' || errorName === 'ReferenceError') {
      return "client";
    }
    return "unknown";
  };

  // Error severity detection
  const detectErrorSeverity = (type: ErrorType, error: Error | string): ErrorSeverity => {
    switch (type) {
      case "auth":
      case "server":
        return "high";
      case "network":
        return "medium";
      case "validation":
        return "low";
      case "client":
        return "critical";
      default:
        return "medium";
    }
  };

  // Check if error is retryable
  const isRetryableError = (type: ErrorType): boolean => {
    return ["network", "server"].includes(type);
  };

  // Generate user-friendly error message
  const generateUserMessage = (type: ErrorType, originalMessage: string): string => {
    const messageMap: Record<ErrorType, string> = {
      network: "네트워크 연결을 확인해주세요.",
      validation: "입력하신 정보를 다시 확인해주세요.",
      auth: "인증이 필요합니다. 다시 로그인해주세요.",
      server: "서버에 일시적인 문제가 발생했습니다.",
      client: "애플리케이션 오류가 발생했습니다.",
      unknown: fallbackMessage,
    };

    return messageMap[type] || fallbackMessage;
  };

  // Log error
  const logError = (errorInfo: ErrorInfo) => {
    if (logErrors) {
      console.group(`🚨 Error [${errorInfo.severity.toUpperCase()}]`);
      console.error("Message:", errorInfo.message);
      console.error("Type:", errorInfo.type);
      console.error("Context:", errorInfo.context);
      if (errorInfo.originalError) {
        console.error("Original Error:", errorInfo.originalError);
      }
      console.groupEnd();
    }
  };

  // Report error (would integrate with error reporting service)
  const reportError = (errorInfo: ErrorInfo) => {
    if (reportErrors) {
      // This would send to your error reporting service (Sentry, Bugsnag, etc.)
      console.log("📊 Reporting error to monitoring service:", errorInfo);
    }
  };

  // Show notification
  const showErrorNotification = (errorInfo: ErrorInfo) => {
    if (showNotification) {
      // This would integrate with your notification system
      console.log("🔔 Error notification:", errorInfo.message);
    }
  };

  // Main error handler
  const handleError = useCallback((
    error: Error | string, 
    context: Partial<ErrorContext> = {}
  ): ErrorInfo => {
    const type = detectErrorType(error);
    const severity = detectErrorSeverity(type, error);
    const originalError = error instanceof Error ? error : undefined;
    const message = generateUserMessage(type, typeof error === 'string' ? error : error.message);

    const errorInfo: ErrorInfo = {
      id: generateErrorId(),
      type,
      severity,
      message,
      originalError,
      context: {
        timestamp: new Date(),
        ...context,
      },
      timestamp: new Date(),
      retryCount: 0,
      isRetryable: isRetryableError(type),
    };

    // Update state
    setState(prev => ({
      errors: [...prev.errors, errorInfo],
      lastError: errorInfo,
      hasErrors: true,
      isRetrying: false,
    }));

    // Log error
    logError(errorInfo);

    // Report error
    reportError(errorInfo);

    // Show notification
    showErrorNotification(errorInfo);

    // Call custom error handler
    if (onError) {
      onError(errorInfo);
    }

    return errorInfo;
  }, [onError, logErrors, reportErrors, showNotification]);

  // Retry function
  const retry = useCallback(async (
    errorId: string, 
    actionFn: () => Promise<any>
  ): Promise<any> => {
    const errorInfo = state.errors.find(e => e.id === errorId);
    if (!errorInfo || !errorInfo.isRetryable) {
      throw new Error("Error is not retryable");
    }

    if ((errorInfo.retryCount || 0) >= maxRetries) {
      if (onMaxRetriesReached) {
        onMaxRetriesReached(errorInfo);
      }
      throw new Error("Maximum retry attempts reached");
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
    }));

    try {
      // Call retry callback
      if (onRetry) {
        onRetry(errorInfo, (errorInfo.retryCount || 0) + 1);
      }

      // Wait for retry delay
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      // Execute action
      const result = await actionFn();

      // Update error info to mark as resolved
      setState(prev => ({
        ...prev,
        errors: prev.errors.map(e => 
          e.id === errorId 
            ? { ...e, retryCount: (e.retryCount || 0) + 1 }
            : e
        ),
        isRetrying: false,
      }));

      return result;

    } catch (retryError) {
      // Update retry count
      setState(prev => ({
        ...prev,
        errors: prev.errors.map(e => 
          e.id === errorId 
            ? { ...e, retryCount: (e.retryCount || 0) + 1 }
            : e
        ),
        isRetrying: false,
      }));

      throw retryError;
    }
  }, [state.errors, maxRetries, retryDelay, onRetry, onMaxRetriesReached]);

  // Clear specific error
  const clearError = useCallback((errorId: string) => {
    setState(prev => {
      const newErrors = prev.errors.filter(e => e.id !== errorId);
      return {
        ...prev,
        errors: newErrors,
        hasErrors: newErrors.length > 0,
        lastError: newErrors.length > 0 ? newErrors[newErrors.length - 1] : null,
      };
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setState({
      errors: [],
      lastError: null,
      hasErrors: false,
      isRetrying: false,
    });
  }, []);

  // Get errors by type
  const getErrorsByType = useCallback((type: ErrorType): ErrorInfo[] => {
    return state.errors.filter(error => error.type === type);
  }, [state.errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity): ErrorInfo[] => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);

  return {
    state,
    handleError,
    retry,
    clearError,
    clearAllErrors,
    getErrorsByType,
    getErrorsBySeverity,
  };
}

// Helper functions for common error handling patterns

/**
 * createErrorConfig - 일반적인 에러 핸들러 설정을 위한 헬퍼 함수
 */
export const createErrorConfig = (
  options: Partial<ErrorHandlerConfig> = {}
): ErrorHandlerConfig => ({
  maxRetries: 3,
  retryDelay: 1000,
  showNotification: true,
  logErrors: true,
  reportErrors: false,
  fallbackMessage: "예기치 않은 오류가 발생했습니다.",
  ...options,
});

/**
 * AttendanceErrorConfigs - 출근 관련 에러 처리 설정
 */
export const AttendanceErrorConfigs = {
  clockIn: () => createErrorConfig({
    maxRetries: 2,
    retryDelay: 2000,
    fallbackMessage: "출근 처리 중 오류가 발생했습니다.",
  }),

  clockOut: () => createErrorConfig({
    maxRetries: 2,
    retryDelay: 2000,
    fallbackMessage: "퇴근 처리 중 오류가 발생했습니다.",
  }),

  dataFetch: () => createErrorConfig({
    maxRetries: 3,
    retryDelay: 1000,
    fallbackMessage: "데이터를 불러오는 중 오류가 발생했습니다.",
  }),

  validation: () => createErrorConfig({
    maxRetries: 0,
    showNotification: true,
    fallbackMessage: "입력 정보를 확인해주세요.",
  }),
};

/**
 * withErrorHandling - 함수를 에러 처리로 감싸는 HOF
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler: (error: Error) => void,
  context?: Partial<ErrorContext>
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Promise인 경우 catch 처리
      if (result instanceof Promise) {
        return result.catch((error) => {
          errorHandler(error);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }) as T;
}