// src/lib/api/changeUserType.ts

import { ApiResponse } from "@/src/types/api";
import api from "../api"; // axios instance

export interface UserTypeChangeRequest {
  userType: "BUSINESS_OWNER" | "PART_TIME_WORKER" | "PENDING";
  additionalInfo?: string;
}

export interface UserTypeChangeResponse {
  userId: number;
  previousType: string;
  newType: string;
  typeSetAt: string;
  nextSteps: string[];
  enabledFeatures: string[];
  onboardingUrl: string;
}

/**
 * 사용자 타입을 변경하는 API 함수
 */
export const changeUserType = async (
  request: UserTypeChangeRequest
): Promise<ApiResponse<UserTypeChangeResponse>> => {
  try {
    const response = await api.post("/api/v1/users/select-type", request);
    return response.data;
  } catch (error: any) {
    // axios 에러 처리
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "사용자 타입 변경에 실패했습니다.");
  }
};

/**
 * 사업자로 타입 변경하는 헬퍼 함수
 */
export const changeToBusinessOwner = async (additionalInfo?: string) => {
  return changeUserType({
    userType: "BUSINESS_OWNER",
    additionalInfo: additionalInfo || "사용자 요청에 의한 사업자 타입 변경",
  });
};

/**
 * 파트타임 근무자로 타입 변경하는 헬퍼 함수
 */
export const changeToPartTimeWorker = async (additionalInfo?: string) => {
  return changeUserType({
    userType: "PART_TIME_WORKER",
    additionalInfo:
      additionalInfo || "사용자 요청에 의한 파트타임 근무자 타입 변경",
  });
};
