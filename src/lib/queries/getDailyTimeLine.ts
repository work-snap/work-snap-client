// src/lib/queries/getDailyTimeLine.ts
import { useQuery } from "@tanstack/react-query";
import { getWorkplaceDailyTimeline } from "../api/getDailyTimeLine";

export const useGetDailyTimeLine = (
  workplaceId: number | null,
  date: string | null
) => {
  return useQuery({
    queryKey: ["useGetDailyTimeLine", workplaceId, date],
    queryFn: () => getWorkplaceDailyTimeline(workplaceId!, date!),
    enabled: !!workplaceId && !!date, // 값이 있을 때만 실행
    retry: 0,
  });
};
