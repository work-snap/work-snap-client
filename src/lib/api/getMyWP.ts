// src/lib/api/getWP.ts

import api from "../api";

// 기본 Workplace 정보
export interface Workplace {
  id: number;
  businessOwnerId: number;
  workplaceName: string;
  workplaceType: string | null;
  workplaceAddress: string;
  workplacePhone: string;
  workplaceEmail: string | null;
  workplaceDescription: string;
  employeeCount: number | null;
  operatingHours: string | null;
  businessLicenseNumber: string | null;
  isMainWorkplace: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workplaceColorIndex: number;
}

// 스케줄 정보
export interface Schedule {
  id: number;
  workplaceId: number;
  workplaceName: string;
  userId: number;
  inviteCode: string | null;
  dayOfWeek: string;
  dayOfWeekKorean: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  workingHours: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  scheduledStartDate: string | null;
  scheduledEndDate: string | null;
  attendanceRecord: string | null;
  currentStatus: string | null;
}

// 사업장 상세 + 계약 + 스케줄 구조
export interface WorkplaceDetail {
  workplace: Workplace;
  contractStartDate: string;
  contractEndDate: string;
  schedules: Schedule[];
}

// Summary 타입 (/my-workplaces/summary 응답)
export interface WorkplaceSummary {
  id: number;
  workplaceName: string;
  workplaceType: string | null;
  workplaceAddress: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  workplaceColorIndex: number | null;
}

export interface GetWorkplacesResponse {
  success: boolean;
  message: string;
  data: WorkplaceDetail[];
}

export interface GetWorkplacesSummaryResponse {
  success: boolean;
  message: string;
  data: WorkplaceSummary[];
}

// 상세 사업장 목록 조회 (기존 기능 유지)
export const getMyWorkPlaces = async (): Promise<GetWorkplacesResponse> => {
  const res = await api.get("/api/v1/part-time/my-workplaces");
  console.log("👀 응답 데이터:", res.data);
  return res.data;
};

// 사업장 요약 목록 조회 (신규)
export const getMyWorkplacesSummary =
  async (): Promise<GetWorkplacesSummaryResponse> => {
    const res = await api.get("/api/v1/part-time/my-workplaces/summary");
    return res.data;
  };
