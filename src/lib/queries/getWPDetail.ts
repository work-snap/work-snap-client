// src/lib/queries/getWorkplaceDetail.ts
import { useQuery } from "@tanstack/react-query";
import { getWorkplaceDetail } from "../api/getWPDetail";

export const useGetWorkplaceDetail = (workplaceId: number) => {
  return useQuery({
    queryKey: ["workplaceDetail", workplaceId],
    queryFn: () => getWorkplaceDetail(workplaceId),
    enabled: !!workplaceId, // id 있을 때만 실행
  });
};
