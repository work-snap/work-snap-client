// src/lib/api/getWP.ts

import api from "../api";

export interface Workplace {
  id: number;
  businessOwnerId: number;
  workplaceName: string;
  businessType: string;
  businessTypeKorean: string;
  address: string;
  detailedAddress: string;
  workplacePhone: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  workplaceDescription: string;
  operatingHours: string;
  employeeCount: number;
  monthlyCustomers: number;
  registrationDate: string;
  lastModifiedDate: string;
}

export interface Statistics {
  totalWorkplaces: number;
  activeWorkplaces: number;
  totalEmployees: number;
  totalMonthlyCustomers: number;
  hasMainWorkplace: boolean;
}

export interface WorkPlacesResponse {
  workplaces: Workplace[];
  statistics: Statistics;
}

// 사업장 목록 조회 API 함수
export const getWorkPlaces = async (): Promise<WorkPlacesResponse> => {
  const res = await api.get("/api/business-owner/workplaces");
  console.log("👀 응답 데이터:", res.data);
  return res.data;
};
