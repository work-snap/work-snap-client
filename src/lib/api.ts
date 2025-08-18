import axios, { AxiosInstance } from "axios";

// API 기본 URL 설정 - 환경 변수에서 가져오거나 Next.js rewrites 사용
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// 개발 환경에서 기본 서버 URL 설정
const getBaseUrl = () => {
  if (BASE_URL) {
    return BASE_URL;
  }
  
  // 개발 환경에서 기본값 설정
  if (process.env.NODE_ENV === "development") {
    // ngrok URL이나 로컬 서버 URL을 여기에 설정
    return "http://localhost:8080"; // 또는 실제 서버 URL
  }
  
  return "";
};

// 커스텀 API 인스턴스 타입 정의
interface CustomAxiosInstance extends AxiosInstance {
  setAuthToken: (token: string) => void;
  removeAuthToken: () => void;
  getAuthToken: () => string | null;
}

// axios 인스턴스 생성
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 전송을 위해 추가
}) as CustomAxiosInstance;

// 토큰 관리 함수들
export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  delete api.defaults.headers.common["Authorization"];
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 디버깅을 위한 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log("🌐 API 요청:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!localStorage.getItem("accessToken"),
      });
    }

    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ API 요청 인터셉터 오류:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 디버깅을 위한 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API 응답:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    // 서버에서 토큰이 갱신된 경우 새로운 토큰으로 업데이트
    const newAccessToken = response.headers["x-new-access-token"];
    const tokenRefreshed = response.headers["x-token-refreshed"];

    if (tokenRefreshed === "true" && newAccessToken) {
      console.log("🔄 토큰이 자동으로 갱신되었습니다");
      setAuthToken(newAccessToken);
    }

    return response;
  },
  (error) => {
    // 디버깅을 위한 상세 로그
    console.error("❌ API 응답 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    // 토큰 갱신이 실패한 경우에도 새로운 토큰이 있는지 확인
    if (error.response) {
      const newAccessToken = error.response.headers["x-new-access-token"];
      const tokenRefreshed = error.response.headers["x-token-refreshed"];

      if (tokenRefreshed === "true" && newAccessToken) {
        console.log("🔄 토큰이 자동으로 갱신되었습니다");
        setAuthToken(newAccessToken);
      }
    }

    // 401 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      removeAuthToken();
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

    // 404 에러 시 서버 연결 문제 로깅
    if (error.response?.status === 404) {
      console.error("🔍 404 Not Found - API 엔드포인트를 찾을 수 없습니다:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        message: "서버가 실행 중인지 확인하거나 API URL을 확인해주세요."
      });
    }
    
    return Promise.reject(error);
  }
);

// API 인스턴스에 토큰 관리 함수들 추가
api.setAuthToken = setAuthToken;
api.removeAuthToken = removeAuthToken;
api.getAuthToken = getAuthToken;

export default api;
