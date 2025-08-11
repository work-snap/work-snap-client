import api from "@/lib/api";
import type {
  LoginRequest,
  UserUpdateForm,
  BusinessOwnerRegistrationForm,
  BusinessOwnerTestRequest,
  WorkplaceRegistrationForm,
  WorkScheduleBatchCreateForm,
  WorkScheduleUpdateForm,
  ClockInReq,
  ClockOutReq,
} from "./types";

interface DevTokenResponse {
  accessToken: string;
  user: {
    id: string | number;
    nickname: string;
  };
}

interface KakaoLoginRequest {
  code: string;
  userType: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    nickname?: string;
  };
  isNewUser?: boolean;
}

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
    return api.post("/api/v1/users/type", { userType });
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

// Attendance API (새로 추가)
export const attendanceTestApis = {
  // 오늘의 출근 기록 생성
  createTodayAttendance: () => {
    return api.post("/api/attendance/today");
  },

  // 특정 날짜 출근 기록 생성
  createDailyAttendance: (date: string) => {
    return api.post(`/api/attendance/date/${date}`);
  },

  // 출근 처리
  clockIn: (attendanceId: number, data: ClockInReq) => {
    return api.post(`/api/attendance/${attendanceId}/clock-in`, data);
  },

  // 퇴근 처리
  clockOut: (attendanceId: number, data: ClockOutReq) => {
    return api.post(`/api/attendance/${attendanceId}/clock-out`, data);
  },

  // 추가 근무 등록
  createAdditionalWork: (data: unknown) => {
    return api.post("/api/attendance/additional-work", data);
  },

  // 특정 날짜 출근 현황 조회
  getDailyAttendance: (date: string) => {
    return api.get(`/api/attendance/daily/${date}`);
  },

  // 기간별 출근 기록 조회
  getAttendanceByPeriod: (startDate: string, endDate: string) => {
    return api.get(
      `/api/attendance/period?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // 월별 출근 통계 조회
  getMonthlyStatistics: (yearMonth: string) => {
    return api.get(`/api/attendance/statistics/${yearMonth}`);
  },

  // 진행중인 근무 조회
  getActiveAttendance: () => {
    return api.get("/api/attendance/active");
  },

  // 추가 근무 삭제
  deleteAdditionalWork: (attendanceId: number) => {
    return api.delete(`/api/attendance/${attendanceId}/additional-work`);
  },

  // 사업장 일별 출근 현황 조회 (사업자용)
  getWorkplaceDailyAttendance: (workplaceId: number, date: string) => {
    return api.get(`/api/attendance/workplace/${workplaceId}/daily/${date}`);
  },
};

// 통합 API 객체
export const testApis = {
  auth: {
    // 닉네임으로 개발 토큰 생성
    generateDevTokenByNickname: async (nickname: string) => {
      const response = await api.post(
        `/api/auth/dev-token/nickname/${nickname}`
      );
      return response;
    },

    // 사용자 ID로 개발 토큰 생성
    generateDevToken: async (userId: string) => {
      const response = await api.post(`/api/auth/dev-token/${userId}`);
      return response;
    },

    // 카카오 로그인
    kakaoLogin: async (request: KakaoLoginRequest) => {
      const response = await api.post("/api/auth/kakao/login", request);
      return response;
    },

    // 토큰 갱신
    refreshToken: async () => {
      const response = await api.post("/api/auth/refresh");
      return response;
    },

    // 로그아웃
    logout: async () => {
      const response = await api.post("/api/auth/logout");
      return response;
    },
  },
};

// 기타 테스트 API들도 필요하면 추가
