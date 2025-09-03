// src/lib/api/getBusinessOwnerWorkplaces.ts

import api from "../api";

export interface BusinessOwnerWorkplace {
  id: number;
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

export interface WorkplaceStatistics {
  totalWorkplaces: number;
  totalEmployees: number;
  activeWorkplaces: number;
}

export interface BusinessOwnerWorkplacesResponse {
  workplaces: BusinessOwnerWorkplace[];
  statistics: WorkplaceStatistics;
}

/**
 * 사업자의 사업장 목록을 가져오는 API 함수
 */
export const getBusinessOwnerWorkplaces =
  async (): Promise<BusinessOwnerWorkplacesResponse> => {
    try {
      const response = await api.get("/api/business-owner/workplaces");
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "사업장 목록 조회에 실패했습니다.");
    }
  };

/**
 * 사업자가 사업장을 보유하고 있는지 확인하는 헬퍼 함수
 */
export const hasAnyWorkplace = async (): Promise<boolean> => {
  try {
    const data = await getBusinessOwnerWorkplaces();
    return data.workplaces && data.workplaces.length > 0;
  } catch (error) {
    console.error("사업장 보유 여부 확인 실패:", error);
    return false; // 에러 시 안전하게 false 반환
  }
};
