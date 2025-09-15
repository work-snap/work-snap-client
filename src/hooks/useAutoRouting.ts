import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export function useAutoRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const prevUserRef = useRef<any>(null);

  const {
    user,
    isLoading,
    handleRouting: storeHandleRouting
  } = useUserStore();

  // handleRouting을 안정적인 참조로 만들기
  const handleRouting = useCallback(() => {
    console.log("[AUTO-ROUTING] 🚀 handleRouting 호출 시작", { pathname, hasRouter: !!router });
    storeHandleRouting(pathname, router);
    console.log("[AUTO-ROUTING] 🚀 handleRouting 호출 완료");
  }, [pathname, router, storeHandleRouting]);

  // 사용자 정보 변경 시 자동 리다이렉트 처리 (디바운싱 강화)
  useEffect(() => {
    console.log("[AUTO-ROUTING] 📊 useEffect 실행됨:", {
      hasUser: !!user,
      isLoading,
      pathname,
      prevUser: prevUserRef.current ? {
        id: prevUserRef.current.id,
        userType: prevUserRef.current.userType,
        businessStatus: prevUserRef.current.businessVerificationStatus
      } : null,
      currentUser: user ? {
        id: user.id,
        userType: user.userType,
        businessStatus: user.businessVerificationStatus
      } : null,
    });

    // 라우팅 체크가 필요한 조건:
    // 1. 로딩이 완료되었을 때 (사용자 유무와 관계없이)
    const shouldCheckRouting = !isLoading;

    console.log("[AUTO-ROUTING] 🔍 라우팅 체크 조건:", {
      shouldCheckRouting,
      isLoading,
      hasUser: !!user,
      userType: user?.userType,
      businessStatus: user?.businessVerificationStatus
    });

    if (shouldCheckRouting) {
      // 사용자 정보가 실제로 변경되었는지 확인
      const prevUserString = JSON.stringify(prevUserRef.current);
      const currentUserString = JSON.stringify(user);
      const userChanged = prevUserString !== currentUserString;

      console.log("[AUTO-ROUTING] 🔍 변경 감지 결과:", {
        userChanged,
        prevUserString: prevUserString?.substring(0, 50) + "...",
        currentUserString: currentUserString?.substring(0, 50) + "..."
      });

      // 라우팅 체크 실행 조건:
      // 1. 사용자 정보가 변경된 경우
      // 2. 초기 로드인 경우 (이전 사용자 정보와 현재 사용자 정보 상태가 다름)
      // 3. 비로그인 상태로 변경된 경우
      const shouldRoute = userChanged ||
                         (!prevUserRef.current && user) ||  // 로그인됨
                         (prevUserRef.current && !user);    // 로그아웃됨

      console.log("[AUTO-ROUTING] 🔄 라우팅 체크 실행:", {
        shouldRoute,
        reason: userChanged ? "사용자 정보 변경" :
                !prevUserRef.current && user ? "로그인됨" :
                prevUserRef.current && !user ? "로그아웃됨" : "경로 체크",
        user: user ? { id: user.id, userType: user.userType, businessStatus: user.businessVerificationStatus } : null,
        pathname
      });

      prevUserRef.current = user;

      // 항상 현재 경로가 올바른지 체크
      console.log("[AUTO-ROUTING] ⏰ 즉시 라우팅 체크 실행");
      handleRouting();

      if (shouldRoute) {
        // 추가적인 디바운싱을 위해 500ms 후 한번 더 체크
        console.log("[AUTO-ROUTING] ⏰ 500ms 후 재체크 타이머 설정");
        const timer = setTimeout(() => {
          console.log("[AUTO-ROUTING] 🔄 500ms 후 재체크 실행");
          handleRouting();
        }, 500);

        return () => {
          console.log("[AUTO-ROUTING] 🗑️ 재체크 타이머 정리");
          clearTimeout(timer);
        };
      }
    } else {
      console.log("[AUTO-ROUTING] ⏳ 라우팅 체크 조건 미충족", {
        isLoading,
        reason: "로딩 중"
      });
    }
  }, [user, isLoading, pathname]);

  return {
    handleRouting
  };
}