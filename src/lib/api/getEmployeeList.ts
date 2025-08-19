// src/lib/api/getEmployeeList.ts

import api from "../api";

// 응답값 구조
export interface Employee {
  userId: number;
  name: string | null;
  email: string | null;
  inviteCode: string;
  activeScheduleCount: number;
  totalScheduleCount: number;
  lastWorkDate: string | null;
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
  const res = await api.get(
    `/api/business-owner/workplace/${workplaceId}/employees`
  );
  console.log("👀 직원 스케줄 응답 데이터:", res.data);
  return res.data;
};
