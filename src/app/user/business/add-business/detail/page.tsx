import { Suspense } from "react";
import BackButton from "./components/BackButton";
import WorkplaceInfoClient from "./components/WorkplaceInfoClient";
import EmployeeListClient from "./components/EmployeeListClient";
import RegisterButton from "./components/RegisterButton";

// 🎨 스켈레톤 컴포넌트들 (서버 컴포넌트)
function WorkplaceInfoSkeleton() {
  return (
    <div className="px-9 py-4 bg-gray-100 animate-pulse">
      <div className="h-7 bg-gray-300 rounded w-48 mb-2" />
      <div className="h-5 bg-gray-300 rounded w-32 mb-2" />
      <div className="h-5 bg-gray-300 rounded w-64" />
    </div>
  );
}

function EmployeeListSkeleton() {
  return (
    <div className="px-4 mt-6">
      <h2 className="font-bold text-lg mb-2">등록된 알바</h2>
      <ul className="space-y-3">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className="p-4 border rounded-xl shadow-sm bg-white animate-pulse"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <div className="h-6 bg-gray-300 rounded w-20" />
                <div className="h-6 bg-gray-300 rounded w-28" />
              </div>
              <div className="h-6 w-6 bg-gray-300 rounded" />
            </div>
            <div className="h-4 bg-gray-300 rounded w-48 mb-2" />
            <div className="space-y-1">
              <div className="h-5 bg-gray-300 rounded w-40" />
              <div className="h-5 bg-gray-300 rounded w-36" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 🎯 서버 컴포넌트 - 정적 구조 SSR로 렌더링
export default function BusinessDetail({
  searchParams,
}: {
  searchParams: { idx?: string };
}) {
  const workplaceId = Number(searchParams.idx);

  return (
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col max-w-[430px] w-full mx-auto">
      {/* 헤더 - 서버에서 즉시 렌더링 */}
      <BackButton />

      {/* 사업장 정보 - 독립적으로 로딩 */}
      <Suspense fallback={<WorkplaceInfoSkeleton />}>
        <WorkplaceInfoClient workplaceId={workplaceId} />
      </Suspense>

      {/* 직원 목록 - 독립적으로 로딩 */}
      <Suspense fallback={<EmployeeListSkeleton />}>
        <EmployeeListClient workplaceId={workplaceId} />
      </Suspense>

      {/* 알바 등록 버튼 - 서버에서 즉시 렌더링 */}
      <RegisterButton workplaceId={workplaceId} />
    </div>
  );
}
