// src/lib/queries/changeUserType.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changeUserType,
  changeToBusinessOwner,
  changeToPartTimeWorker,
} from "../api/changeUserType";
import type { UserTypeChangeRequest } from "../api/changeUserType";

/**
 * 사용자 타입 변경 mutation hook
 */
export const useChangeUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserType,
    onSuccess: (data) => {
      // 사용자 정보 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      console.log("사용자 타입 변경 성공:", data);
    },
    onError: (error) => {
      console.error("사용자 타입 변경 실패:", error);
    },
  });
};

/**
 * 사업자로 타입 변경하는 전용 hook
 */
export const useChangeToBusinessOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeToBusinessOwner,
    onSuccess: (data) => {
      // 사용자 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      console.log("사업자 타입 변경 성공:", data);
    },
    onError: (error) => {
      console.error("사업자 타입 변경 실패:", error);
    },
  });
};

/**
 * 파트타임 근무자로 타입 변경하는 전용 hook
 */
export const useChangeToPartTimeWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeToPartTimeWorker,
    onSuccess: (data) => {
      // 사용자 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      console.log("파트타임 근무자 타입 변경 성공:", data);
    },
    onError: (error) => {
      console.error("파트타임 근무자 타입 변경 실패:", error);
    },
  });
};
