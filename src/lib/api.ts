import axios from "axios";

// API 기본 URL 설정 - 환경 변수에서 가져오거나 Next.js rewrites 사용
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 전송을 위해 추가
});
// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 서버에서 토큰이 갱신된 경우 새로운 토큰으로 업데이트
    const newAccessToken = response.headers["x-new-access-token"];
    const tokenRefreshed = response.headers["x-token-refreshed"];

    if (tokenRefreshed === "true" && newAccessToken) {
      console.log("🔄 토큰이 자동으로 갱신되었습니다");
      localStorage.setItem("accessToken", newAccessToken);
    }

    return response;
  },
  (error) => {
    // 토큰 갱신이 실패한 경우에도 새로운 토큰이 있는지 확인
    if (error.response) {
      const newAccessToken = error.response.headers["x-new-access-token"];
      const tokenRefreshed = error.response.headers["x-token-refreshed"];

      if (tokenRefreshed === "true" && newAccessToken) {
        console.log("🔄 토큰이 자동으로 갱신되었습니다");
        localStorage.setItem("accessToken", newAccessToken);
      }
    }

    // 401 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    
    // 403 에러 시 권한 문제 로깅
    if (error.response?.status === 403) {
      console.error("🚫 403 Forbidden - 권한이 없습니다:", {
        url: error.config?.url,
        method: error.config?.method,
        token: localStorage.getItem("accessToken") ? "존재함" : "없음"
      });
    }
    return Promise.reject(error);
  }
);

export default api;
