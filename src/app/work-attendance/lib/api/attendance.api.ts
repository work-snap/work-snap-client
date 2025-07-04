import api from "../../../../lib/api";
import {
  AttendanceRes,
  DailyAttendanceRes,
  ClockInReq,
  ClockOutReq,
  ApiResponse,
} from "../types";

/**
 * 출근 관리 API 서비스
 * 실제 서버 API와 통신하는 서비스 클래스
 */
class AttendanceApiService {
  private readonly baseUrl = "/api/v1/attendance";

  /**
   * 오늘의 출근 기록 조회
   */
  async getTodayAttendance(): Promise<AttendanceRes | null> {
    try {
      const response = await api.get<ApiResponse<AttendanceRes>>(
        `${this.baseUrl}/today`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "출근 기록 조회 실패");
      }
    } catch (error) {
      console.error("getTodayAttendance error:", error);

      // 404 에러인 경우 (오늘 일정이 없음) null 반환
      if (this.isNotFoundError(error)) {
        return null;
      }

      throw this.handleApiError(error, "오늘의 출근 기록을 불러올 수 없습니다");
    }
  }

  /**
   * 출근 처리
   */
  async clockIn(
    attendanceId: number,
    request: ClockInReq
  ): Promise<AttendanceRes> {
    try {
      const response = await api.post<ApiResponse<AttendanceRes>>(
        `${this.baseUrl}/${attendanceId}/clock-in`,
        request
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "출근 처리 실패");
      }
    } catch (error) {
      console.error("clockIn error:", error);
      throw this.handleApiError(error, "출근 처리 중 오류가 발생했습니다");
    }
  }

  /**
   * 퇴근 처리
   */
  async clockOut(
    attendanceId: number,
    request: ClockOutReq
  ): Promise<AttendanceRes> {
    try {
      const response = await api.post<ApiResponse<AttendanceRes>>(
        `${this.baseUrl}/${attendanceId}/clock-out`,
        request
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "퇴근 처리 실패");
      }
    } catch (error) {
      console.error("clockOut error:", error);
      throw this.handleApiError(error, "퇴근 처리 중 오류가 발생했습니다");
    }
  }

  /**
   * 일별 출근 현황 조회
   */
  async getDailyAttendance(date: string): Promise<DailyAttendanceRes> {
    try {
      const response = await api.get<ApiResponse<DailyAttendanceRes>>(
        `${this.baseUrl}/daily`,
        { params: { date } }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "일별 출근 현황 조회 실패");
      }
    } catch (error) {
      console.error("getDailyAttendance error:", error);
      throw this.handleApiError(error, "출근 현황을 불러올 수 없습니다");
    }
  }

  /**
   * 진행 중인 출근 기록 조회
   */
  async getActiveAttendance(): Promise<AttendanceRes[]> {
    try {
      const response = await api.get<ApiResponse<AttendanceRes[]>>(
        `${this.baseUrl}/active`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "활성 출근 기록 조회 실패");
      }
    } catch (error) {
      console.error("getActiveAttendance error:", error);
      throw this.handleApiError(
        error,
        "진행 중인 출근 기록을 불러올 수 없습니다"
      );
    }
  }

  /**
   * 특정 출근 기록 조회
   */
  async getAttendanceById(attendanceId: number): Promise<AttendanceRes> {
    try {
      const response = await api.get<ApiResponse<AttendanceRes>>(
        `${this.baseUrl}/${attendanceId}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "출근 기록 조회 실패");
      }
    } catch (error) {
      console.error("getAttendanceById error:", error);
      throw this.handleApiError(error, "출근 기록을 불러올 수 없습니다");
    }
  }

  /**
   * 추가 근무 등록
   */
  async createAdditionalWork(request: {
    workDate: string;
    workplaceId: number;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<AttendanceRes> {
    try {
      const response = await api.post<ApiResponse<AttendanceRes>>(
        `${this.baseUrl}/additional-work`,
        request
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "추가 근무 등록 실패");
      }
    } catch (error) {
      console.error("createAdditionalWork error:", error);
      throw this.handleApiError(error, "추가 근무 등록 중 오류가 발생했습니다");
    }
  }

  /**
   * API 에러 처리 헬퍼
   */
  private handleApiError(error: any, defaultMessage: string): Error {
    if (error.response) {
      // 서버 응답 에러
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      switch (status) {
        case 400:
          return new Error(serverMessage || "잘못된 요청입니다");
        case 401:
          return new Error("로그인이 필요합니다");
        case 403:
          return new Error("권한이 없습니다");
        case 404:
          return new Error(serverMessage || "요청한 데이터를 찾을 수 없습니다");
        case 409:
          return new Error(serverMessage || "이미 처리된 요청입니다");
        case 422:
          return new Error(serverMessage || "입력 데이터가 올바르지 않습니다");
        case 500:
          return new Error(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
          );
        default:
          return new Error(serverMessage || defaultMessage);
      }
    } else if (error.request) {
      // 네트워크 에러
      return new Error("네트워크 연결을 확인해주세요");
    } else {
      // 기타 에러
      return new Error(error.message || defaultMessage);
    }
  }

  /**
   * 404 에러 체크 헬퍼
   */
  private isNotFoundError(error: any): boolean {
    return error.response?.status === 404;
  }

  /**
   * 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await api.get("/api/v1/health");
      return response.status === 200;
    } catch (error) {
      console.error("API 연결 확인 실패:", error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const attendanceApi = new AttendanceApiService();
