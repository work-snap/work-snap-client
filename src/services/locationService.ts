/**
 * 위치 인증 관련 API 서비스
 */

import api from '@/lib/api';
import { LocationData } from '@/hooks/useGeolocation';

// 사업장 위치 정보 타입
export interface WorkplaceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowedRadius: number; // 허용 반경 (미터)
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// GPS 인증 요청 타입
export interface LocationAuthRequest {
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  workplaceId?: string;
}

// GPS 인증 응답 타입
export interface LocationAuthResponse {
  isAuthenticated: boolean;
  workplaceId: string;
  workplaceName: string;
  distance: number;
  allowedRadius: number;
  message: string;
  errorCode?: string;
  suggestions?: string[];
}

// 위치 검증 결과 타입
export interface LocationValidationResult {
  isValid: boolean;
  nearestWorkplace?: WorkplaceLocation;
  distance?: number;
  message: string;
  accuracy: "high" | "medium" | "low";
}

// 위치 히스토리 타입
export interface LocationHistory {
  id: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  workplaceId?: string;
  isAuthenticated: boolean;
  distance: number;
  timestamp: string;
  requestType: "CHECK_IN" | "CHECK_OUT" | "VERIFICATION";
}

class LocationService {
  private baseUrl = '/api/location';

  /**
   * 사업장 위치 목록 조회
   */
  async getWorkplaceLocations(): Promise<WorkplaceLocation[]> {
    try {
      const response = await api.get(`${this.baseUrl}/workplaces`);
      return response.data;
    } catch (error) {
      console.error('사업장 위치 조회 실패:', error);
      throw new Error('사업장 위치 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 사업장 위치 조회
   */
  async getWorkplaceLocation(workplaceId: string): Promise<WorkplaceLocation> {
    try {
      const response = await api.get(`${this.baseUrl}/workplaces/${workplaceId}`);
      return response.data;
    } catch (error) {
      console.error('사업장 위치 상세 조회 실패:', error);
      throw new Error('사업장 위치 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * GPS 위치 인증
   */
  async authenticateLocation(authRequest: LocationAuthRequest): Promise<LocationAuthResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/authenticate`, authRequest);
      return response.data;
    } catch (error) {
      console.error('GPS 위치 인증 실패:', error);
      throw new Error('위치 인증에 실패했습니다.');
    }
  }

  /**
   * 위치 사전 검증 (인증 전 미리 확인)
   */
  async validateLocation(
    latitude: number, 
    longitude: number, 
    accuracy: number
  ): Promise<LocationValidationResult> {
    try {
      const payload = { latitude, longitude, accuracy };
      const response = await api.post(`${this.baseUrl}/validate`, payload);
      return response.data;
    } catch (error) {
      console.error('위치 검증 실패:', error);
      throw new Error('위치 검증에 실패했습니다.');
    }
  }

  /**
   * 출근용 위치 인증
   */
  async authenticateCheckIn(
    employeeId: string,
    locationData: LocationData,
    workplaceId?: string,
    options?: {
      isEarlyCheckIn?: boolean;
      isLateCheckIn?: boolean;
    }
  ): Promise<LocationAuthResponse> {
    try {
      const authRequest: LocationAuthRequest & {
        isEarlyCheckIn?: boolean;
        isLateCheckIn?: boolean;
      } = {
        employeeId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        workplaceId,
        isEarlyCheckIn: options?.isEarlyCheckIn || false,
        isLateCheckIn: options?.isLateCheckIn || false,
      };

      const response = await api.post(`${this.baseUrl}/authenticate/check-in`, authRequest);
      return response.data;
    } catch (error) {
      console.error('출근 위치 인증 실패:', error);
      throw new Error('출근 위치 인증에 실패했습니다.');
    }
  }

  /**
   * 퇴근용 위치 인증
   */
  async authenticateCheckOut(
    employeeId: string,
    locationData: LocationData,
    workplaceId?: string
  ): Promise<LocationAuthResponse> {
    try {
      const authRequest: LocationAuthRequest = {
        employeeId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        workplaceId,
      };

      const response = await api.post(`${this.baseUrl}/authenticate/check-out`, authRequest);
      return response.data;
    } catch (error) {
      console.error('퇴근 위치 인증 실패:', error);
      throw new Error('퇴근 위치 인증에 실패했습니다.');
    }
  }

  /**
   * 위치 히스토리 조회
   */
  async getLocationHistory(
    employeeId: string,
    startDate?: string,
    endDate?: string,
    limit = 50
  ): Promise<LocationHistory[]> {
    try {
      const params: Record<string, any> = { employeeId, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${this.baseUrl}/history`, params);
      return response.data;
    } catch (error) {
      console.error('위치 히스토리 조회 실패:', error);
      throw new Error('위치 히스토리를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 가장 가까운 사업장 찾기
   */
  async findNearestWorkplace(
    latitude: number,
    longitude: number
  ): Promise<WorkplaceLocation | null> {
    try {
      const payload = { latitude, longitude };
      const response = await api.post(`${this.baseUrl}/nearest-workplace`, payload);
      return response.data;
    } catch (error) {
      console.error('가장 가까운 사업장 찾기 실패:', error);
      return null;
    }
  }

  /**
   * 위치 정확도 개선 제안
   */
  async getLocationImprovementSuggestions(
    accuracy: number,
    isIndoor: boolean = false
  ): Promise<string[]> {
    try {
      const payload = { accuracy, isIndoor };
      const response = await api.post(`${this.baseUrl}/improvement-suggestions`, payload);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('위치 정확도 개선 제안 조회 실패:', error);
      return this.getDefaultImprovementSuggestions(accuracy);
    }
  }

  /**
   * 기본 위치 정확도 개선 제안
   */
  private getDefaultImprovementSuggestions(accuracy: number): string[] {
    const suggestions: string[] = [];

    if (accuracy > 100) {
      suggestions.push("실외로 이동하여 GPS 신호를 개선해주세요.");
      suggestions.push("WiFi나 모바일 데이터가 연결되어 있는지 확인해주세요.");
    }
    
    if (accuracy > 50) {
      suggestions.push("잠시 기다린 후 다시 시도해주세요.");
      suggestions.push("위치 서비스가 활성화되어 있는지 확인해주세요.");
    }

    if (accuracy > 20) {
      suggestions.push("주변에 높은 건물이나 장애물이 있다면 이동해주세요.");
    }

    if (suggestions.length === 0) {
      suggestions.push("현재 위치 정확도가 양호합니다.");
    }

    return suggestions;
  }
}

// 싱글톤 인스턴스 생성
export const locationService = new LocationService();

// 위치 관련 헬퍼 함수들
export const locationHelpers = {
  /**
   * 두 좌표 간 거리 계산 (Haversine 공식)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  /**
   * 위치가 허용 범위 내에 있는지 확인
   */
  isWithinAllowedRadius(
    userLat: number,
    userLon: number,
    workplaceLat: number,
    workplaceLon: number,
    allowedRadius: number
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, workplaceLat, workplaceLon);
    return distance <= allowedRadius;
  },

  /**
   * 위치 정확도 등급 반환
   */
  getAccuracyGrade(accuracy: number): "excellent" | "good" | "fair" | "poor" {
    if (accuracy <= 5) return "excellent";
    if (accuracy <= 20) return "good";
    if (accuracy <= 100) return "fair";
    return "poor";
  },

  /**
   * 위치 정확도별 색상 반환
   */
  getAccuracyColor(accuracy: number): string {
    const grade = this.getAccuracyGrade(accuracy);
    switch (grade) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "fair": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  },

  /**
   * 위치 정확도 메시지 반환
   */
  getAccuracyMessage(accuracy: number): string {
    const grade = this.getAccuracyGrade(accuracy);
    switch (grade) {
      case "excellent": return `매우 정확한 위치입니다 (±${accuracy.toFixed(1)}m)`;
      case "good": return `정확한 위치입니다 (±${accuracy.toFixed(1)}m)`;
      case "fair": return `보통 수준의 위치입니다 (±${accuracy.toFixed(0)}m)`;
      case "poor": return `위치 정확도가 낮습니다 (±${accuracy.toFixed(0)}m)`;
      default: return `위치 정확도: ±${accuracy.toFixed(0)}m`;
    }
  },

  /**
   * 거리를 읽기 쉬운 형태로 포맷팅
   */
  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  },

  /**
   * 인증 실패 메시지 생성
   */
  getAuthFailureMessage(
    distance: number,
    allowedRadius: number,
    workplaceName: string
  ): string {
    const extraDistance = distance - allowedRadius;
    return `${workplaceName}에서 ${this.formatDistance(extraDistance)} 더 가까이 이동해주세요. (현재 거리: ${this.formatDistance(distance)})`;
  },

  /**
   * 위치 권한 안내 메시지
   */
  getPermissionGuideMessage(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return "주소창 왼쪽의 위치 아이콘을 클릭하여 '허용'을 선택해주세요.";
    } else if (userAgent.includes('firefox')) {
      return "주소창 왼쪽의 방패 아이콘을 클릭하여 위치 권한을 허용해주세요.";
    } else if (userAgent.includes('safari')) {
      return "Safari 설정에서 위치 서비스를 활성화해주세요.";
    }
    
    return "브라우저 설정에서 위치 권한을 허용해주세요.";
  },

  /**
   * 위치 개선 방법 안내
   */
  getLocationImprovementTips(): string[] {
    return [
      "실외로 이동하여 GPS 신호를 개선해주세요.",
      "WiFi나 모바일 데이터 연결을 확인해주세요.",
      "위치 서비스가 활성화되어 있는지 확인해주세요.",
      "높은 건물이나 지하에서는 위치 정확도가 떨어질 수 있습니다.",
      "잠시 기다린 후 다시 시도해주세요.",
    ];
  },

  /**
   * 위치 데이터 유효성 검사
   */
  isValidLocationData(locationData: LocationData): boolean {
    const { latitude, longitude, accuracy, timestamp } = locationData;
    
    // 위도 경도 범위 확인
    if (latitude < -90 || latitude > 90) return false;
    if (longitude < -180 || longitude > 180) return false;
    
    // 정확도 확인 (0보다 큰 값)
    if (accuracy <= 0) return false;
    
    // 타임스탬프 확인 (최근 1시간 이내)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (timestamp < oneHourAgo) return false;
    
    return true;
  },

  /**
   * 위치 데이터를 지도 URL로 변환
   */
  getMapUrl(latitude: number, longitude: number, zoom = 16): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}`;
  },

  /**
   * 위치 인증 결과에 따른 UI 상태 반환
   */
  getAuthResultUIState(authResult: LocationAuthResponse): {
    variant: "success" | "warning" | "error";
    icon: string;
    message: string;
  } {
    if (authResult.isAuthenticated) {
      return {
        variant: "success",
        icon: "✅",
        message: `${authResult.workplaceName}에서 인증되었습니다.`,
      };
    }

    const distance = authResult.distance;
    const allowedRadius = authResult.allowedRadius;
    
    if (distance - allowedRadius <= 50) {
      return {
        variant: "warning",
        icon: "⚠️",
        message: "조금 더 가까이 이동해주세요.",
      };
    }

    return {
      variant: "error",
      icon: "❌",
      message: authResult.message || "위치 인증에 실패했습니다.",
    };
  },
};