import { Suspense } from "react";
import Benner from "@/src/app/components/benner";
import { WorkplaceList, AddBusinessButton } from "./components";
import WorkplaceListSkeleton from "./WorkplaceListSkeleton";

/**
 * 사업장 관리 페이지 (SSR 최적화)
 *
 * 최적화 전략:
 * 1. Server Component로 구현하여 정적 UI 부분 SSR 렌더링
 * 2. 데이터 의존적 컴포넌트만 Client Component로 분리
 * 3. Suspense를 활용한 스트리밍 SSR 구현
 *
 * 구조:
 * - page.tsx (Server) - 레이아웃 및 구조 제공
 * - WorkplaceList (Client) - 데이터 페칭 및 동적 렌더링
 * - AddBusinessButton (Client) - 라우터 네비게이션
 */
export default function AddBusiness() {
  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      {/* 배너 영역 - SSR로 즉시 렌더링 */}
      <div className="flex-shrink-0 pb-4 background-white">
        <Benner />
      </div>

      {/* 사업장 리스트 - Suspense로 스트리밍 SSR */}
      <Suspense fallback={<WorkplaceListSkeleton />}>
        <WorkplaceList />
      </Suspense>

      {/* 하단 버튼 - SSR로 즉시 렌더링 */}
      <AddBusinessButton />
    </div>
  );
}
