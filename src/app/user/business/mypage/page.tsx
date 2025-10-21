// src/app/user/business/mypage/page.tsx
import { Suspense } from "react";
import MyPageSkeleton from "./MyPageSkeleton";
import MyPageClient from "./MyPageClient";

/**
 * SSR 최적화된 마이페이지
 * - 기본 UI 구조는 즉시 렌더링 (SSR)
 * - 사용자 데이터는 클라이언트에서 점진적 로딩
 */
export default function MyPage() {
  return (
    <Suspense fallback={<MyPageSkeleton />}>
      <MyPageClient />
    </Suspense>
  );
}
