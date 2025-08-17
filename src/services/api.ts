/**
 * API 클라이언트 설정
 */

// API 기본 URL 설정 - 환경 변수에서 가져오거나 빈 문자열 사용
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    // 브라우저 환경에서 토큰 자동 설정
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        this.setAuthToken(token);
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // 매 요청마다 최신 토큰 확인 및 설정
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && !this.defaultHeaders["Authorization"]) {
        this.setAuthToken(token);
      } else if (!token && this.defaultHeaders["Authorization"]) {
        this.removeAuthToken();
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // 에러 응답에서 메시지 추출 시도
        try {
          const errorData = await response.json();
          const errorMessage =
            errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        } catch (parseError) {
          // JSON 파싱 실패 시 기본 에러 메시지
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }
}

// 싱글톤 API 클라이언트 인스턴스
export const api = new ApiClient(API_BASE_URL);
