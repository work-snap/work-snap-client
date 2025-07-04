import {
  AppBridge,
  FlutterMessage,
  FlutterResponse,
  NotificationType,
  LocationData,
  WebToastOptions,
} from "../types";

/**
 * Flutter 하이브리드 앱 브릿지 구현
 * Open/Closed 원칙: AppBridge 인터페이스를 구현하여 확장 가능
 */
class FlutterBridge implements AppBridge {
  private isFlutterEnvironment: boolean = false;

  constructor() {
    this.isFlutterEnvironment = this.detectFlutterEnvironment();
  }

  /**
   * Flutter 환경 감지
   */
  private detectFlutterEnvironment(): boolean {
    // SSR 환경에서는 window 객체가 없으므로 체크
    if (typeof window === "undefined") {
      return false;
    }

    return !!(
      (window as any).flutter_inappwebview ||
      (window as any).flutterApp ||
      (window as any).Flutter
    );
  }

  /**
   * Flutter로 메시지 전송
   */
  private async sendToFlutter(
    message: FlutterMessage
  ): Promise<FlutterResponse> {
    return new Promise((resolve) => {
      try {
        // SSR 환경 체크
        if (typeof window === "undefined") {
          resolve({ success: false, error: "Server-side environment" });
          return;
        }

        if ((window as any).flutter_inappwebview) {
          // Flutter InAppWebView 통신
          (window as any).flutter_inappwebview
            .callHandler("messageHandler", message)
            .then((response: FlutterResponse) => resolve(response))
            .catch(() =>
              resolve({ success: false, error: "Flutter communication failed" })
            );
        } else if ((window as any).flutterApp) {
          // 커스텀 Flutter 앱 통신
          const response = (window as any).flutterApp.handleMessage(
            JSON.stringify(message)
          );
          resolve(JSON.parse(response));
        } else {
          resolve({
            success: false,
            error: "Flutter environment not detected",
          });
        }
      } catch (error) {
        console.error("Flutter 통신 오류:", error);
        resolve({ success: false, error: "Communication error" });
      }
    });
  }

  /**
   * 웹 환경용 토스트 표시
   */
  private showWebToast(
    title: string,
    message: string,
    type: NotificationType,
    options: WebToastOptions = {}
  ): void {
    // SSR 환경에서는 document가 없으므로 체크
    if (typeof document === "undefined") {
      console.log(`Toast: ${title} - ${message}`);
      return;
    }

    const toast = document.createElement("div");
    const { duration = 3000, position = "top" } = options;

    toast.className = `fixed ${this.getPositionClass(
      position
    )} right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${this.getToastColorClass(
      type
    )}`;
    toast.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm mt-1">${message}</div>
    `;

    // 애니메이션 효과
    toast.style.transform = "translateX(100%)";
    document.body.appendChild(toast);

    // 슬라이드인 애니메이션
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 10);

    // 자동 제거
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * 토스트 위치 클래스 반환
   */
  private getPositionClass(position: "top" | "bottom" | "center"): string {
    switch (position) {
      case "top":
        return "top-4";
      case "bottom":
        return "bottom-4";
      case "center":
        return "top-1/2 transform -translate-y-1/2";
      default:
        return "top-4";
    }
  }

  /**
   * 토스트 색상 클래스 반환
   */
  private getToastColorClass(type: NotificationType): string {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }

  /**
   * 웹 환경용 위치 정보 요청
   */
  private async getWebLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      // SSR 환경에서는 navigator가 없으므로 체크
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        console.warn("위치 정보가 지원되지 않는 환경입니다.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("위치 정보 요청 실패:", error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // AppBridge 인터페이스 구현

  /**
   * 알림 표시
   */
  async showNotification(
    title: string,
    message: string,
    type: NotificationType = "info"
  ): Promise<void> {
    if (this.isFlutterEnvironment) {
      const response = await this.sendToFlutter({
        type: "SHOW_NOTIFICATION",
        data: { title, message, type },
      });

      if (!response.success) {
        // Flutter 통신 실패 시 웹 폴백
        this.showWebToast(title, message, type);
      }
    } else {
      this.showWebToast(title, message, type);
    }
  }

  /**
   * 진동 피드백
   */
  async vibrate(pattern: number[] = [100]): Promise<void> {
    if (this.isFlutterEnvironment) {
      const response = await this.sendToFlutter({
        type: "VIBRATE",
        data: { pattern },
      });

      if (
        !response.success &&
        typeof navigator !== "undefined" &&
        navigator.vibrate
      ) {
        // Flutter 통신 실패 시 웹 폴백
        navigator.vibrate(pattern);
      }
    } else if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * 현재 위치 정보 요청
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    if (this.isFlutterEnvironment) {
      const response = await this.sendToFlutter({
        type: "GET_LOCATION",
        data: {},
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        // Flutter 통신 실패 시 웹 폴백
        return await this.getWebLocation();
      }
    } else {
      return await this.getWebLocation();
    }
  }

  /**
   * 앱 환경 여부 확인
   */
  isApp(): boolean {
    return this.isFlutterEnvironment;
  }

  /**
   * 앱 준비 상태 확인
   */
  async isReady(): Promise<boolean> {
    if (this.isFlutterEnvironment) {
      const response = await this.sendToFlutter({
        type: "APP_READY_CHECK",
        data: {},
      });
      return response.success;
    }
    return true; // 웹 환경은 항상 준비 상태
  }
}

// 싱글톤 인스턴스 생성 및 내보내기 (SSR 안전)
let flutterBridgeInstance: FlutterBridge | null = null;

export const getFlutterBridge = (): AppBridge => {
  if (typeof window === "undefined") {
    // SSR 환경에서는 더미 인스턴스 반환
    return {
      showNotification: async () => {},
      vibrate: async () => {},
      getCurrentLocation: async () => null,
      isApp: () => false,
      isReady: async () => true,
    };
  }

  if (!flutterBridgeInstance) {
    flutterBridgeInstance = new FlutterBridge();
  }
  return flutterBridgeInstance;
};

// 기존 호환성을 위한 export - 사용 시점에 평가되도록 getter 사용
export const flutterBridge = {
  get instance() {
    return getFlutterBridge();
  },

  // AppBridge 인터페이스 메서드들을 프록시로 구현
  async showNotification(
    title: string,
    message: string,
    type: NotificationType = "info"
  ) {
    return this.instance.showNotification(title, message, type);
  },

  async vibrate(pattern: number[] = [100]) {
    return this.instance.vibrate(pattern);
  },

  async getCurrentLocation() {
    return this.instance.getCurrentLocation();
  },

  isApp() {
    return this.instance.isApp();
  },

  async isReady() {
    return this.instance.isReady();
  },
};
