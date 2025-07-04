import api from "../../../lib/api";
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
  ClockInReq,
  ClockOutReq,
  AdditionalWorkCreateReq,
} from "./types";

// Auth API
export const authTestApis = {
  // ✅ 수정: 실제 카카오 로그인 API 호출 (Mock 응답 제거)
  kakaoLogin: (data: { code: string; userType: string }) => {
    return api.post("/api/auth/kakao/login", data);
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

  // ✅ 수정: 개발 토큰 생성 경로 수정 (사용자 ID)
  generateDevToken: (userId: string) => {
    return api.post(`/api/auth/dev-token/${userId}`);
  },

  // ✅ 수정: 개발 토큰 생성 경로 수정 (닉네임)
  generateDevTokenByNickname: (nickname: string) => {
    return api.post(
      `/api/auth/dev-token/nickname/${encodeURIComponent(nickname)}`
    );
  },
};

// User API
export const userTestApis = {
  // ✅ 수정: v1 버전 추가 - 내 정보 조회
  getMyInfo: () => {
    return api.get("/api/v1/users/profile");
  },

  // ✅ 수정: v1 버전 추가 - 내 정보 수정
  updateMyInfo: (data: UserUpdateForm) => {
    return api.put("/api/v1/users/profile", data);
  },

  // ✅ 수정: v1 버전 추가 - 사용자 타입 선택
  selectUserType: (userType: string) => {
    return api.post("/api/v1/users/select-type", { userType });
  },

  // ✅ 수정: v1 버전 및 경로 통일 - 사용자 정보 조회
  getUserInfo: () => {
    return api.get("/api/v1/users/info");
  },

  // ✅ 수정: v1 버전 및 경로 통일 - 사용자 정보 수정
  updateUserInfo: (data: any) => {
    return api.put("/api/v1/users/info", data);
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

  // ✅ 수정: info → profile 경로 변경
  getBusinessOwner: () => {
    return api.get("/api/business-owner/profile");
  },

  // 사업자 검증 상태 조회
  getVerificationStatus: () => {
    return api.get("/api/business-owner/verification-status");
  },

  // 사업자등록번호 테스트 (개발용)
  testBusinessNumber: (data: BusinessOwnerTestRequest) => {
    return api.post("/api/business-owner/test-business-number", data);
  },

  // ✅ 수정: 이미 올바른 경로 - 프로필 조회
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
  // ✅ 수정: 근무 스케줄 배치 등록 - /batch 경로 추가
  create: (data: WorkScheduleBatchCreateForm) => {
    return api.post("/api/business-owner/work-schedules/batch", data);
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

// ✅ 수정: PartTime API - v1 버전 추가 및 part-time 경로 수정
export const partTimeTestApis = {
  // ✅ 수정: 초대 코드 생성/갱신 - v1 버전 및 part-time 경로 적용
  generateInviteCode: (
    workplaceId?: number,
    expiresInHours?: number,
    maxUsageCount?: number,
    memo?: string
  ) => {
    const params = new URLSearchParams();
    if (workplaceId) params.append("workplaceId", workplaceId.toString());
    if (expiresInHours)
      params.append("expiresInHours", expiresInHours.toString());
    if (maxUsageCount) params.append("maxUsageCount", maxUsageCount.toString());
    if (memo) params.append("memo", memo);

    return api.post(`/api/v1/part-time/invite-code?${params.toString()}`);
  },

  // ✅ 수정: 내 파트타임 정보 조회 - v1 버전 및 part-time 경로 적용
  getMyPartTimeInfo: () => {
    return api.get("/api/v1/part-time/schedule");
  },

  // ✅ 수정: 초대 코드로 파트타임 조회 - v1 버전 및 part-time 경로 적용
  getByInviteCode: (inviteCode: string) => {
    return api.get(`/api/v1/part-time/invite-codes`);
  },

  // ✅ 수정: 내 근무 일정 조회 - v1 버전 및 part-time 경로 적용
  getMyWorkSchedules: () => {
    return api.get("/api/v1/part-time/schedule");
  },

  // ✅ 수정: 파트타임 등록 - v1 버전 및 part-time 경로 적용
  registerWithInviteCode: (inviteCode: string, preferredStartDate?: string) => {
    const params = new URLSearchParams();
    params.append("inviteCode", inviteCode);
    if (preferredStartDate)
      params.append("preferredStartDate", preferredStartDate);

    return api.post(`/api/v1/part-time/register?${params.toString()}`);
  },

  // ✅ 수정: 파트타임 근무자 목록 조회 - v1 버전 및 part-time 경로 적용
  getPartTimeWorkers: (workplaceId?: number, status?: string) => {
    const params = new URLSearchParams();
    if (workplaceId) params.append("workplaceId", workplaceId.toString());
    if (status) params.append("status", status);

    return api.get(`/api/v1/part-time/workers?${params.toString()}`);
  },
};

// ✅ 수정: Attendance API - 모든 경로에 v1 버전 추가
export const attendanceTestApis = {
  // ✅ 수정: 오늘의 출근 기록 생성 - v1 버전 추가
  createTodayAttendance: () => {
    return api.post("/api/v1/attendance/today");
  },

  // ✅ 수정: 특정 날짜 출근 기록 생성 - v1 버전 추가
  createDailyAttendance: (date: string) => {
    return api.post(`/api/v1/attendance/daily?date=${date}`);
  },

  // ✅ 수정: 출근 처리 - v1 버전 추가
  clockIn: (attendanceId: number, data: ClockInReq) => {
    return api.post(`/api/v1/attendance/${attendanceId}/clock-in`, data);
  },

  // ✅ 수정: 퇴근 처리 - v1 버전 추가
  clockOut: (attendanceId: number, data: ClockOutReq) => {
    return api.post(`/api/v1/attendance/${attendanceId}/clock-out`, data);
  },

  // ✅ 수정: 추가 근무 등록 - v1 버전 추가
  createAdditionalWork: (data: AdditionalWorkCreateReq) => {
    return api.post("/api/v1/attendance/additional-work", data);
  },

  // ✅ 수정: 특정 날짜 출근 현황 조회 - v1 버전 추가 및 쿼리 파라미터 방식으로 변경
  getDailyAttendance: (date: string) => {
    return api.get(`/api/v1/attendance/daily?date=${date}`);
  },

  // ✅ 수정: 기간별 출근 기록 조회 - v1 버전 추가
  getAttendanceByPeriod: (startDate: string, endDate: string) => {
    return api.get(
      `/api/v1/attendance/period?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // ✅ 수정: 월별 출근 통계 조회 - v1 버전 추가
  getMonthlyStatistics: (yearMonth: string) => {
    return api.get(
      `/api/v1/attendance/monthly-statistics?yearMonth=${yearMonth}`
    );
  },

  // ✅ 수정: 진행중인 근무 조회 - v1 버전 추가
  getActiveAttendance: () => {
    return api.get("/api/v1/attendance/active");
  },

  // ✅ 수정: 추가 근무 삭제 - v1 버전 추가
  deleteAdditionalWork: (attendanceId: number) => {
    return api.delete(`/api/v1/attendance/additional-work/${attendanceId}`);
  },

  // ✅ 수정: 사업장 일별 출근 현황 조회 - v1 버전 추가
  getWorkplaceDailyAttendance: (workplaceId: number, date: string) => {
    return api.get(
      `/api/v1/attendance/workplace/${workplaceId}/daily?date=${date}`
    );
  },

  // ✅ 수정: 오늘의 출근 기록 조회 - v1 버전 추가
  getTodayAttendance: () => {
    return api.get("/api/v1/attendance/today");
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
  attendance: attendanceTestApis,
};

// ✅ 수정: 네트워크 연결 테스트 유틸리티 - 올바른 헬스체크 엔드포인트 사용
export const networkUtils = {
  // 간단한 서버 연결 확인
  checkConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      // ✅ 수정: 헬스체크 엔드포인트 사용
      const response = await fetch("http://localhost:8080/api/ping", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // 200 응답이면 연결 성공
      if (response.ok) {
        return {
          success: true,
          message: `서버 연결 성공 (상태: ${response.status})`,
        };
      } else {
        return {
          success: false,
          message: `서버 응답 오류 (상태: ${response.status})`,
        };
      }
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
