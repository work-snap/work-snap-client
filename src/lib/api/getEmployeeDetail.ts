// src/lib/api/getEmployeeDetail.ts
import api from "../api";

// 개별 직원 상세 정보 타입 정의
export interface EmployeeDetail {
  userId: number;
  name: string;
  phoneNumber: string;
  inviteCode: string;
  contractStartDate: string;
  contractEndDate?: string; // 선택사항
  currentHourlyWage?: number; // 현재 시급 (서버 응답 필드명에 맞춤)
  schedules: EmployeeSchedule[];
  activeScheduleCount: number;
  totalScheduleCount: number;
  createdAt: string;
}

export interface EmployeeSchedule {
  dayOfWeekKorean: string;
  startTime: string;
  endTime: string;
}

export interface GetEmployeeDetailResponse {
  success: boolean;
  data: EmployeeDetail;
  message: string;
}

// 개별 직원 상세 정보 조회
export const getEmployeeDetail = async (
  workplaceId: number,
  employeeUserId: number
): Promise<GetEmployeeDetailResponse> => {
  const res = await api.get<GetEmployeeDetailResponse>(
    `/api/business-owner/workplace/${workplaceId}/employee/${employeeUserId}`
  );
  console.log("👀 직원 상세 정보 응답 데이터:", res.data);
  return res.data;
};
