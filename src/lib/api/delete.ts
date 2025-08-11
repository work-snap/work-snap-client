// src/lib/api/delete.ts
import api from "../api";

export interface DeleteUserResponse {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userRole: string;
  userType: string;
}

export const deleteUser = async (): Promise<DeleteUserResponse> => {
  const res = await api.delete("/api/v1/users/account");
  console.log("👀 응답 데이터:", res.data.data);

  // --- 스토리지 삭제 ---
  localStorage.clear();
  sessionStorage.clear();

  // --- 쿠키 삭제 ---
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  return res.data;
};
