"use client";

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useAutoRouting } from '@/hooks/useAutoRouting';
import { useFcmToken } from '@/hooks/useFcmToken';

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { loadUser, isLoading } = useUserStore();

  // 자동 라우팅 훅 사용
  useAutoRouting();

  // FCM 토큰 자동 등록
  useFcmToken();

  // 초기 사용자 정보 로드
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}