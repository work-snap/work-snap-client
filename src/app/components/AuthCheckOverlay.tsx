"use client";

import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 백그라운드 인증 체크 오버레이
 * - SSR된 정적 UI 위에서 실행
 * - 로그인된 사용자는 자동 라우팅
 * - 로딩 중에는 오버레이 표시
 */
export default function AuthCheckOverlay() {
  const router = useRouter();
  const { user, isLoading } = useUserStore();

  useEffect(() => {
    // 로그인된 사용자는 자동 라우팅에 맡김 (useAutoRouting 훅이 처리)
    // 여기서는 오버레이만 제어
  }, [user]);

  // 로딩 중이 아니고 유저가 없으면 오버레이 표시 안함
  if (!isLoading && !user) {
    return null;
  }

  // 로딩 중이거나 유저가 있으면 오버레이 표시
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center max-w-[430px] mx-auto">
      <div className="text-center">
        <div className="text-main text-2xl font-bold mb-2">Work Snap</div>
        <div className="text-main2">
          {isLoading ? "로그인 상태 확인 중..." : "적절한 페이지로 이동 중..."}
        </div>
      </div>
    </div>
  );
}
