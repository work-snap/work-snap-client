import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export function useAutoRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const prevUserRef = useRef<any>(null);
  const lastRoutingTimeRef = useRef<number>(0);

  const { user, isLoading, handleRouting: storeHandleRouting } = useUserStore();

  // handleRouting을 안정적인 참조로 만들기
  const handleRouting = useCallback(() => {
    const now = Date.now();

    // 1초 내 중복 실행 방지
    if (now - lastRoutingTimeRef.current < 1000) {
      console.log("[AUTO-ROUTING] ⏱️ 디바운싱: 1초 내 중복 실행 방지");
      return;
    }

    lastRoutingTimeRef.current = now;

    console.log("[AUTO-ROUTING] 🚀 handleRouting 호출 시작", {
      pathname,
      hasRouter: !!router,
      timestamp: new Date().toISOString(),
    });

    // 현재 사용자 상태도 함께 로깅
    const { user, isLoading } = useUserStore.getState();
    console.log("[AUTO-ROUTING] 📊 현재 사용자 상태:", {
      hasUser: !!user,
      userType: user?.userType,
      businessVerificationStatus: user?.businessVerificationStatus,
      isLoading,
    });

    storeHandleRouting(pathname, router);
    console.log("[AUTO-ROUTING] 🚀 handleRouting 호출 완료");
  }, [pathname, router, storeHandleRouting]);

  // 사용자 정보 변경 시 자동 리다이렉트 처리 (디바운싱 강화)
  useEffect((): (() => void) | void => {
    console.log("[AUTO-ROUTING] 📊 useEffect 실행됨:", {
      hasUser: !!user,
      isLoading,
      pathname,
      prevUser: prevUserRef.current
        ? {
            id: prevUserRef.current.id,
            userType: prevUserRef.current.userType,
            businessStatus: prevUserRef.current.businessVerificationStatus,
          }
        : null,
      currentUser: user
        ? {
            id: user.id,
            userType: user.userType,
            businessStatus: user.businessVerificationStatus,
          }
        : null,
      timestamp: new Date().toISOString(),
    });

    // 라우팅 체크가 필요한 조건:
    // 1. 로딩이 완료되었을 때 (사용자 유무와 관계없이)
    const shouldCheckRouting = !isLoading;

    console.log("[AUTO-ROUTING] 🔍 라우팅 체크 조건:", {
      shouldCheckRouting,
      isLoading,
      hasUser: !!user,
      userType: user?.userType,
      businessStatus: user?.businessVerificationStatus,
    });

    if (shouldCheckRouting) {
      // 사용자 정보가 실제로 변경되었는지 확인
      const prevUserString = JSON.stringify(prevUserRef.current);
      const currentUserString = JSON.stringify(user);
      const userChanged = prevUserString !== currentUserString;

      console.log("[AUTO-ROUTING] 🔍 변경 감지 결과:", {
        userChanged,
        prevUserString: prevUserString?.substring(0, 50) + "...",
        currentUserString: currentUserString?.substring(0, 50) + "...",
        prevUserType: prevUserRef.current?.userType,
        currentUserType: user?.userType,
      });

      // 라우팅 체크 실행 조건:
      // 1. 사용자 정보가 변경된 경우
      // 2. 초기 로드인 경우 (이전 사용자 정보와 현재 사용자 정보 상태가 다름)
      // 3. 비로그인 상태로 변경된 경우
      // 4. PENDING 사용자인 경우 (특별 처리)
      // 5. 사용자 타입이 변경된 경우 (PENDING → BUSINESS_OWNER/PART_TIME_WORKER)
      const userTypeChanged = prevUserRef.current?.userType !== user?.userType;

      // 사용자 타입이 PENDING에서 다른 타입으로 변경된 경우도 감지
      const fromPendingToOther =
        prevUserRef.current?.userType === "PENDING" &&
        user?.userType &&
        user.userType !== "PENDING";

      // 사업자 인증 상태가 변경된 경우
      const businessStatusChanged =
        prevUserRef.current?.businessVerificationStatus !==
        user?.businessVerificationStatus;

      // 현재 경로가 허용된 경로인지 확인 (사업자가 /user/business/ 경로에 있는 경우)
      const isAllowedPath =
        user?.userType === "BUSINESS_OWNER" &&
        pathname.startsWith("/user/business/");

      const shouldRoute =
        userChanged ||
        (!prevUserRef.current && user) || // 로그인됨
        (prevUserRef.current && !user) || // 로그아웃됨
        (user && user.userType === "PENDING") || // PENDING 사용자
        userTypeChanged || // 사용자 타입 변경
        fromPendingToOther || // PENDING에서 다른 타입으로 변경
        businessStatusChanged; // 사업자 인증 상태 변경

      console.log("[AUTO-ROUTING] 🔄 라우팅 체크 실행:", {
        shouldRoute,
        userTypeChanged,
        fromPendingToOther,
        businessStatusChanged,
        isAllowedPath,
        reason: userChanged
          ? "사용자 정보 변경"
          : !prevUserRef.current && user
          ? "로그인됨"
          : prevUserRef.current && !user
          ? "로그아웃됨"
          : user && user.userType === "PENDING"
          ? "PENDING 사용자"
          : userTypeChanged
          ? "사용자 타입 변경"
          : fromPendingToOther
          ? "PENDING에서 다른 타입으로 변경"
          : businessStatusChanged
          ? "사업자 인증 상태 변경"
          : "경로 체크",
        user: user
          ? {
              id: user.id,
              userType: user.userType,
              businessStatus: user.businessVerificationStatus,
            }
          : null,
        prevUser: prevUserRef.current
          ? {
              id: prevUserRef.current.id,
              userType: prevUserRef.current.userType,
              businessStatus: prevUserRef.current.businessVerificationStatus,
            }
          : null,
        pathname,
      });

      if (shouldRoute) {
        // 허용된 경로에 있는 경우 라우팅하지 않음
        if (isAllowedPath) {
          console.log("[AUTO-ROUTING] ✅ 허용된 경로에 있음 → 라우팅 스킵:", {
            pathname,
            userType: user?.userType,
            businessStatus: user?.businessVerificationStatus,
          });
          return;
        }

        // PENDING 사용자의 경우 즉시 처리
        if (user && user.userType === "PENDING") {
          console.log("[AUTO-ROUTING] ⚡ PENDING 사용자 즉시 처리");
          handleRouting();
          return;
        }

        // 사용자 타입 변경된 경우 즉시 처리
        if (userTypeChanged || fromPendingToOther) {
          console.log("[AUTO-ROUTING] ⚡ 사용자 타입 변경 즉시 처리:", {
            from: prevUserRef.current?.userType,
            to: user?.userType,
            fromPendingToOther,
          });
          handleRouting();
          return;
        }

        // 라우팅이 필요한 경우에만 체크
        console.log("[AUTO-ROUTING] ⏰ 즉시 라우팅 체크 실행");
        handleRouting();

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
      } else {
        console.log("[AUTO-ROUTING] ⏭️ shouldRoute=false, 라우팅 체크 스킵");
      }

      // 라우팅 체크 후에 이전 사용자 정보 업데이트
      prevUserRef.current = user;
    } else {
      console.log("[AUTO-ROUTING] ⏳ 라우팅 체크 조건 미충족", {
        isLoading,
        reason: "로딩 중",
      });
    }
  }, [user, isLoading, pathname]);

  return {
    handleRouting,
  };
}
