import axios from "axios";
import {
  TestResult,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  UserUpdateForm,
  DevTokenRequest,
  ApiResponse,
  BusinessOwnerRegistrationForm,
  BusinessOwnerTestRequest,
  BusinessOwnerInfo,
  FileUploadResponse,
  VerificationStatusResponse,
  WorkplaceRegistrationForm,
  Workplace,
  InviteCodeResponse,
  PartTimeInfo,
  WorkScheduleUpdateForm,
  WorkScheduleBatchCreateForm,
} from "./types";

// API 클라이언트 설정
const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 30000, // 30초로 증가
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // CORS 설정 명시
});

// 토큰 interceptor 설정
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Authorization 헤더 추가됨");
    } else {
      console.log("⚠️ 토큰이 없습니다");
    }
    return config;
  },
  (error) => {
    console.error("❌ 요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 interceptor 설정
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API 응답 성공: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`
    );
    return response;
  },
  (error) => {
    const config = error.config;
    const method = config?.method?.toUpperCase() || "UNKNOWN";
    const url = config?.url || "unknown";

    if (error.code === "NETWORK_ERROR" || !error.response) {
      console.error(`🌐 네트워크 에러: ${method} ${url}`, {
        message: error.message,
        code: error.code,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      });
    } else if (error.response?.status === 401) {
      console.warn("🔐 인증 만료 - 로그아웃 처리");
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
    } else {
      console.error(`❌ API 에러: ${method} ${url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authTestApis = {
  // 카카오 로그인 테스트 (Mock 응답)
  kakaoLogin: () => {
    return Promise.resolve({
      data: {
        success: true,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: 1,
          username: "testuser",
          userType: "BUSINESS_OWNER",
        },
      },
    });
  },

  // 일반 로그인 테스트
  login: (data: LoginRequest) => {
    return api.post("/api/auth/login", data);
  },

  // 로그아웃
  logout: () => {
    return api.post("/api/auth/logout");
  },

  // 토큰 갱신
  refreshToken: () => {
    return api.post("/api/auth/refresh");
  },

  // 개발 토큰 생성 (사용자 ID)
  generateDevToken: (userId: string) => {
    return api.post(`/api/auth/dev/tokens/${userId}`);
  },

  // 개발 토큰 생성 (닉네임)
  generateDevTokenByNickname: (nickname: string) => {
    return api.post(
      `/api/auth/dev/tokens/by-nickname/${encodeURIComponent(nickname)}`
    );
  },
};

// User API
export const userTestApis = {
  // 내 정보 조회
  getMyInfo: () => {
    return api.get("/api/users/me");
  },

  // 내 정보 수정
  updateMyInfo: (data: UserUpdateForm) => {
    return api.put("/api/users/me", data);
  },

  // 사용자 타입 선택
  selectUserType: (userType: string) => {
    return api.post("/api/users/me/select-type", { userType });
  },

  // 사용자 정보 조회
  getUserInfo: () => {
    return api.get("/api/user/info");
  },

  // 사용자 정보 수정
  updateUserInfo: (data: any) => {
    return api.put("/api/user/info", data);
  },
};

// Business Owner API
export const businessOwnerTestApis = {
  // 사업자 등록 (JSON 방식)
  register: (data: BusinessOwnerRegistrationForm) => {
    const formData = {
      businessRegistrationImage:
        data.businessRegistrationImage ||
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/test",
    };
    return api.post("/api/business-owner/register", formData);
  },

  // 대시보드 조회 (업데이트됨)
  getDashboard: () => {
    return api.get("/api/business-owner/dashboard");
  },

  // 사업자 정보 조회
  getBusinessOwner: () => {
    return api.get("/api/business-owner/info");
  },

  // 사업자 검증 상태 조회
  getVerificationStatus: () => {
    return api.get("/api/business-owner/verification-status");
  },

  // 사업자등록번호 테스트 (개발용)
  testBusinessNumber: (data: BusinessOwnerTestRequest) => {
    return api.post("/api/business-owner/test-business-number", data);
  },

  // 프로필 조회 (업데이트됨)
  getProfile: () => {
    return api.get("/api/business-owner/profile");
  },
};

// Workplace API (새로 추가)
export const workplaceTestApis = {
  // 사업장 등록
  register: (data: WorkplaceRegistrationForm) => {
    // 클라이언트 필드명을 서버 필드명으로 매핑
    const requestData = {
      workplaceName: data.name,
      workplaceAddress: data.address,
      workplacePhone: data.phoneNumber || null,
      workplaceDescription: data.description || null,
      isMainWorkplace: data.isMain || false,
    };
    return api.post("/api/business-owner/workplaces", requestData);
  },

  // 사업장 목록 조회
  getWorkplaces: () => {
    return api.get("/api/business-owner/workplaces");
  },

  // 사업장 상세 조회
  getWorkplace: (workplaceId: number) => {
    return api.get(`/api/business-owner/workplaces/${workplaceId}`);
  },

  // 메인 사업장 조회
  getMainWorkplace: () => {
    return api.get("/api/business-owner/workplaces/main");
  },

  // 사업장 정보 수정
  updateWorkplace: (workplaceId: number, data: WorkplaceRegistrationForm) => {
    // 클라이언트 필드명을 서버 필드명으로 매핑
    const requestData = {
      workplaceName: data.name,
      workplaceAddress: data.address,
      workplacePhone: data.phoneNumber || null,
      workplaceDescription: data.description || null,
      isMainWorkplace: data.isMain || false,
    };
    return api.put(
      `/api/business-owner/workplaces/${workplaceId}`,
      requestData
    );
  },

  // 사업장 삭제
  deleteWorkplace: (workplaceId: number) => {
    return api.delete(`/api/business-owner/workplaces/${workplaceId}`);
  },

  // 사업장 통계 조회
  getStatistics: () => {
    return api.get("/api/business-owner/workplaces/statistics");
  },
};

// Work Schedule API
export const workScheduleTestApis = {
  // 근무 스케줄 배치 등록
  create: (data: WorkScheduleBatchCreateForm) => {
    return api.post("/api/business-owner/work-schedules", data);
  },

  // 사업장별 근무 스케줄 목록 조회
  getByWorkplace: (workplaceId: number) => {
    return api.get(
      `/api/business-owner/work-schedules/workplace/${workplaceId}`
    );
  },

  // 근무 스케줄 상세 조회
  getById: (scheduleId: number) => {
    return api.get(`/api/business-owner/work-schedules/${scheduleId}`);
  },

  // 근무 스케줄 수정
  update: (scheduleId: number, data: WorkScheduleUpdateForm) => {
    return api.put(`/api/business-owner/work-schedules/${scheduleId}`, data);
  },

  // 근무 스케줄 삭제
  delete: (scheduleId: number) => {
    return api.delete(`/api/business-owner/work-schedules/${scheduleId}`);
  },

  // 사업장별 근무 스케줄 통계 조회
  getStatistics: (workplaceId: number) => {
    return api.get(
      `/api/business-owner/work-schedules/workplace/${workplaceId}/statistics`
    );
  },

  // 사업장별 파트타임 직원 목록 조회 (새로 추가)
  getWorkplaceEmployees: (workplaceId: number) => {
    return api.get(`/api/business-owner/workplaces/${workplaceId}/employees`);
  },

  // 특정 직원의 근무 스케줄 상세 조회 (새로 추가)
  getEmployeeScheduleDetail: (workplaceId: number, employeeUserId: number) => {
    return api.get(
      `/api/business-owner/workplaces/${workplaceId}/employees/${employeeUserId}`
    );
  },
};

// PartTime API (최신 인증 기반 API)
export const partTimeTestApis = {
  // 초대 코드 생성/갱신 (인증된 사용자 기준)
  generateInviteCode: () => {
    return api.post("/api/parttime/invite-code");
  },

  // 내 파트타임 정보 조회 (인증된 사용자 기준)
  getMyPartTimeInfo: () => {
    return api.get("/api/parttime/my-info");
  },

  // 초대 코드로 파트타임 조회
  getByInviteCode: (inviteCode: string) => {
    return api.get(`/api/parttime/invite-code/${inviteCode}`);
  },

  // 내 근무 일정 조회 (인증된 아르바이트 기준)
  getMyWorkSchedules: () => {
    return api.get("/api/parttime/my-work-schedules");
  },
};

// 통합 API 객체
export const testApis = {
  auth: authTestApis,
  user: userTestApis,
  businessOwner: businessOwnerTestApis,
  workplace: workplaceTestApis,
  workSchedule: workScheduleTestApis,
  partTime: partTimeTestApis,
};

// 네트워크 연결 테스트 유틸리티 (간소화)
export const networkUtils = {
  // 간단한 서버 연결 확인
  checkConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      // 기존 API 엔드포인트로 간단한 연결 테스트
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      // 400, 401 등의 응답도 연결 성공으로 간주
      return {
        success: true,
        message: `서버 연결 확인 (상태: ${response.status})`,
      };
    } catch (error: any) {
      let message = "서버 연결 실패";
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        message = "네트워크 연결 오류 - 서버가 실행되지 않았을 수 있습니다";
      }

      return {
        success: false,
        message,
      };
    }
  },
};

export default api;
