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
    staleTime: 0, // ✅ 캐시를 즉시 stale 상태로 만들어 항상 최신 데이터 확인
    refetchOnMount: "always", // ✅ 컴포넌트 마운트 시 항상 재조회
  });
};
