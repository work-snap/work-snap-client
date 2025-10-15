import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApis } from "./auth";
import {
  KakaoLoginRequest,
  SignupRequest,
  UpdateProfileRequest,
  LoginResponse,
  SignupResponse,
  UpdateProfileResponse,
  User,
  RefreshTokenResponse,
  CreateInvitationCodeRequest,
  ResisterBusinessResponse,
  ResisterBusinessRequest,
} from "./types";

// 현재 사용자 정보 조회
export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authApis.getCurrentUser().then((res) => res.data),
    retry: false, // 인증 실패 시 재시도하지 않음
    ...options,
  });
}

// 토큰 유효성 검증
export function useValidateToken(options = {}) {
  return useQuery({
    queryKey: ["validateToken"],
    queryFn: () => authApis.validateToken().then((res) => res.data),
    retry: false,
    ...options,
  });
}

// 카카오 로그인
export function useKakaoLogin(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: KakaoLoginRequest) =>
      authApis.kakaoLogin(request).then((res) => res.data),
    onSuccess: (data: LoginResponse) => {
      // 로그인 성공 시 사용자 정보 캐시 업데이트
      queryClient.setQueryData(["currentUser"], data.user);

      // AccessToken을 localStorage에 저장
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 디버깅: 실제 사용자 정보 로깅
      console.log("✅ 카카오 로그인 성공:", {
        userId: data.user.id,
        nickname: data.user.nickname,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        userType: data.user.userType,
        isNewUser: data.isNewUser,
      });
    },
    ...options,
  });
}

// 토큰 갱신
export function useRefreshToken(options = {}) {
  return useMutation({
    mutationFn: () => authApis.refreshToken().then((res) => res.data),
    onSuccess: (data: RefreshTokenResponse) => {
      // 새로운 AccessToken을 localStorage에 저장
      localStorage.setItem("accessToken", data.accessToken);
    },
    ...options,
  });
}

// 로그아웃
export function useLogout(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApis.logout().then((res) => res.data),
    onSuccess: () => {
      // 로그아웃 성공 시 모든 캐시 및 저장된 데이터 정리
      queryClient.clear();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    ...options,
  });
}

// 회원가입
export function useSignup(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SignupRequest) =>
      authApis.signup(request).then((res) => res.data),
    onSuccess: (data: SignupResponse) => {
      // 회원가입 성공 시 사용자 정보 캐시 업데이트
      queryClient.setQueryData(["currentUser"], data.user);

      // localStorage의 사용자 정보도 업데이트
      localStorage.setItem("user", JSON.stringify(data.user));
    },
    ...options,
  });
}

// 프로필 업데이트
export function useUpdateProfile(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) =>
      authApis.updateProfile(request).then((res) => res.data),
    onSuccess: (data: UpdateProfileResponse) => {
      // 프로필 업데이트 성공 시 사용자 정보 캐시 업데이트
      queryClient.setQueryData(["currentUser"], data.user);

      // localStorage의 사용자 정보도 업데이트
      localStorage.setItem("user", JSON.stringify(data.user));
    },
    ...options,
  });
}

// 회원 탈퇴
export function useDeleteAccount(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApis.deleteAccount().then((res) => res.data),
    onSuccess: () => {
      // 회원 탈퇴 성공 시 모든 캐시 및 저장된 데이터 정리
      queryClient.clear();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    ...options,
  });
}
//초대 인증코드 생성
export function useCreateInviteCode(options = {}) {
  return useMutation<CreateInvitationCodeRequest, Error, void>({
    mutationFn: () => authApis.createInviteCode().then((res) => res.data),
    ...options,
  });
}
//사업자 등록신청
export function useResisterBusiness() {
  return useMutation<ResisterBusinessResponse, Error, ResisterBusinessRequest>({
    mutationFn: (data: ResisterBusinessRequest) =>
      authApis.resisterBusiness(data).then((res) => res.data),
  });
}
