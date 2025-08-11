// src/lib/api/getWorkplaceDetail.ts
import api from "../api";

export interface WorkplaceDetailResponse {
  id: number;
  businessOwnerId: number;
  workplaceType: string;
  workplaceName: string;
  workplaceAddress: string;
  workplacePhone: string;
  workplaceEmail: string | null;
  workplaceDescription: string;
  employeeCount: number | null;
  isActive: boolean;
  isMainWorkplace: boolean;
  createdAt: string;
  updatedAt: string;
  workplaceAccentColorIndex: number | null;
}

export const getWorkplaceDetail = async (workplaceId: number) => {
  const { data } = await api.get<WorkplaceDetailResponse>(
    `/api/business-owner/workplaces/${workplaceId}`
  );
  return data;
};
