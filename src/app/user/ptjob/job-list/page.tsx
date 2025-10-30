import { Suspense } from "react";
import JobListClient from "./components/JobListClient";
import JobListSkeleton from "./components/JobListSkeleton";

/**
 * 알바생 일자리 목록 페이지 (Server Component)
 *
 * 최적화 전략:
 * 1. SSR로 스켈레톤 UI를 먼저 렌더링 (빠른 FCP)
 * 2. 클라이언트에서 실제 데이터 로딩 후 갈아끼우기 (Progressive Hydration)
 * 3. Suspense 경계로 스트리밍 최적화
 */
export default function PtJobPage() {
  return (
    <Suspense fallback={<JobListSkeleton />}>
      <JobListClient />
    </Suspense>
  );
}
