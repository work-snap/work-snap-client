// src/lib/queries/getBusinessOwnerWorkplaces.ts

import { useQuery } from "@tanstack/react-query";
import {
  getBusinessOwnerWorkplaces,
  hasAnyWorkplace,
} from "../api/getBusinessOwnerWorkplaces";

/**
 * 사업자의 사업장 목록을 가져오는 React Query hook
 */
export const useBusinessOwnerWorkplaces = () => {
  return useQuery({
    queryKey: ["businessOwnerWorkplaces"],
    queryFn: getBusinessOwnerWorkplaces,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 사업자가 사업장을 보유하고 있는지 확인하는 React Query hook
 */
export const useHasAnyWorkplace = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["hasAnyWorkplace"],
    queryFn: hasAnyWorkplace,
    staleTime: 1 * 60 * 1000, // 1분 (더 자주 갱신)
    refetchOnWindowFocus: true, // 창 포커스 시 다시 가져오기
    enabled: enabled, // 활성화 여부 제어
  });
};
