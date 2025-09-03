// src/lib/queries/getPartTimeWorkerWorkplaces.ts

import { useQuery } from "@tanstack/react-query";
import {
  getPartTimeWorkerWorkplaces,
  hasAnyActiveWorkplace,
} from "../api/getPartTimeWorkerWorkplaces";

/**
 * 알바가 등록된 사업장 목록을 가져오는 쿼리 훅
 */
export const usePartTimeWorkerWorkplaces = () => {
  return useQuery({
    queryKey: ["partTimeWorkerWorkplaces"],
    queryFn: getPartTimeWorkerWorkplaces,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * 알바가 활성 사업장이 있는지 확인하는 쿼리 훅
 * @param enabled - 쿼리 실행 여부 (알바인 경우에만 실행)
 */
export const useHasAnyActiveWorkplace = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["hasAnyActiveWorkplace"],
    queryFn: async () => {
      try {
        const response = await hasAnyActiveWorkplace();
        return response.data.hasActiveWorkplace;
      } catch (error) {
        console.error("useHasAnyActiveWorkplace 에러:", error);
        // API 오류 시 기본값으로 false 반환 (변경 허용)
        return false;
      }
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3분
    gcTime: 5 * 60 * 1000, // 5분
    retry: 1, // 재시도 1회로 제한
    retryDelay: 1000, // 1초 후 재시도
  });
};
