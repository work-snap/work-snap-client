import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

export interface DeleteEmployeeRequest {
  terminationDate: string; // YYYY-MM-DD 형식
  terminationReason?: string;
}

export interface TerminatedContractInfo {
  employeeId: number;
  contractStartDate: string;
  terminationDate: string;
  terminationReason: string | null;
}

export interface DeleteEmployeeResponse {
  success: boolean;
  terminatedContract: TerminatedContractInfo;
}

/**
 * 알바 계약 종료 API
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workplaceId,
      employeeId,
      payload,
    }: {
      workplaceId: number;
      employeeId: number;
      payload: DeleteEmployeeRequest;
    }) => {
      const response = await api.delete<DeleteEmployeeResponse>(
        `/api/business-owner/workplaces/${workplaceId}/employees/${employeeId}/contract`,
        {
          data: payload,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // ✅ 일치하는 캐시 키 사용
      queryClient.invalidateQueries({
        queryKey: ["employeeList", variables.workplaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workplace", variables.workplaceId, "detail"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "employee",
          variables.workplaceId,
          variables.employeeId,
          "detail",
        ],
      });
      console.log(
        "🗑️ 알바 삭제 성공 - 캐시 무효화 완료",
        variables.workplaceId
      );
    },
  });
};
