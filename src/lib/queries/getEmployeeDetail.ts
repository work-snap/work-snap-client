// src/lib/queries/getEmployeeDetail.ts
import { useQuery } from "@tanstack/react-query";
import {
  getEmployeeDetail,
  GetEmployeeDetailResponse,
} from "../api/getEmployeeDetail";

export const useGetEmployeeDetail = (
  workplaceId: number,
  employeeUserId: number
) => {
  return useQuery<GetEmployeeDetailResponse>({
    queryKey: ["employeeDetail", workplaceId, employeeUserId],
    queryFn: () => getEmployeeDetail(workplaceId, employeeUserId),
    enabled: !!workplaceId && !!employeeUserId, // 둘 다 있을 때만 호출
  });
};
