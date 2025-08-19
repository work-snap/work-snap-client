// src/lib/queries/joinUser.ts
import { useMutation } from "@tanstack/react-query";
import api from "../api"; // axios instance

export interface Schedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface JoinUserRequest {
  workplaceId: number;
  inviteCode: string;
  schedules: Schedule[];
  contractStartDate: string;
  contractEndDate: string;
  hourlyWage: number; // 시급 정보 추가
}

export const useJoinUser = () => {
  return useMutation({
    mutationFn: async ({
      workplaceId,
      inviteCode,
      schedules,
      contractStartDate,
      contractEndDate,
      hourlyWage,
    }: JoinUserRequest) => {
      const res = await api.post(
        `/api/business-owner/workplaces/${workplaceId}/employees/onboard`,
        {
          inviteCode,
          schedules,
          contractStartDate,
          contractEndDate,
          hourlyWage,
        }
      );
      return res.data;
    },
  });
};
