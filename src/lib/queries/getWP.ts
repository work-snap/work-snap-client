// src/lib/queries/useGetWP.ts
import { useQuery } from "@tanstack/react-query";
import { getWorkPlaces } from "@/src/lib/api/getWP";

export const useGetWP = () => {
  return useQuery({
    queryKey: ["useGetWP"],
    queryFn: getWorkPlaces,
    retry: 0,
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분 동안 메모리에 보관
    refetchOnMount: false, // 이미 데이터가 있으면 다시 요청하지 않음
    refetchOnWindowFocus: false, // 창 포커스 시 재요청 안함
  });
};
