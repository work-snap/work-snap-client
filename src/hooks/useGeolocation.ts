"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// 위치 정보 타입
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

// 위치 에러 타입
export interface LocationError {
  code: number;
  message: string;
  type: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN";
}

// 위치 상태 타입
export interface LocationState {
  location: LocationData | null;
  error: LocationError | null;
  loading: boolean;
  supported: boolean;
  permissionStatus: "granted" | "denied" | "prompt" | "unknown";
}

// 옵션 타입
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  autoRequest?: boolean;
}

// 기본 옵션
const DEFAULT_OPTIONS: Required<GeolocationOptions> = {
  enableHighAccuracy: true,
  timeout: 15000, // 15초
  maximumAge: 300000, // 5분
  watchPosition: false,
  autoRequest: true,
};

/**
 * Geolocation API를 사용한 위치 정보 관리 훅
 * GPS 기반 위치 인증을 위한 포괄적인 위치 서비스
 */
export const useGeolocation = (options: GeolocationOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const watchIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 상태 관리
  const [state, setState] = useState<LocationState>({
    location: null,
    error: null,
    loading: false,
    supported: typeof navigator !== "undefined" && "geolocation" in navigator,
    permissionStatus: "unknown",
  });

  // 에러 메시지 생성
  const createLocationError = useCallback((error: GeolocationPositionError): LocationError => {
    let type: LocationError["type"];
    let message: string;

    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        type = "PERMISSION_DENIED";
        message = "위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
        break;
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        type = "POSITION_UNAVAILABLE";
        message = "위치 정보를 사용할 수 없습니다. GPS가 켜져있는지 확인해주세요.";
        break;
      case GeolocationPositionError.TIMEOUT:
        type = "TIMEOUT";
        message = "위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.";
        break;
      default:
        type = "UNKNOWN";
        message = "알 수 없는 오류가 발생했습니다.";
    }

    return {
      code: error.code,
      message,
      type,
    };
  }, []);

  // 위치 정보 성공 콜백
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    setState(prev => ({
      ...prev,
      location: locationData,
      error: null,
      loading: false,
    }));

    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 위치 정보 실패 콜백
  const handleError = useCallback((error: GeolocationPositionError) => {
    const locationError = createLocationError(error);

    setState(prev => ({
      ...prev,
      location: null,
      error: locationError,
      loading: false,
    }));

    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [createLocationError]);

  // 권한 상태 확인
  const checkPermissionStatus = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionStatus: "unknown" }));
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      setState(prev => ({ ...prev, permissionStatus: permission.state }));

      // 권한 상태 변경 감지
      permission.onchange = () => {
        setState(prev => ({ ...prev, permissionStatus: permission.state }));
      };
    } catch (error) {
      console.warn("권한 상태 확인 실패:", error);
      setState(prev => ({ ...prev, permissionStatus: "unknown" }));
    }
  }, []);

  // 위치 정보 요청
  const getCurrentPosition = useCallback(async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!state.supported) {
        reject(new Error("Geolocation이 지원되지 않는 브라우저입니다."));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      // 커스텀 타임아웃 설정
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: {
            code: GeolocationPositionError.TIMEOUT,
            message: "위치 정보 요청 시간이 초과되었습니다.",
            type: "TIMEOUT",
          },
        }));
        reject(new Error("Timeout"));
      }, config.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          
          handleSuccess(position);
          resolve(locationData);
        },
        (error) => {
          handleError(error);
          reject(createLocationError(error));
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge,
        }
      );
    });
  }, [state.supported, config, handleSuccess, handleError, createLocationError]);

  // 위치 추적 시작
  const startWatching = useCallback(() => {
    if (!state.supported || watchIdRef.current !== null) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: config.enableHighAccuracy,
        timeout: config.timeout,
        maximumAge: config.maximumAge,
      }
    );
  }, [state.supported, config, handleSuccess, handleError]);

  // 위치 추적 중지
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState(prev => ({ ...prev, loading: false }));

    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 위치 정보 새로고침
  const refresh = useCallback(async () => {
    try {
      await getCurrentPosition();
    } catch (error) {
      console.error("위치 정보 새로고침 실패:", error);
    }
  }, [getCurrentPosition]);

  // 두 위치 간 거리 계산 (Haversine 공식)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // 지구 반지름 (미터)
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // 미터 단위
    },
    []
  );

  // 특정 위치로부터의 거리 확인
  const isWithinRange = useCallback(
    (targetLat: number, targetLon: number, maxDistance: number): boolean => {
      if (!state.location) return false;

      const distance = calculateDistance(
        state.location.latitude,
        state.location.longitude,
        targetLat,
        targetLon
      );

      return distance <= maxDistance;
    },
    [state.location, calculateDistance]
  );

  // 위치 정확도 상태 반환
  const getAccuracyStatus = useCallback((): "high" | "medium" | "low" | "unknown" => {
    if (!state.location) return "unknown";

    const accuracy = state.location.accuracy;
    if (accuracy <= 10) return "high";
    if (accuracy <= 50) return "medium";
    return "low";
  }, [state.location]);

  // 초기화 및 자동 요청
  useEffect(() => {
    checkPermissionStatus();

    if (config.autoRequest && state.supported) {
      if (config.watchPosition) {
        startWatching();
      } else {
        getCurrentPosition().catch(console.error);
      }
    }

    return () => {
      stopWatching();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config.autoRequest, config.watchPosition, state.supported, checkPermissionStatus, startWatching, getCurrentPosition, stopWatching]);

  return {
    // 상태
    ...state,
    
    // 액션
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearError,
    refresh,
    
    // 유틸리티
    calculateDistance,
    isWithinRange,
    getAccuracyStatus,
    
    // 상태 확인
    isWatching: watchIdRef.current !== null,
    hasLocation: state.location !== null,
    hasError: state.error !== null,
    
    // 권한 관련
    needsPermission: state.permissionStatus === "prompt" || state.permissionStatus === "denied",
    hasPermission: state.permissionStatus === "granted",
  };
};

