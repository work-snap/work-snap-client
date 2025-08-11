/**
 * 에러 처리 유틸리티
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export const formatErrorMessage = (error: unknown): string => {
  if (!error) return "알 수 없는 오류가 발생했습니다.";

  // 문자열 에러
  if (typeof error === "string") {
    return error;
  }

  // Error 객체
  if (error instanceof Error) {
    return error.message || "오류가 발생했습니다.";
  }

  // API 에러 객체
  if (typeof error === "object" && error !== null) {
    const apiError = error as any;
    
    if (apiError.message) {
      return apiError.message;
    }
    
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    
    if (apiError.status) {
      return getErrorMessageByStatus(apiError.status);
    }
  }

  return "알 수 없는 오류가 발생했습니다.";
};

/**
 * HTTP 상태 코드별 에러 메시지
 */
export const getErrorMessageByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return "잘못된 요청입니다.";
    case 401:
      return "인증이 필요합니다.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다.";
    case 408:
      return "요청 시간이 초과되었습니다.";
    case 409:
      return "데이터 충돌이 발생했습니다.";
    case 422:
      return "입력된 데이터가 유효하지 않습니다.";
    case 429:
      return "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.";
    case 500:
      return "서버 오류가 발생했습니다.";
    case 502:
      return "게이트웨이 오류가 발생했습니다.";
    case 503:
      return "서비스를 사용할 수 없습니다.";
    case 504:
      return "게이트웨이 시간 초과가 발생했습니다.";
    default:
      return `HTTP 오류 (${status})`;
  }
};

/**
 * 네트워크 오류 여부 확인
 */
export const isNetworkError = (error: unknown): boolean => {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    return (
      err.code === "NETWORK_ERROR" ||
      err.message?.includes("network") ||
      err.message?.includes("fetch") ||
      !navigator.onLine
    );
  }
  return false;
};

/**
 * 재시도 가능한 오류 여부 확인
 */
export const isRetryableError = (error: unknown): boolean => {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    const status = err.status || err.response?.status;
    
    // 네트워크 오류는 재시도 가능
    if (isNetworkError(error)) {
      return true;
    }
    
    // 5xx 서버 오류는 재시도 가능
    if (status >= 500 && status < 600) {
      return true;
    }
    
    // 408, 429는 재시도 가능
    if (status === 408 || status === 429) {
      return true;
    }
  }
  
  return false;
};

/**
 * 에러 로깅
 */
export const logError = (error: unknown, context?: string) => {
  const errorMessage = formatErrorMessage(error);
  const logContext = context ? `[${context}]` : "";
  
  console.error(`${logContext} ${errorMessage}`, error);
  
  // 운영 환경에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === "production") {
    // 예: Sentry, LogRocket 등
    // sentryLogger.captureException(error, { extra: { context } });
  }
};

/**
 * 에러 토스트 표시용 설정
 */
export interface ErrorToastConfig {
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

/**
 * 에러를 토스트 설정으로 변환
 */
export const errorToToastConfig = (
  error: unknown,
  context?: string
): ErrorToastConfig => {
  const message = formatErrorMessage(error);
  const isRetryable = isRetryableError(error);
  
  return {
    title: "오류 발생",
    message,
    duration: isRetryable ? 5000 : 3000,
    ...(isRetryable && {
      action: {
        label: "다시 시도",
        handler: () => {
          // 재시도 로직은 컴포넌트에서 처리
        },
      },
    }),
  };
};

/**
 * 에러 복구 전략
 */
export const getErrorRecoveryStrategy = (error: unknown) => {
  if (isNetworkError(error)) {
    return {
      type: "RETRY" as const,
      message: "네트워크 연결을 확인하고 다시 시도해주세요.",
      retryDelay: 2000,
    };
  }
  
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    const status = err.status || err.response?.status;
    
    switch (status) {
      case 401:
        return {
          type: "REDIRECT" as const,
          message: "로그인이 필요합니다.",
          redirectUrl: "/login",
        };
      
      case 403:
        return {
          type: "FALLBACK" as const,
          message: "접근 권한이 없습니다.",
        };
      
      case 429:
        return {
          type: "RETRY" as const,
          message: "잠시 후 다시 시도해주세요.",
          retryDelay: 5000,
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: "RETRY" as const,
          message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          retryDelay: 3000,
        };
    }
  }
  
  return {
    type: "FALLBACK" as const,
    message: "오류가 발생했습니다.",
  };
};