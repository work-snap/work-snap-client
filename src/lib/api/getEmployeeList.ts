// src/lib/api/getEmployeeList.ts
import api from "../api";

// 타입 정의
export interface EmployeeSchedule {
  dayOfWeekKorean: string;
  startTime: string;
  endTime: string;
}

export interface Employee {
  userId: number;
  name: string;
  phoneNumber: string;
  inviteCode: string;
  contractStartDate: string;
  contractEndDate: string;
  schedules: EmployeeSchedule[];
  activeScheduleCount: number;
  totalScheduleCount: number;
  createdAt: string;
}

export interface GetEmployeeListResponse {
  success: boolean;
  data: Employee[];
  totalCount: number;
}

// 상세 사업장 직원 스케줄 조회
export const getEmployeeList = async (
  workplaceId: number
): Promise<GetEmployeeListResponse> => {
  const res = await api.get<GetEmployeeListResponse>(
    `/api/business-owner/workplace/${workplaceId}/employees`
  );
  console.log("👀 직원 스케줄 응답 데이터:", res.data);
  return res.data;
};
