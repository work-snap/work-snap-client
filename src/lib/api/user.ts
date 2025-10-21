// src/lib/api/user.ts

import api from "../api";

// 사용자 기본 정보 (서버 UserRes와 일치)
export interface UserData {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  email: string;
  phoneNumber: string | null;
  userType: "PENDING" | "BUSINESS_OWNER" | "PART_TIME_WORKER";
  userRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

// 실제 API 응답 구조
export interface UserProfileResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      nickname: string;
      profileImageUrl: string | null;
      email: string;
      phoneNumber: string | null;
      userType: "PENDING" | "BUSINESS_OWNER" | "PART_TIME_WORKER";
      userRole: "USER" | "ADMIN" | "SUPER_ADMIN";
      createdAt: string;
      updatedAt: string;
    };
    businessVerificationStatus?:
      | "NOT_REQUESTED"
      | "PENDING"
      | "APPROVED"
      | "REJECTED"
      | "REVIEWING"
      | "VERIFIED"
      | null;
  };
  message?: string;
}

// 클라이언트용 User 인터페이스 (null 값 허용)
export interface User {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  email: string;
  phoneNumber: string | null;
  userType: "PENDING" | "BUSINESS_OWNER" | "PART_TIME_WORKER";
  userRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
  businessVerificationStatus:
    | "NOT_REQUESTED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "REVIEWING"
    | "VERIFIED"
    | null;
}

// 사용자 정보 가져오기 (실제 API 응답에 맞춰 수정)
export const getUser = async (): Promise<User> => {
  const res = await api.get("/api/v1/users/profile");
  console.log("👀 응답 데이터:", res.data);

  const profileResponse: UserProfileResponse = res.data;

  // API 응답에서 user 객체와 businessVerificationStatus 추출
  const userData = profileResponse.data.user;
  const businessStatus = profileResponse.data.businessVerificationStatus;

  console.log("🔍 사용자 데이터 파싱:", {
    userData,
    businessStatus,
    finalUserType: userData.userType,
  });

  // 최종 User 객체 구성
  const finalUser: User = {
    ...userData,
    businessVerificationStatus: businessStatus || null,
  };

  console.log("✅ 최종 User 객체:", finalUser);
  return finalUser;
};
