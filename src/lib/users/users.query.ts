import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStats,
  deleteUsers,
  resetUserPassword,
  updateUserRole,
  uploadUserProfileImage,
  exportUsers,
} from "./users";
import type {
  UsersListRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "./types";

// React Query 키 상수
export const USERS_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all, "list"] as const,
  list: (params: UsersListRequest) =>
    [...USERS_QUERY_KEYS.lists(), params] as const,
  details: () => [...USERS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
  stats: () => [...USERS_QUERY_KEYS.all, "stats"] as const,
};

// 사용자 목록 조회 훅
export const useUsers = (
  params: UsersListRequest = {},
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(params),
    queryFn: () => getUsers(params),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    enabled: options?.enabled ?? true,
  });
};

// 사용자 상세 조회 훅
export const useUser = (
  id: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
};

// 사용자 통계 조회 훅
export const useUserStats = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.stats(),
    queryFn: getUserStats,
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: options?.refetchInterval ?? 5 * 60 * 1000, // 5분마다 자동 갱신
    enabled: options?.enabled ?? true,
  });
};

// 사용자 생성 훅
export const useCreateUser = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: (data) => {
      // 사용자 목록 및 통계 무효화
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 사용자 수정 훅
export const useUpdateUser = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserRequest }) =>
      updateUser(id, userData),
    onSuccess: (data, variables) => {
      // 특정 사용자 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(variables.id),
      });
      // 사용자 목록 무효화
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      // 통계 무효화
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 사용자 삭제 훅
export const useDeleteUser = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (data, id) => {
      // 삭제된 사용자의 캐시 제거
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      // 사용자 목록 및 통계 무효화
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 사용자 상태 변경 훅
export const useUpdateUserStatus = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    }) => updateUserStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 사용자 일괄 삭제 훅
export const useDeleteUsers = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteUsers(ids),
    onSuccess: (data, ids) => {
      // 삭제된 사용자들의 캐시 제거
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 비밀번호 초기화 훅
export const useResetUserPassword = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

// 사용자 역할 변경 훅
export const useUpdateUserRole = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: "ADMIN" | "BUSINESS_OWNER" | "PART_TIME_WORKER";
    }) => updateUserRole(id, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 프로필 이미지 업로드 훅
export const useUploadUserProfileImage = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadUserProfileImage(id, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// 사용자 목록 내보내기 훅
export const useExportUsers = (options?: {
  onSuccess?: (data: Blob) => void;
  onError?: (error: any) => void;
}) => {
  return useMutation({
    mutationFn: (params: UsersListRequest = {}) => exportUsers(params),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};