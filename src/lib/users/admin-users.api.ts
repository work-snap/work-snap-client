import api from "../api";
import type {
  AdminUserListRequest,
  AdminUserListResponse,
  AdminUserDetail,
  AdminUserUpdateRequest,
  ApiResponse,
} from "./admin-users.types";

const BASE_URL = "/api/v1/users/admin";

export const adminUsersApi = {
  /**
   * 관리자용 유저 목록 조회 (커서 기반 무한 스크롤)
   */
  getUsers: async (params: AdminUserListRequest): Promise<ApiResponse<AdminUserListResponse>> => {
    const response = await api.get<ApiResponse<AdminUserListResponse>>(`${BASE_URL}/list`, {
      params,
    });
    return response.data;
  },

  /**
   * 관리자용 유저 상세 조회
   */
  getUserDetail: async (userId: number): Promise<ApiResponse<AdminUserDetail>> => {
    const response = await api.get<ApiResponse<AdminUserDetail>>(`${BASE_URL}/${userId}`);
    return response.data;
  },

  /**
   * 관리자용 유저 정보 변경
   */
  updateUser: async (
    userId: number,
    updateData: AdminUserUpdateRequest
  ): Promise<ApiResponse<AdminUserDetail>> => {
    const response = await api.put<ApiResponse<AdminUserDetail>>(
      `${BASE_URL}/${userId}`,
      updateData
    );
    return response.data;
  },
};