// src/lib/api/createWP.ts
import api from "../api";

// ✅ 요청 타입
export interface CreateWPRequest {
  workplaceName: string;
  workplacePhone: string;
  workplaceDescription: string;
  isMainWorkplace?: boolean; // 선택값 (첫 사업장 등록 시 true 가능)
}

// ✅ 응답 타입
export interface CreateWPResponse {
  id: number;
  businessOwnerId: number;
  workplaceName: string;
  businessType: string;
  businessTypeKorean: string;
  address: string;
  detailedAddress: string;
  phoneNumber: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  description: string;
  operatingHours: string;
  employeeCount: number;
  monthlyCustomers: number;
  registrationDate: string;
  lastModifiedDate: string;
}

export const createWP = async (
  payload: CreateWPRequest
): Promise<CreateWPResponse> => {
  try {
    const res = await api.post(`/api/business-owner/workplaces`, {
      workplaceName: payload.workplaceName,
      workplacePhone: payload.workplacePhone,
      workplaceDescription: payload.workplaceDescription,
      ...(payload.isMainWorkplace !== undefined && {
        isMainWorkplace: payload.isMainWorkplace,
      }),
    });

    console.log("👀 응답 데이터:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ 사업장 등록 실패:", error.response?.data || error);
    throw error;
  }
};
