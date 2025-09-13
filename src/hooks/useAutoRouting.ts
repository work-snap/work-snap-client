import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export function useAutoRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const prevUserRef = useRef<any>(null);
  
  const { 
    user, 
    isLoading, 
    handleRouting
  } = useUserStore();

  // 사용자 정보 변경 시 자동 리다이렉트 처리 (디바운싱 강화)
  useEffect(() => {
    // 사용자 정보가 실제로 변경되었는지 확인
    const userChanged = JSON.stringify(prevUserRef.current) !== JSON.stringify(user);
    
    if (userChanged) {
      console.log("[AUTO-ROUTING] 🔄 사용자 정보 변경 감지, 라우팅 체크 실행:", {
        user: user ? { id: user.id, userType: user.userType, businessStatus: user.businessVerificationStatus } : null,
        isLoading,
        pathname
      });
      
      prevUserRef.current = user;
      
      // 500ms 후에 라우팅 체크 (더 안정적인 디바운싱)
      const timer = setTimeout(() => {
        handleRouting(pathname, router);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, pathname, handleRouting, router]);

  return { 
    handleRouting: () => handleRouting(pathname, router) 
  };
}