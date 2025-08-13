// src/lib/api/getWP.ts

import api from "../api";

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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  workplaceColorIndex: number;
}

export interface GetWorkplacesResponse {
  success: boolean;
  message: string;
  data: Workplace[];
}

// 사업장 목록 조회 API 함수
export const getMyWorkPlaces = async (): Promise<GetWorkplacesResponse> => {
  const res = await api.get("/api/v1/part-time/my-workplaces");
  console.log("👀 응답 데이터:", res.data);
  return res.data;
};
