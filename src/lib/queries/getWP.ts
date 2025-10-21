// src/lib/queries/useGetWP.ts
import { useQuery } from "@tanstack/react-query";
import { getWorkPlaces } from "@/src/lib/api/getWP";

export const useGetWP = () => {
  return useQuery({
    queryKey: ["useGetWP"],
    queryFn: getWorkPlaces,
    retry: 0,
    staleTime: 1 * 60 * 1000, // 1분 동안 캐시 유지 (등록 후 빠른 갱신)
    gcTime: 10 * 60 * 1000, // 10분 동안 메모리에 보관
    refetchOnMount: true, // 마운트 시 stale 상태면 재요청
    refetchOnWindowFocus: false, // 창 포커스 시 재요청 안함
  });
};
