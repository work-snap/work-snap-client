// src/lib/queries/useGetEmployeeList.ts
import { useQuery } from "@tanstack/react-query";
import {
  getEmployeeList,
  GetEmployeeListResponse,
} from "../api/getEmployeeList";

export const useGetEmployeeList = (workplaceId: number) => {
  return useQuery<GetEmployeeListResponse>({
    queryKey: ["employeeList", workplaceId],
    queryFn: () => getEmployeeList(workplaceId),
    enabled: !!workplaceId, // workplaceId 없으면 호출 안 함
  });
};
