import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export function useAutoRouting() {
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
    user, 
    isLoading, 
    handleRouting
  } = useUserStore();

  // 사용자 정보 변경 시 자동 리다이렉트 처리 (타이머 사용)
  useEffect(() => {
    console.log("[AUTO-ROUTING] 🔄 사용자 정보 변경 감지, 라우팅 체크 실행:", {
      user: user ? { id: user.id, userType: user.userType, businessStatus: user.businessVerificationStatus } : null,
      isLoading,
      pathname
    });
    
    // 100ms 후에 라우팅 체크 (React의 렌더링 사이클을 피하기 위해)
    const timer = setTimeout(() => {
      handleRouting(pathname, router);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, pathname, handleRouting, router]);

  return { 
    handleRouting: () => handleRouting(pathname, router) 
  };
}