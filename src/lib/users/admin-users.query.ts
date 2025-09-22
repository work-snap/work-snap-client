import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi } from "./admin-users.api";
import type {
  AdminUserListRequest,
  AdminUserUpdateRequest,
} from "./admin-users.types";

/**
 * 관리자용 유저 목록 조회 (무한 스크롤)
 */
export const useAdminUsers = (filters: Omit<AdminUserListRequest, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: ["admin-users", filters],
    queryFn: async ({ pageParam }) => {
      const response = await adminUsersApi.getUsers({
        ...filters,
        cursor: pageParam as string | undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "사용자 목록 조회에 실패했습니다.");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined;
    },
    initialPageParam: undefined,
  });
};

/**
 * 관리자용 유저 상세 조회
 */
export const useAdminUserDetail = (userId: number, enabled = true) => {
  return useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      const response = await adminUsersApi.getUserDetail(userId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "사용자 상세 조회에 실패했습니다.");
      }

      return response.data;
    },
    enabled,
  });
};

/**
 * 관리자용 유저 정보 변경
 */
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updateData }: { userId: number; updateData: AdminUserUpdateRequest }) => {
      const response = await adminUsersApi.updateUser(userId, updateData);

      if (!response.success || !response.data) {
        throw new Error(response.message || "사용자 정보 변경에 실패했습니다.");
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      // 사용자 상세 정보 캐시 업데이트
      queryClient.setQueryData(["admin-user-detail", variables.userId], data);

      // 사용자 목록 캐시 무효화 (필터링 조건이 달라질 수 있으므로)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};