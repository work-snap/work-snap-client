import { NotificationType, LocationData } from "./attendance.types";

/**
 * Flutter 브릿지 메시지 타입
 */
export interface FlutterMessage {
  type: string;
  data: any;
}

/**
 * Flutter 브릿지 응답 타입
 */
export interface FlutterResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * 앱 브릿지 인터페이스
 */
export interface AppBridge {
  showNotification(
    title: string,
    message: string,
    type: NotificationType
  ): Promise<void>;
  vibrate(pattern: number[]): Promise<void>;
  getCurrentLocation(): Promise<LocationData | null>;
  isApp(): boolean;
  isReady(): Promise<boolean>;
}

/**
 * 앱 기능 상태
 */
export interface AppFeatureState {
  isApp: boolean;
  appReady: boolean;
  locationPermission: boolean;
  notificationPermission: boolean;
}

/**
 * 웹 토스트 옵션
 */
export interface WebToastOptions {
  duration?: number;
  position?: "top" | "bottom" | "center";
  className?: string;
}
