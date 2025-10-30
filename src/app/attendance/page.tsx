import { Suspense } from "react";

import AttendanceClient from "./components/AttendanceClient";
import AttendanceSkeleton from "./components/AttendanceSkeleton";

/**
 * 출근 관리 페이지 (Server Component)
 *
 * 🎯 SSR 최적화 전략:
 * 1. 서버에서 스켈레톤 UI를 먼저 렌더링 (초기 페이지 로드 최적화)
 * 2. 클라이언트 컴포넌트는 Suspense 경계 내에서 렌더링
 * 3. 데이터 페칭은 클라이언트에서 React Query로 처리 (캐싱 및 리페칭)
 * 4. 사용자는 즉시 의미있는 UI(스켈레톤)를 보고, 데이터 로드 완료 후 자동 교체
 *
 * 📈 성능 향상:
 * - FCP (First Contentful Paint): 스켈레톤 UI가 즉시 표시
 * - LCP (Largest Contentful Paint): 서버에서 렌더링된 레이아웃 우선 표시
 * - TTI (Time to Interactive): 클라이언트 hydration 후 인터랙션 가능
 */
export default function AttendancePage() {
  return (
    <Suspense fallback={<AttendanceSkeleton />}>
      <AttendanceClient />
    </Suspense>
  );
}