// 위치 정보 포맷 유틸리티
export const locationHelpers = {
  /**
   * 위도/경도를 문자열로 포맷팅
   */
  formatCoordinates(latitude: number, longitude: number, precision = 6): string {
    return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
  },

  /**
   * 정확도를 사용자 친화적 문자열로 변환
   */
  formatAccuracy(accuracy: number): string {
    if (accuracy <= 5) return `매우 정확 (±${accuracy.toFixed(1)}m)`;
    if (accuracy <= 20) return `정확 (±${accuracy.toFixed(1)}m)`;
    if (accuracy <= 100) return `보통 (±${accuracy.toFixed(0)}m)`;
    return `부정확 (±${accuracy.toFixed(0)}m)`;
  },

  /**
   * 거리를 사용자 친화적 문자열로 변환
   */
  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${distance.toFixed(0)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  },

  /**
   * 타임스탬프를 시간 문자열로 변환
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  },

  /**
   * 위치 데이터가 신선한지 확인 (기본 5분)
   */
  isLocationFresh(timestamp: number, maxAge = 300000): boolean {
    return Date.now() - timestamp <= maxAge;
  },

  /**
   * 에러 타입별 사용자 안내 메시지
   */
  getErrorGuidance(error: LocationError): string {
    switch (error.type) {
      case "PERMISSION_DENIED":
        return "브라우저 주소창의 자물쇠 아이콘을 클릭하여 위치 권한을 허용해주세요.";
      case "POSITION_UNAVAILABLE":
        return "GPS를 켜거나 WiFi에 연결하여 위치 서비스를 활성화해주세요.";
      case "TIMEOUT":
        return "실외로 이동하거나 잠시 후 다시 시도해주세요.";
      default:
        return "설정을 확인하거나 잠시 후 다시 시도해주세요.";
    }
  },
};