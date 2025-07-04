import { useEffect, useState, useCallback } from "react";
import { flutterBridge } from "../bridge";
import { AppFeatureState, NotificationType, LocationData } from "../types";

/**
 * 앱 기능 훅
 * Interface Segregation: 앱 관련 기능만 담당
 */
export const useAppFeatures = () => {
  const [appState, setAppState] = useState<AppFeatureState>({
    isApp: false,
    appReady: false,
    locationPermission: false,
    notificationPermission: false,
  });

  // 앱 환경 및 준비 상태 확인
  useEffect(() => {
    const initializeAppState = async () => {
      const isApp = flutterBridge.isApp();
      const appReady = isApp ? await flutterBridge.isReady() : true;

      setAppState((prev) => ({
        ...prev,
        isApp,
        appReady,
      }));
    };

    initializeAppState();
  }, []);

  // 알림 표시 (alert 대체)
  const showNotification = useCallback(
    async (
      title: string,
      message: string,
      type: NotificationType = "info"
    ): Promise<void> => {
      try {
        await flutterBridge.showNotification(title, message, type);
      } catch (error) {
        console.error("알림 표시 실패:", error);
        // 폴백으로 브라우저 alert 사용
        if (typeof alert !== "undefined") {
          alert(`${title}: ${message}`);
        }
      }
    },
    []
  );

  // 진동 피드백
  const vibrate = useCallback(
    async (pattern: number[] = [100]): Promise<void> => {
      try {
        await flutterBridge.vibrate(pattern);
      } catch (error) {
        console.error("진동 피드백 실패:", error);
      }
    },
    []
  );

  // 위치 정보 요청
  const getCurrentLocation =
    useCallback(async (): Promise<LocationData | null> => {
      try {
        return await flutterBridge.getCurrentLocation();
      } catch (error) {
        console.error("위치 정보 요청 실패:", error);
        return null;
      }
    }, []);

  // 출근 성공 피드백 (기획서 요구사항)
  const clockInFeedback = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        showNotification(
          "출근 완료",
          "출근이 성공적으로 처리되었습니다",
          "success"
        ),
        vibrate([100, 50, 100]), // 짧은-긴-짧은 패턴
      ]);
    } catch (error) {
      console.error("출근 피드백 실패:", error);
    }
  }, [showNotification, vibrate]);

  // 퇴근 성공 피드백 (기획서 요구사항)
  const clockOutFeedback = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        showNotification(
          "퇴근 완료",
          "퇴근이 성공적으로 처리되었습니다",
          "success"
        ),
        vibrate([100, 50, 100, 50, 100]), // 더 긴 패턴
      ]);
    } catch (error) {
      console.error("퇴근 피드백 실패:", error);
    }
  }, [showNotification, vibrate]);

  // 에러 피드백
  const errorFeedback = useCallback(
    async (
      title: string = "오류 발생",
      message: string = "처리 중 오류가 발생했습니다"
    ): Promise<void> => {
      try {
        await Promise.all([
          showNotification(title, message, "error"),
          vibrate([200]), // 긴 진동
        ]);
      } catch (error) {
        console.error("에러 피드백 실패:", error);
      }
    },
    [showNotification, vibrate]
  );

  // 경고 피드백
  const warningFeedback = useCallback(
    async (title: string, message: string): Promise<void> => {
      try {
        await Promise.all([
          showNotification(title, message, "warning"),
          vibrate([100, 100, 100]), // 3번 짧은 진동
        ]);
      } catch (error) {
        console.error("경고 피드백 실패:", error);
      }
    },
    [showNotification, vibrate]
  );

  // 위치 기반 출근 처리 (기획서 요구사항)
  const processLocationBasedAction = useCallback(
    async (
      actionType: "clock-in" | "clock-out"
    ): Promise<{ location: LocationData | null; notes: string }> => {
      let location: LocationData | null = null;
      let notes = "";

      try {
        if (appState.isApp) {
          location = await getCurrentLocation();
          if (location) {
            notes = `${
              actionType === "clock-in" ? "출근" : "퇴근"
            } - 위치: ${location.latitude.toFixed(
              6
            )}, ${location.longitude.toFixed(6)}`;
          } else {
            notes = `${
              actionType === "clock-in" ? "출근" : "퇴근"
            } - 위치 정보 없음 (앱)`;
          }
        } else {
          notes = `${
            actionType === "clock-in" ? "출근" : "퇴근"
          } - 웹에서 접근`;
        }
      } catch (error) {
        console.error("위치 기반 처리 실패:", error);
        notes = `${
          actionType === "clock-in" ? "출근" : "퇴근"
        } - 위치 처리 실패`;
      }

      return { location, notes };
    },
    [appState.isApp, getCurrentLocation]
  );

  // 앱 준비 상태 새로고침
  const refreshAppState = useCallback(async (): Promise<void> => {
    const isApp = flutterBridge.isApp();
    const appReady = isApp ? await flutterBridge.isReady() : true;

    setAppState((prev) => ({
      ...prev,
      isApp,
      appReady,
    }));
  }, []);

  return {
    // 상태
    ...appState,

    // 기본 기능
    showNotification,
    vibrate,
    getCurrentLocation,

    // 피드백 기능 (기획서 요구사항)
    clockInFeedback,
    clockOutFeedback,
    errorFeedback,
    warningFeedback,

    // 고급 기능
    processLocationBasedAction,
    refreshAppState,

    // 편의 속성
    canUseLocation:
      appState.isApp ||
      (typeof navigator !== "undefined" && !!navigator.geolocation),
    canVibrate:
      appState.isApp ||
      (typeof navigator !== "undefined" && !!navigator.vibrate),
  };
};
