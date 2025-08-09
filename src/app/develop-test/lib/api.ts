import api from "@/lib/api";

interface DevTokenResponse {
  accessToken: string;
  user: {
    id: string | number;
    nickname: string;
  };
}

interface KakaoLoginRequest {
  code: string;
  userType: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    nickname?: string;
  };
  isNewUser?: boolean;
}

export const testApis = {
  auth: {
    // 닉네임으로 개발 토큰 생성
    generateDevTokenByNickname: async (nickname: string) => {
      const response = await api.post(`/api/auth/dev-token/nickname/${nickname}`);
      return response;
    },

    // 사용자 ID로 개발 토큰 생성
    generateDevToken: async (userId: string) => {
      const response = await api.post(`/api/auth/dev-token/${userId}`);
      return response;
    },

    // 카카오 로그인
    kakaoLogin: async (request: KakaoLoginRequest) => {
      const response = await api.post("/api/auth/kakao/login", request);
      return response;
    },

    // 토큰 갱신
    refreshToken: async () => {
      const response = await api.post("/api/auth/refresh");
      return response;
    },

    // 로그아웃
    logout: async () => {
      const response = await api.post("/api/auth/logout");
      return response;
    },
  },
};

// 기타 테스트 API들도 필요하면 추가
export const workScheduleTestApis = {
  // 워크 스케줄 관련 API들...
};