import { attendanceApi as realAttendanceApi } from "./attendance.api";
import { mockAttendanceApi } from "../mock/attendance-api.mock";

/**
 * API 환경 설정
 */
interface ApiConfig {
  useMockApi: boolean;
  mockDelay: boolean;
  logApiCalls: boolean;
}

/**
 * 환경변수 기반 설정
 */
const getApiConfig = (): ApiConfig => {
  // 환경변수 또는 로컬 스토리지에서 설정 로드
  const useMockFromEnv = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  const useMockFromStorage = typeof window !== 'undefined' 
    ? localStorage.getItem('work-snap-use-mock') === 'true'
    : false;

  return {
    useMockApi: useMockFromEnv || useMockFromStorage,
    mockDelay: true, // 실제 API 응답 시간 시뮬레이션
    logApiCalls: process.env.NODE_ENV === 'development',
  };
};

/**
 * API 팩토리 클래스
 * 환경에 따라 실제 API 또는 목업 API를 반환
 */
class AttendanceApiFactory {
  private config: ApiConfig;

  constructor() {
    this.config = getApiConfig();
    
    if (this.config.logApiCalls) {
      console.log(`🏭 AttendanceApiFactory 초기화: ${this.config.useMockApi ? 'Mock API' : 'Real API'} 사용`);
    }
  }

  /**
   * 현재 설정된 API 인스턴스 반환
   */
  getApi() {
    return this.config.useMockApi ? mockAttendanceApi : realAttendanceApi;
  }

  /**
   * Mock API 사용 여부 확인
   */
  isUsingMockApi(): boolean {
    return this.config.useMockApi;
  }

  /**
   * Mock API 사용 설정 변경 (런타임에서)
   */
  setUseMockApi(useMock: boolean): void {
    this.config.useMockApi = useMock;
    
    // 로컬 스토리지에 저장 (새로고침 후에도 유지)
    if (typeof window !== 'undefined') {
      localStorage.setItem('work-snap-use-mock', useMock.toString());
    }

    if (this.config.logApiCalls) {
      console.log(`🔄 API 모드 변경: ${useMock ? 'Mock API' : 'Real API'}로 전환`);
    }
  }

  /**
   * 현재 설정 정보 반환
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Mock API 데이터 초기화 (Mock API 사용 중일 때만)
   */
  resetMockData(): void {
    if (this.config.useMockApi && 'resetMockData' in mockAttendanceApi) {
      (mockAttendanceApi as any).resetMockData();
      
      if (this.config.logApiCalls) {
        console.log("🔄 Mock 데이터 초기화 완료");
      }
    }
  }

  /**
   * 개발자 도구 - API 모드 토글
   */
  toggleApiMode(): void {
    this.setUseMockApi(!this.config.useMockApi);
    
    // 페이지 새로고침 권장
    if (typeof window !== 'undefined' && this.config.logApiCalls) {
      console.log("⚠️  API 모드가 변경되었습니다. 페이지를 새로고침하는 것을 권장합니다.");
    }
  }

  /**
   * 개발자 도구 - 현재 상태 출력
   */
  printStatus(): void {
    console.log("📊 API Factory 상태:");
    console.log("- 현재 모드:", this.config.useMockApi ? "Mock API" : "Real API");
    console.log("- Mock 지연:", this.config.mockDelay ? "활성화" : "비활성화");
    console.log("- 로그:", this.config.logApiCalls ? "활성화" : "비활성화");
    
    if (this.config.useMockApi) {
      console.log("- Mock 데이터 상태:", (mockAttendanceApi as any).getMockDataState?.());
    }
  }
}

// 싱글톤 인스턴스 생성
const apiFactory = new AttendanceApiFactory();

// 현재 선택된 API 인스턴스를 기본 export
export const attendanceApi = apiFactory.getApi();

// 팩토리 인스턴스도 export (개발자 도구용)
export { apiFactory };

// 개발 환경에서 전역 변수로 설정 (디버깅용)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).attendanceApiFactory = apiFactory;
  (window as any).toggleAttendanceApiMode = () => apiFactory.toggleApiMode();
  (window as any).printAttendanceApiStatus = () => apiFactory.printStatus();
  
  console.log("🛠️  개발자 도구가 설정되었습니다:");
  console.log("- attendanceApiFactory: API 팩토리 인스턴스");
  console.log("- toggleAttendanceApiMode(): API 모드 토글");
  console.log("- printAttendanceApiStatus(): 현재 상태 출력");
}