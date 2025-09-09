// src/lib/queries/joinUser.ts
import { useMutation } from "@tanstack/react-query";
import api from "../api"; // axios instance
import { ApiResponse, OnboardResponse } from "@/src/types/api";

export interface Schedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface JoinUserRequest {
  workplaceId: number;
  inviteCode: string; // 알바 초대코드
  contractStartDate: string; // 계약 시작일 (YYYY-MM-DD)
  contractEndDate?: string; // 계약 종료일 (YYYY-MM-DD, 선택)
  hourlyWage?: number; // 시급 (원)
  schedules?: Schedule[]; // 요일 기반 스케줄 (선택)
  forceCreate?: boolean; // ✨ 강제 등록 여부 (기본값: false)
  restoreExisting?: boolean; // ✨ 기존 데이터 복구 여부 (선택)
}

export const useJoinUser = () => {
  return useMutation<ApiResponse<OnboardResponse>, Error, JoinUserRequest>({
    mutationFn: async ({
      workplaceId,
      inviteCode,
      schedules,
      contractStartDate,
      contractEndDate,
      hourlyWage,
      forceCreate = false,
      restoreExisting = false,
    }: JoinUserRequest) => {
      const res = await api.post(
        `/api/business-owner/workplaces/${workplaceId}/employees/onboard`,
        {
          inviteCode,
          schedules,
          contractStartDate,
          contractEndDate,
          hourlyWage,
          forceCreate,
          restoreExisting,
        }
      );
      return res.data;
    },
  });
};
