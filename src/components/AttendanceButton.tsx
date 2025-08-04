"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { useGeolocation, LocationData, locationHelpers } from "@/hooks/useGeolocation";
import { locationService, LocationAuthResponse, WorkplaceLocation } from "@/services/locationService";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { isToday } from "@/utils/dateUtils";

// 출석 버튼 타입
export type AttendanceType = "CHECK_IN" | "CHECK_OUT";

// 버튼 상태 타입
export type ButtonState = 
  | "READY"           // 준비됨 (클릭 가능)
  | "LOADING"         // 위치 확인 중
  | "AUTHENTICATING"  // GPS 인증 중
  | "DISABLED"        // 비활성화
  | "SUCCESS"         // 성공
  | "ERROR";          // 오류

// 출석 정보 타입
export interface AttendanceInfo {
  employeeId: string;
  employeeName: string;
  workDate: Date;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  workplaceId?: string;
  workplaceName?: string;
}

interface AttendanceButtonProps {
  type: AttendanceType;
  attendanceInfo: AttendanceInfo;
  onSuccess?: (result: LocationAuthResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  showLocationInfo?: boolean;
  requireLocationAuth?: boolean;
  autoRequestLocation?: boolean;
  isEarlyMode?: boolean; // 조기 출근 모드 여부
}

/**
 * GPS 인증이 통합된 출근/퇴근 버튼 컴포넌트
 * 위치 확인, GPS 인증, 출석 처리를 모두 담당
 */
export const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  type,
  attendanceInfo,
  onSuccess,
  onError,
  className = "",
  disabled = false,
  showLocationInfo = true,
  requireLocationAuth = true,
  autoRequestLocation = true,
  isEarlyMode = false,
}) => {
  const { currentTime } = useCurrentTime();
  const [buttonState, setButtonState] = useState<ButtonState>("READY");
  const [authResult, setAuthResult] = useState<LocationAuthResponse | null>(null);
  const [workplaces, setWorkplaces] = useState<WorkplaceLocation[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceLocation | null>(null);

  // 위치 정보 훅
  const {
    location,
    error: locationError,
    loading: locationLoading,
    getCurrentPosition,
    hasPermission,
    needsPermission,
    getAccuracyStatus,
    isWithinRange,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000, // 1분
    autoRequest: autoRequestLocation,
  });

  // 출근/퇴근 가능 여부 판단
  const canPerformAttendance = useMemo(() => {
    if (disabled || !isToday(attendanceInfo.workDate)) return false;

    if (type === "CHECK_IN") {
      // 이미 출근했으면 불가
      return !attendanceInfo.actualStartTime;
    } else {
      // 출근하지 않았거나 이미 퇴근했으면 불가
      return attendanceInfo.actualStartTime && !attendanceInfo.actualEndTime;
    }
  }, [type, attendanceInfo, disabled]);

  // 지각 상황 판단
  const isLateCheckIn = useMemo(() => {
    if (type !== "CHECK_IN" || isEarlyMode) return false;
    if (!attendanceInfo.scheduledStartTime) return false;
    
    try {
      const scheduleTime = new Date(`${attendanceInfo.workDate.toISOString().split('T')[0]}T${attendanceInfo.scheduledStartTime}`);
      return currentTime > scheduleTime;
    } catch (error) {
      console.error("시간 비교 오류:", error);
      return false;
    }
  }, [currentTime, attendanceInfo.scheduledStartTime, attendanceInfo.workDate, type, isEarlyMode]);

  // 버튼 라벨 생성
  const getButtonLabel = useCallback((isLate: boolean = false) => {
    switch (buttonState) {
      case "LOADING":
        return "위치 확인 중...";
      case "AUTHENTICATING":
        return "GPS 인증 중...";
      case "SUCCESS":
        return type === "CHECK_IN" ? "출근 완료" : "퇴근 완료";
      case "ERROR":
        return "다시 시도";
      case "DISABLED":
        return type === "CHECK_IN" ? "출근 불가" : "퇴근 불가";
      default:
        if (type === "CHECK_IN") {
          if (isEarlyMode) return "조기 출근";
          if (isLate) return "지각";
          return "출근하기";
        }
        return "퇴근하기";
    }
  }, [buttonState, type, isEarlyMode]);

  // 버튼 아이콘 생성
  const getButtonIcon = useCallback(() => {
    switch (buttonState) {
      case "LOADING":
      case "AUTHENTICATING":
        return "";
      case "SUCCESS":
        return "✅";
      case "ERROR":
        return "❌";
      default:
        return type === "CHECK_IN" ? "🏢" : "🚪";
    }
  }, [buttonState, type]);

  // 버튼 변형 결정
  const getButtonVariant = useCallback(() => {
    switch (buttonState) {
      case "SUCCESS":
        return "success" as const;
      case "ERROR":
        return "danger" as const;
      case "DISABLED":
        return "secondary" as const;
      default:
        return "primary" as const;
    }
  }, [buttonState]);

  // 사업장 목록 로드
  useEffect(() => {
    const loadWorkplaces = async () => {
      try {
        const workplaceList = await locationService.getWorkplaceLocations();
        setWorkplaces(workplaceList);
        
        // 기본 사업장 설정
        if (attendanceInfo.workplaceId) {
          const workplace = workplaceList.find(w => w.id === attendanceInfo.workplaceId);
          setSelectedWorkplace(workplace || null);
        } else if (workplaceList.length > 0) {
          setSelectedWorkplace(workplaceList[0]);
        }
      } catch (error) {
        console.error("사업장 목록 로드 실패:", error);
      }
    };

    loadWorkplaces();
  }, [attendanceInfo.workplaceId]);

  // 위치 기반 가장 가까운 사업장 찾기
  useEffect(() => {
    if (!location || !workplaces.length || selectedWorkplace) return;

    const findNearestWorkplace = async () => {
      try {
        const nearest = await locationService.findNearestWorkplace(
          location.latitude,
          location.longitude
        );
        if (nearest) {
          setSelectedWorkplace(nearest);
        }
      } catch (error) {
        console.error("가장 가까운 사업장 찾기 실패:", error);
      }
    };

    findNearestWorkplace();
  }, [location, workplaces, selectedWorkplace]);

  // GPS 인증 실행
  const performLocationAuth = useCallback(async (locationData: LocationData, isLateSelected: boolean = false): Promise<LocationAuthResponse> => {
    if (!selectedWorkplace) {
      throw new Error("사업장이 선택되지 않았습니다.");
    }

    try {
      let authResponse: LocationAuthResponse;

      if (type === "CHECK_IN") {
        authResponse = await locationService.authenticateCheckIn(
          attendanceInfo.employeeId,
          locationData,
          selectedWorkplace.id,
          {
            isEarlyCheckIn: isEarlyMode,
            isLateCheckIn: isLateSelected
          }
        );
      } else {
        authResponse = await locationService.authenticateCheckOut(
          attendanceInfo.employeeId,
          locationData,
          selectedWorkplace.id
        );
      }

      return authResponse;
    } catch (error) {
      console.error("GPS 인증 실패:", error);
      throw error;
    }
  }, [type, attendanceInfo.employeeId, selectedWorkplace, isEarlyMode]);

  // 출석 처리 메인 함수
  const handleAttendance = useCallback(async (isLateSelected: boolean = false) => {
    if (!canPerformAttendance || buttonState === "LOADING" || buttonState === "AUTHENTICATING") {
      return;
    }

    try {
      setButtonState("LOADING");
      setAuthResult(null);

      // 1. 위치 권한 확인
      if (needsPermission) {
        setButtonState("ERROR");
        onError?.(new Error("위치 권한이 필요합니다. " + locationHelpers.getErrorGuidance({
          code: 1,
          message: "권한 거부",
          type: "PERMISSION_DENIED"
        })));
        return;
      }

      // 2. 현재 위치 획득
      let currentLocation = location;
      if (!currentLocation || !locationHelpers.isLocationFresh(currentLocation.timestamp)) {
        try {
          currentLocation = await getCurrentPosition();
        } catch (error) {
          setButtonState("ERROR");
          onError?.(new Error("위치 정보를 가져올 수 없습니다. " + locationHelpers.getErrorGuidance(locationError || {
            code: 3,
            message: "위치 획득 실패",
            type: "TIMEOUT"
          })));
          return;
        }
      }

      // 3. GPS 인증 (필요한 경우)
      if (requireLocationAuth) {
        setButtonState("AUTHENTICATING");
        
        try {
          const authResponse = await performLocationAuth(currentLocation, isLateSelected);
          setAuthResult(authResponse);

          if (!authResponse.isAuthenticated) {
            setButtonState("ERROR");
            
            const errorMessage = selectedWorkplace 
              ? locationHelpers.getAuthFailureMessage(
                  authResponse.distance,
                  authResponse.allowedRadius,
                  authResponse.workplaceName
                )
              : authResponse.message;

            onError?.(new Error(errorMessage));
            return;
          }
        } catch (error) {
          setButtonState("ERROR");
          onError?.(error as Error);
          return;
        }
      }

      // 4. 성공 처리
      setButtonState("SUCCESS");
      
      if (authResult) {
        onSuccess?.(authResult);
      } else {
        // GPS 인증이 없는 경우의 더미 응답
        const dummyResponse: LocationAuthResponse = {
          isAuthenticated: true,
          workplaceId: selectedWorkplace?.id || "",
          workplaceName: selectedWorkplace?.name || "사업장",
          distance: 0,
          allowedRadius: 200,
          message: "출석 처리가 완료되었습니다.",
        };
        onSuccess?.(dummyResponse);
      }

      // 3초 후 버튼 상태 리셋
      setTimeout(() => {
        setButtonState("READY");
      }, 3000);

    } catch (error) {
      setButtonState("ERROR");
      onError?.(error as Error);
    }
  }, [
    canPerformAttendance,
    buttonState,
    needsPermission,
    location,
    getCurrentPosition,
    locationError,
    requireLocationAuth,
    performLocationAuth,
    authResult,
    selectedWorkplace,
    onSuccess,
    onError
  ]);

  // 버튼 비활성화 조건
  const isButtonDisabled = useMemo(() => {
    if (disabled || !canPerformAttendance) return true;
    if (buttonState === "LOADING" || buttonState === "AUTHENTICATING") return true;
    if (requireLocationAuth && needsPermission) return true;
    return false;
  }, [disabled, canPerformAttendance, buttonState, requireLocationAuth, needsPermission]);

  // 최종 버튼 상태 결정
  const finalButtonState = useMemo(() => {
    if (!canPerformAttendance) return "DISABLED";
    return buttonState;
  }, [canPerformAttendance, buttonState]);

  // 버튼 렌더링 함수
  const renderAttendanceButton = () => {
    if (type !== "CHECK_IN") {
      // 퇴근 버튼은 기존과 동일
      return (
        <BaseButton
          buttonState={{
            label: getButtonLabel(),
            icon: getButtonIcon(),
            variant: getButtonVariant(),
            loading: finalButtonState === "LOADING" || finalButtonState === "AUTHENTICATING",
            disabled: isButtonDisabled,
          }}
          onClick={() => handleAttendance(false)}
          className="w-full py-3 text-lg font-semibold"
        />
      );
    }

    if (isEarlyMode) {
      // 조기 출근 모드
      return (
        <BaseButton
          buttonState={{
            label: getButtonLabel(),
            icon: getButtonIcon(),
            variant: getButtonVariant(),
            loading: finalButtonState === "LOADING" || finalButtonState === "AUTHENTICATING",
            disabled: isButtonDisabled,
          }}
          onClick={() => handleAttendance(false)}
          className="w-full py-3 text-lg font-semibold"
        />
      );
    }

    if (isLateCheckIn) {
      // 지각 상황: 분할 버튼
      return (
        <div className="flex w-full gap-0.5">
          <BaseButton
            buttonState={{
              label: getButtonLabel(),
              icon: getButtonIcon(),
              variant: getButtonVariant(),
              loading: finalButtonState === "LOADING" || finalButtonState === "AUTHENTICATING",
              disabled: isButtonDisabled,
            }}
            onClick={() => handleAttendance(false)}
            className="flex-1 py-3 text-lg font-semibold rounded-r-none"
          />
          <BaseButton
            buttonState={{
              label: getButtonLabel(true),
              icon: "⏰",
              variant: "warning",
              loading: finalButtonState === "LOADING" || finalButtonState === "AUTHENTICATING",
              disabled: isButtonDisabled,
            }}
            onClick={() => handleAttendance(true)}
            className="flex-1 py-3 text-lg font-semibold rounded-l-none bg-amber-500 hover:bg-amber-600 text-white border-l border-amber-400"
            title="지각으로 출근 처리합니다"
          />
        </div>
      );
    }

    // 일반 출근 버튼
    return (
      <BaseButton
        buttonState={{
          label: getButtonLabel(),
          icon: getButtonIcon(),
          variant: getButtonVariant(),
          loading: finalButtonState === "LOADING" || finalButtonState === "AUTHENTICATING",
          disabled: isButtonDisabled,
        }}
        onClick={() => handleAttendance(false)}
        className="w-full py-3 text-lg font-semibold"
      />
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 메인 출석 버튼 */}
      {renderAttendanceButton()}

      {/* 위치 정보 표시 */}
      {showLocationInfo && (
        <div className="space-y-2">
          {/* 위치 상태 */}
          <LocationStatus
            location={location}
            locationError={locationError}
            locationLoading={locationLoading}
            hasPermission={hasPermission}
            needsPermission={needsPermission}
            getAccuracyStatus={getAccuracyStatus}
          />

          {/* 사업장 정보 */}
          {selectedWorkplace && (
            <WorkplaceInfo
              workplace={selectedWorkplace}
              userLocation={location}
              authResult={authResult}
            />
          )}

          {/* 인증 결과 */}
          {authResult && (
            <AuthResult
              result={authResult}
              type={type}
            />
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 위치 상태 표시 컴포넌트
 */
const LocationStatus: React.FC<{
  location: LocationData | null;
  locationError: any;
  locationLoading: boolean;
  hasPermission: boolean;
  needsPermission: boolean;
  getAccuracyStatus: () => string;
}> = ({
  location,
  locationError,
  locationLoading,
  hasPermission,
  needsPermission,
  getAccuracyStatus,
}) => {
  if (locationLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
        <span>위치 정보 확인 중...</span>
      </div>
    );
  }

  if (needsPermission) {
    return (
      <div className="flex items-center space-x-2 text-sm text-orange-600">
        <span>⚠️</span>
        <span>위치 권한이 필요합니다.</span>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <span>❌</span>
        <span>{locationError.message}</span>
      </div>
    );
  }

  if (location) {
    const accuracyStatus = getAccuracyStatus();
    const accuracyColor = locationHelpers.getAccuracyColor(location.accuracy);
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span>📍</span>
        <span className="text-gray-600">위치:</span>
        <span className={accuracyColor}>
          {locationHelpers.formatAccuracy(location.accuracy)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <span>📍</span>
      <span>위치 정보 없음</span>
    </div>
  );
};

/**
 * 사업장 정보 표시 컴포넌트
 */
const WorkplaceInfo: React.FC<{
  workplace: WorkplaceLocation;
  userLocation: LocationData | null;
  authResult: LocationAuthResponse | null;
}> = ({ workplace, userLocation, authResult }) => {
  const distance = useMemo(() => {
    if (!userLocation) return null;
    
    return locationHelpers.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workplace.latitude,
      workplace.longitude
    );
  }, [userLocation, workplace]);

  const isWithinRange = useMemo(() => {
    if (!distance) return false;
    return distance <= workplace.allowedRadius;
  }, [distance, workplace.allowedRadius]);

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{workplace.name}</span>
        {authResult && (
          <span className={`text-sm px-2 py-1 rounded-full ${
            authResult.isAuthenticated 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {authResult.isAuthenticated ? "인증됨" : "인증 실패"}
          </span>
        )}
      </div>
      
      {distance !== null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">거리:</span>
          <span className={isWithinRange ? "text-green-600" : "text-red-600"}>
            {locationHelpers.formatDistance(distance)}
            {isWithinRange && " (범위 내)"}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">허용 범위:</span>
        <span className="text-gray-900">
          {locationHelpers.formatDistance(workplace.allowedRadius)}
        </span>
      </div>
    </div>
  );
};

/**
 * 인증 결과 표시 컴포넌트
 */
const AuthResult: React.FC<{
  result: LocationAuthResponse;
  type: AttendanceType;
}> = ({ result, type }) => {
  const uiState = locationHelpers.getAuthResultUIState(result);
  
  return (
    <div className={`p-3 rounded-lg border ${
      uiState.variant === "success" 
        ? "bg-green-50 border-green-200" 
        : uiState.variant === "warning"
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200"
    }`}>
      <div className="flex items-center space-x-2">
        <span>{uiState.icon}</span>
        <span className={`text-sm font-medium ${
          uiState.variant === "success" 
            ? "text-green-800" 
            : uiState.variant === "warning"
            ? "text-yellow-800"
            : "text-red-800"
        }`}>
          {uiState.message}
        </span>
      </div>
      
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {result.suggestions.map((suggestion, index) => (
            <div key={index} className="text-xs text-gray-600">
              • {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 간단한 출석 버튼 (위치 정보 없이)
 */
export const SimpleAttendanceButton: React.FC<{
  type: AttendanceType;
  attendanceInfo: AttendanceInfo;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  isEarlyMode?: boolean;
}> = ({ type, attendanceInfo, onSuccess, onError, className = "", disabled = false, isEarlyMode = false }) => {
  return (
    <AttendanceButton
      type={type}
      attendanceInfo={attendanceInfo}
      onSuccess={() => onSuccess?.()}
      onError={onError}
      className={className}
      disabled={disabled}
      showLocationInfo={false}
      requireLocationAuth={false}
      autoRequestLocation={false}
      isEarlyMode={isEarlyMode}
    />
  );
};