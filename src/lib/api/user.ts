// src/lib/api/user.ts

import api from "../api";

export interface User {
  success: boolean;
  data: {
    id: number;
    nickname: string;
    profileImageUrl: string;
    email: string;
    userType: string;
    userRole: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

// 사용자 정보 가져오기
export const getUser = async (): Promise<User> => {
  const res = await api.get("/api/v1/users/profile");
  console.log("👀 응답 데이터:", res.data);
  return res.data;
};
