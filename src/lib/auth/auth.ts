import { AxiosResponse } from "axios";
import api from "../api";
import {
  ApiResponse,
  CreateInvitationCodeRequest,
  KakaoLoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  SignupRequest,
  SignupResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
  CreateInviteCodeResponse,
  ResisterBusinessResponse,
  ResisterBusinessRequest,
} from "./types";

const BASE_URL = "/api/auth";

export const authApis = {
  // 카카오 로그인
  kakaoLogin: (
    request: KakaoLoginRequest
  ): Promise<AxiosResponse<LoginResponse>> => {
    return api.post<LoginResponse>(`${BASE_URL}/kakao/login`, request, {
      withCredentials: true, // RefreshToken 쿠키 포함
    });
  },

  // 토큰 갱신
  refreshToken: (): Promise<AxiosResponse<RefreshTokenResponse>> => {
    return api.post<RefreshTokenResponse>(
      `${BASE_URL}/refresh`,
      {},
      {
        withCredentials: true, // RefreshToken 쿠키 포함
      }
    );
  },

  // 로그아웃
  logout: (): Promise<AxiosResponse<void>> => {
    return api.post<void>(
      `${BASE_URL}/logout`,
      {},
      {
        withCredentials: true, // RefreshToken 쿠키 포함
      }
    );
  },

  // 회원가입 (사용자 타입 설정)
  signup: (request: SignupRequest): Promise<AxiosResponse<SignupResponse>> => {
    return api.post<SignupResponse>(`${BASE_URL}/signup`, request);
  },

  // 현재 사용자 정보 조회
  getCurrentUser: (): Promise<AxiosResponse<User>> => {
    return api.get<User>(`${BASE_URL}/me`);
  },

  // 프로필 업데이트
  updateProfile: (
    request: UpdateProfileRequest
  ): Promise<AxiosResponse<UpdateProfileResponse>> => {
    return api.put<UpdateProfileResponse>(`${BASE_URL}/profile`, request);
  },

  // 회원 탈퇴
  deleteAccount: (): Promise<AxiosResponse<void>> => {
    return api.delete<void>(`${BASE_URL}/account`);
  },

  // 토큰 유효성 검증
  validateToken: (): Promise<AxiosResponse<{ valid: boolean }>> => {
    return api.get<{ valid: boolean }>(`${BASE_URL}/validate`);
  },
  //초대 인증코드 생성
  createInviteCode: (): Promise<AxiosResponse<CreateInvitationCodeRequest>> => {
    return api.post<CreateInvitationCodeRequest>(
      `/api/v1/part-time/invite-code`
    );
  },
  resisterBusiness: (
    request: ResisterBusinessRequest
  ): Promise<AxiosResponse<ResisterBusinessResponse>> => {
    return api.post<ResisterBusinessResponse>(
      `/api/business-owner/register`,
      request
    );
  },
};
