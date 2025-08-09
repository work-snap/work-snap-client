import api from "@/src/lib/api";
import type {
  User,
  UsersListRequest,
  UsersListResponse,
  UserDetailResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  UserStatsResponse,
} from "./types";

// 사용자 목록 조회
export const getUsers = async (
  params: UsersListRequest = {}
): Promise<UsersListResponse> => {
  const searchParams = new URLSearchParams();

  // 파라미터가 있을 때만 추가
  if (params.page !== undefined) searchParams.append("page", String(params.page));
  if (params.size !== undefined) searchParams.append("size", String(params.size));
  if (params.search) searchParams.append("search", params.search);
  if (params.role) searchParams.append("role", params.role);
  if (params.status) searchParams.append("status", params.status);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  const queryString = searchParams.toString();
  const url = `/api/admin/users${queryString ? `?${queryString}` : ""}`;

  const response = await api.get<UsersListResponse>(url);
  return response.data;
};

// 사용자 상세 조회
export const getUserById = async (id: string): Promise<UserDetailResponse> => {
  const response = await api.get<UserDetailResponse>(`/api/admin/users/${id}`);
  return response.data;
};

// 사용자 생성
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  const response = await api.post<CreateUserResponse>(
    "/api/admin/users",
    userData
  );
  return response.data;
};

// 사용자 수정
export const updateUser = async (
  id: string,
  userData: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  const response = await api.put<UpdateUserResponse>(
    `/api/admin/users/${id}`,
    userData
  );
  return response.data;
};

// 사용자 삭제
export const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  const response = await api.delete<DeleteUserResponse>(`/api/admin/users/${id}`);
  return response.data;
};

// 사용자 상태 변경
export const updateUserStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
): Promise<UpdateUserResponse> => {
  const response = await api.patch<UpdateUserResponse>(
    `/api/admin/users/${id}/status`,
    { status }
  );
  return response.data;
};

// 사용자 통계 조회
export const getUserStats = async (): Promise<UserStatsResponse> => {
  const response = await api.get<UserStatsResponse>("/api/admin/users/stats");
  return response.data;
};

// 사용자 일괄 삭제
export const deleteUsers = async (ids: string[]): Promise<DeleteUserResponse> => {
  const response = await api.delete<DeleteUserResponse>("/api/admin/users/bulk", {
    data: { userIds: ids },
  });
  return response.data;
};

// 사용자 비밀번호 초기화
export const resetUserPassword = async (
  id: string
): Promise<{ success: boolean; temporaryPassword: string }> => {
  const response = await api.post<{
    success: boolean;
    temporaryPassword: string;
  }>(`/api/admin/users/${id}/reset-password`);
  return response.data;
};

// 사용자 역할 변경
export const updateUserRole = async (
  id: string,
  role: "ADMIN" | "BUSINESS_OWNER" | "PART_TIME_WORKER"
): Promise<UpdateUserResponse> => {
  const response = await api.patch<UpdateUserResponse>(
    `/api/admin/users/${id}/role`,
    { role }
  );
  return response.data;
};

// 사용자 프로필 이미지 업로드
export const uploadUserProfileImage = async (
  id: string,
  file: File
): Promise<{ success: boolean; imageUrl: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<{
    success: boolean;
    imageUrl: string;
  }>(`/api/admin/users/${id}/profile-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 사용자 목록 내보내기 (Excel)
export const exportUsers = async (
  params: UsersListRequest = {}
): Promise<Blob> => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.role) searchParams.append("role", params.role);
  if (params.status) searchParams.append("status", params.status);

  const queryString = searchParams.toString();
  const url = `/api/admin/users/export${queryString ? `?${queryString}` : ""}`;

  const response = await api.get(url, {
    responseType: "blob",
  });
  return response.data;
};