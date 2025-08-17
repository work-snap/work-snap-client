/**
 * 사용자 컨텍스트
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  workplaceId: number;
  workplaceName: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

// 임시 사용자 데이터 (실제로는 API에서 가져옴)
const MOCK_USER: User = {
  id: 1,
  name: "김직원",
  email: "employee@worksnap.com",
  workplaceId: 1,
  workplaceName: "스타벅스 강남점",
  role: "EMPLOYEE",
};

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // accessToken 키로 통일하여 토큰 확인
        let token = localStorage.getItem("accessToken");
        
        if (token) {
          // 실제 토큰이 있으면 API 클라이언트에 설정
          api.setAuthToken(token);
          
          // 실제로는 토큰으로 사용자 정보 API 호출해야 함
          // try {
          //   const userData = await api.get("/auth/me");
          //   setUser(userData.data);
          //   setIsLoading(false);
          //   return;
          // } catch (error) {
          //   // 토큰이 유효하지 않으면 제거
          //   localStorage.removeItem("accessToken");
          //   api.removeAuthToken();
          // }
          
          // 개발 환경에서는 토큰이 있으면 목 데이터 사용
          setTimeout(() => {
            setUser(MOCK_USER);
            setIsLoading(false);
          }, 500);
        } else {
          // 토큰이 없으면 로그인되지 않은 상태
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        setError("사용자 정보를 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 실제로는 로그인 API 호출
      // const response = await api.post("/auth/login", { email, password });
      // const { token, user } = response.data;
      // localStorage.setItem("accessToken", token);
      // setUser(user);

      // 임시 로그인 처리
      const mockToken = "mock_token";
      localStorage.setItem("accessToken", mockToken);
      api.setAuthToken(mockToken);
      setUser(MOCK_USER);
    } catch (error) {
      console.error("로그인 실패:", error);
      setError("로그인에 실패했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    api.removeAuthToken();
    setUser(null);
    setError(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}