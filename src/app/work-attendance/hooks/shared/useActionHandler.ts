"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Action handler configuration
export interface ActionHandlerConfig {
  showNotification?: boolean;
  showLoading?: boolean;
  invalidateQueries?: string[][] | string[];
  optimisticUpdate?: {
    queryKey: string[];
    updateFn: (oldData: any) => any;
  };
  retryCount?: number;
  retryDelay?: number;
}

// Action handler state
export interface ActionHandlerState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: any;
}

// Action handler result
export interface ActionHandlerResult<TParams, TResult> {
  state: ActionHandlerState;
  execute: (params: TParams) => Promise<TResult>;
  reset: () => void;
}

/**
 * useActionHandler - API 액션 처리를 추상화한 커스텀 훅
 * 
 * Features:
 * - 로딩, 성공, 에러 상태 자동 관리
 * - 쿼리 무효화 자동 처리
 * - 낙관적 업데이트 지원
 * - 재시도 로직 내장
 * - 알림 및 피드백 통합
 * - 타입 안전성 보장
 * 
 * @param actionFn - 실행할 액션 함수
 * @param config - 액션 핸들러 설정
 * @returns 액션 실행 함수 및 상태
 */
export function useActionHandler<TParams = void, TResult = any>(
  actionFn: (params: TParams) => Promise<TResult>,
  config: ActionHandlerConfig = {}
): ActionHandlerResult<TParams, TResult> {
  
  const {
    showNotification = false,
    showLoading = true,
    invalidateQueries = [],
    optimisticUpdate,
    retryCount = 0,
    retryDelay = 1000,
  } = config;

  const queryClient = useQueryClient();

  // State management
  const [state, setState] = useState<ActionHandlerState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: null,
  });

  // Reset state
  const reset = () => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
    });
  };

  // Execute action with retry logic
  const executeWithRetry = async (
    params: TParams,
    remainingRetries: number = retryCount
  ): Promise<TResult> => {
    try {
      const result = await actionFn(params);
      return result;
    } catch (error) {
      if (remainingRetries > 0) {
        console.log(`Retrying action, ${remainingRetries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry(params, remainingRetries - 1);
      }
      throw error;
    }
  };

  // Main execute function
  const execute = async (params: TParams): Promise<TResult> => {
    // Reset previous state
    setState(prev => ({
      ...prev,
      isLoading: showLoading,
      isSuccess: false,
      isError: false,
      error: null,
    }));

    try {
      // Apply optimistic update if configured
      if (optimisticUpdate) {
        queryClient.setQueryData(
          optimisticUpdate.queryKey,
          optimisticUpdate.updateFn
        );
      }

      // Execute the action
      const result = await executeWithRetry(params);

      // Update success state
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
        data: result,
      }));

      // Invalidate specified queries
      if (invalidateQueries.length > 0) {
        for (const queryKey of invalidateQueries) {
          await queryClient.invalidateQueries({ 
            queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
          });
        }
      }

      // Show success notification if configured
      if (showNotification) {
        // This would integrate with your notification system
        console.log("Action completed successfully");
      }

      return result;

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Update error state
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: errorObj,
      }));

      // Revert optimistic update if it was applied
      if (optimisticUpdate) {
        queryClient.invalidateQueries({ 
          queryKey: optimisticUpdate.queryKey 
        });
      }

      throw errorObj;
    }
  };

  return {
    state,
    execute,
    reset,
  };
}

// Specialized action handlers for common patterns

/**
 * useMutationAction - TanStack Query mutation과 유사한 인터페이스
 */
export function useMutationAction<TParams, TResult>(
  mutationFn: (params: TParams) => Promise<TResult>,
  config: ActionHandlerConfig = {}
) {
  const actionHandler = useActionHandler(mutationFn, config);

  return {
    ...actionHandler.state,
    mutate: actionHandler.execute,
    mutateAsync: actionHandler.execute,
    reset: actionHandler.reset,
  };
}

/**
 * useOptimisticAction - 낙관적 업데이트에 최적화된 액션 핸들러
 */
export function useOptimisticAction<TParams, TResult>(
  actionFn: (params: TParams) => Promise<TResult>,
  optimisticConfig: {
    queryKey: string[];
    updateFn: (oldData: any, params: TParams) => any;
    rollbackFn?: (oldData: any) => any;
  },
  config: Omit<ActionHandlerConfig, 'optimisticUpdate'> = {}
) {
  const queryClient = useQueryClient();

  const actionHandler = useActionHandler(actionFn, {
    ...config,
    optimisticUpdate: {
      queryKey: optimisticConfig.queryKey,
      updateFn: (oldData) => optimisticConfig.updateFn(oldData, {} as TParams),
    },
  });

  const execute = async (params: TParams): Promise<TResult> => {
    // Store original data for potential rollback
    const originalData = queryClient.getQueryData(optimisticConfig.queryKey);

    try {
      // Apply optimistic update with actual params
      queryClient.setQueryData(
        optimisticConfig.queryKey,
        (oldData: any) => optimisticConfig.updateFn(oldData, params)
      );

      return await actionHandler.execute(params);
    } catch (error) {
      // Rollback to original data or use custom rollback function
      if (optimisticConfig.rollbackFn && originalData) {
        queryClient.setQueryData(
          optimisticConfig.queryKey,
          optimisticConfig.rollbackFn(originalData)
        );
      } else {
        queryClient.setQueryData(optimisticConfig.queryKey, originalData);
      }
      throw error;
    }
  };

  return {
    ...actionHandler.state,
    execute,
    reset: actionHandler.reset,
  };
}

/**
 * useFormAction - 폼 제출에 최적화된 액션 핸들러
 */
export function useFormAction<TFormData, TResult>(
  submitFn: (formData: TFormData) => Promise<TResult>,
  config: ActionHandlerConfig & {
    resetFormOnSuccess?: boolean;
    validationFn?: (formData: TFormData) => string[] | null;
  } = {}
) {
  const { validationFn, resetFormOnSuccess, ...actionConfig } = config;
  const actionHandler = useActionHandler(submitFn, actionConfig);

  const submit = async (formData: TFormData): Promise<TResult> => {
    // Validate form data if validation function is provided
    if (validationFn) {
      const validationErrors = validationFn(formData);
      if (validationErrors && validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
    }

    const result = await actionHandler.execute(formData);

    // Reset form on success if configured
    if (resetFormOnSuccess) {
      // This would integrate with your form state management
      console.log("Form should be reset");
    }

    return result;
  };

  return {
    ...actionHandler.state,
    submit,
    reset: actionHandler.reset,
  };
}

// Helper functions for common action patterns

/**
 * createActionConfig - 일반적인 액션 설정을 위한 헬퍼 함수
 */
export const createActionConfig = (
  options: Partial<ActionHandlerConfig> = {}
): ActionHandlerConfig => ({
  showNotification: false,
  showLoading: true,
  invalidateQueries: [],
  retryCount: 0,
  retryDelay: 1000,
  ...options,
});

/**
 * AttendanceActionConfigs - 출근 관련 액션들의 공통 설정
 */
export const AttendanceActionConfigs = {
  clockIn: (queryKeys: string[][] = []) => createActionConfig({
    invalidateQueries: [
      ["attendance", "today"],
      ["attendance", "active"],
      ["attendance", "daily"],
      ...queryKeys,
    ],
    showNotification: true,
    retryCount: 2,
  }),

  clockOut: (queryKeys: string[][] = []) => createActionConfig({
    invalidateQueries: [
      ["attendance", "today"],
      ["attendance", "active"], 
      ["attendance", "daily"],
      ...queryKeys,
    ],
    showNotification: true,
    retryCount: 2,
  }),

  additionalWork: (queryKeys: string[][] = []) => createActionConfig({
    invalidateQueries: [
      ["attendance", "today"],
      ["attendance", "additional"],
      ...queryKeys,
    ],
    showNotification: true,
    retryCount: 1,
  }),
};