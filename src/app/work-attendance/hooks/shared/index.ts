// Shared hooks exports
export {
  useActionHandler,
  useMutationAction,
  useOptimisticAction,
  useFormAction,
  createActionConfig,
  AttendanceActionConfigs,
  type ActionHandlerConfig,
  type ActionHandlerState,
  type ActionHandlerResult,
} from "./useActionHandler";

export {
  useErrorHandler,
  createErrorConfig,
  AttendanceErrorConfigs,
  withErrorHandling,
  type ErrorType,
  type ErrorSeverity,
  type ErrorContext,
  type ErrorInfo,
  type ErrorHandlerConfig,
  type ErrorHandlerState,
  type ErrorHandlerResult,
} from "./useErrorHandler";