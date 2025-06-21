import axios from "axios";
import {
  BusinessOwnerRegistrationForm,
  UserUpdateForm,
  LoginRequest,
  BusinessOwnerTestRequest,
} from "./types";

// API 클라이언트 설정
const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 interceptor 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 interceptor 설정
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
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

// 통합 API 객체
export const testApis = {
  auth: authTestApis,
  user: userTestApis,
  businessOwner: businessOwnerTestApis,
};

export default api;
