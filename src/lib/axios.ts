import axios from "axios";
import { tokenManager } from "./auth/token";

// API 기본 URL 설정 - 환경 변수에서 가져오거나 기본값 사용
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 개발 환경에서는 기본값 사용
  if (process.env.NODE_ENV === "development") {
    return "https://89a8626716db.ngrok.app";
  }

  // 프로덕션에서는 빈 문자열 (상대 경로 사용)
  return "";
};

export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

// Token refresh queue
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add a callback to the queue
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Execute all callbacks with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const response = await axios.post(
            `${getBaseUrl()}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data;
          tokenManager.setAccessToken(accessToken);

          // Notify all subscribers about the new token
          onTokenRefreshed(accessToken);
          isRefreshing = false;

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear token and redirect to login
          tokenManager.clearAccessToken();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      // If already refreshing, wait for the new token
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);
