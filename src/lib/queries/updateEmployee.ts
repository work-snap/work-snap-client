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
  contractStartDate: string; // "YYYY-MM-DD" (필수)
  contractEndDate?: string; // "YYYY-MM-DD" (선택사항)
  hourlyWageUpdate?: {
    // 선택사항으로 변경
    newHourlyWage: number;
    changeType: "IMMEDIATE" | "SCHEDULED"; // "DEFERRED" → "SCHEDULED"
    scheduledChangeDate?: string; // "YYYY-MM-DD" (SCHEDULED일 때 필수)
  };
  schedules?: ScheduleItem[]; // 선택사항으로 변경
}

// ✅ 추가: 서버 응답 타입 정의
export interface EmployeeUpdateResponse {
  success: boolean;
  data: {
    success: boolean;
    updatedFields: {
      contractStartDate: string;
      contractEndDate?: string;
      hourlyWage?: {
        newHourlyWage: number;
        changeType: "IMMEDIATE" | "SCHEDULED";
        effectiveDate: string;
        scheduledChangeDate?: string;
      };
      scheduleCount: number;
      schedules: ScheduleItem[];
    };
    message: string;
  };
  message: string;
}

// ✅ useMutation 타입 강화
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<
    EmployeeUpdateResponse, // 응답 타입 명시
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
    onSuccess: (data, { workplaceId, employeeId }) => {
      console.log("수정 성공:", data);
      // ✅ 개별 직원 상세 정보와 직원 목록 모두 무효화
      queryClient.invalidateQueries({
        queryKey: ["employeeDetail", workplaceId, employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["employeeList", workplaceId],
      });
    },
  });
};
