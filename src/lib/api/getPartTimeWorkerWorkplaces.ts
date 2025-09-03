// src/lib/api/getPartTimeWorkerWorkplaces.ts

import { ApiResponse } from "@/src/types/api";
import api from "../api"; // axios instance

export interface PartTimeWorkerWorkplace {
  id: number;
  workplaceName: string;
  businessOwnerName: string;
  address: string;
  isActive: boolean;
  joinedAt: string;
}

export interface PartTimeWorkerWorkplacesResponse {
  workplaces: PartTimeWorkerWorkplace[];
  totalCount: number;
  hasActiveWorkplace: boolean;
}

/**
 * 알바가 등록된 사업장 목록을 가져오는 API 함수
 * 실제 서버 API 엔드포인트 사용
 */
export const getPartTimeWorkerWorkplaces = async (): Promise<
  ApiResponse<PartTimeWorkerWorkplacesResponse>
> => {
  try {
    // 실제 서버에서 구현된 API 사용 - 알바의 등록된 사업장 목록
    const response = await api.get("/api/v1/part-time/my-workplaces");

    // 서버 응답을 우리 인터페이스에 맞게 변환
    const workplaces = response.data?.data || [];
    return {
      success: true,
      data: {
        workplaces: workplaces,
        totalCount: workplaces.length,
        hasActiveWorkplace: workplaces.length > 0,
      },
      message: "알바 사업장 목록 조회 성공",
    };
  } catch (error: any) {
    console.error("❌ 알바 사업장 목록 API 오류:", error);

    // 404, 500, 501 또는 API가 구현되지 않은 경우 빈 목록 반환
    if (
      error.response?.status === 404 ||
      error.response?.status === 500 ||
      error.response?.status === 501
    ) {
      console.warn(
        "⚠️ 알바 사업장 목록 API가 구현되지 않거나 서버 오류로 빈 목록을 반환합니다."
      );
      return {
        success: true,
        data: {
          workplaces: [],
          totalCount: 0,
          hasActiveWorkplace: false,
        },
        message: "API 미구현 또는 서버 오류로 빈 목록 반환",
      };
    }

    // axios 에러 처리
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      error.message || "알바 사업장 정보를 가져오는데 실패했습니다."
    );
  }
};

/**
 * 알바가 활성 사업장이 있는지만 확인하는 API 함수
 */
export const hasAnyActiveWorkplace = async (): Promise<
  ApiResponse<{ hasActiveWorkplace: boolean }>
> => {
  try {
    // 실제로는 사업장 목록을 가져와서 활성 여부 확인
    const workplacesResponse = await getPartTimeWorkerWorkplaces();
    return {
      success: true,
      data: {
        hasActiveWorkplace:
          workplacesResponse.data?.hasActiveWorkplace || false,
      },
      message: "사업장 확인 완료",
    };
  } catch (error: any) {
    console.error("❌ 알바 사업장 확인 API 오류:", error);

    // 404, 500, 501 또는 API가 구현되지 않은 경우 기본값 반환
    if (
      error.response?.status === 404 ||
      error.response?.status === 500 ||
      error.response?.status === 501
    ) {
      console.warn(
        "⚠️ 알바 사업장 확인 API가 구현되지 않거나 서버 오류로 기본값(false)을 반환합니다."
      );
      return {
        success: true,
        data: { hasActiveWorkplace: false },
        message: "API 미구현 또는 서버 오류로 기본값 반환",
      };
    }

    // axios 에러 처리
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "알바 사업장 확인에 실패했습니다.");
  }
};
