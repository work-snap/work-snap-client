// src/lib/queries/updateEmployee.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api"; // axios instance

export interface ScheduleItem {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface UpdateEmployeeRequest {
  contractStartDate: string; // "YYYY-MM-DD"
  contractEndDate: string; // "YYYY-MM-DD"
  hourlyWageUpdate: {
    newHourlyWage: number;
    changeType: "IMMEDIATE" | "DEFERRED";
  };
  schedules: ScheduleItem[];
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any, // 서버 응답 타입 (원한다면 명시 가능)
    Error,
    { workplaceId: number; employeeId: number; payload: UpdateEmployeeRequest }
  >({
    mutationFn: async ({ workplaceId, employeeId, payload }) => {
      const res = await api.put(
        `/api/business-owner/workplaces/${workplaceId}/employees/${employeeId}`,
        payload
      );
      return res.data;
    },
    onSuccess: (_, { workplaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["employeeList", workplaceId],
      });
    },
  });
};
