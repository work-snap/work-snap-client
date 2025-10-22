import { Suspense } from "react";
import RegisterFormClient from "./components/RegisterFormClient";

// 🎨 로딩 스켈레톤
function RegisterFormSkeleton() {
  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      {/* 헤더 스켈레톤 */}
      <div className="flex flex-col px-2 py-2">
        <div className="h-6 w-6 bg-gray-300 rounded animate-pulse" />
        <div className="h-8 w-32 bg-gray-300 rounded mt-4 ml-2 animate-pulse" />
      </div>

      {/* 사업장 정보 스켈레톤 */}
      <div className="px-4 mb-2">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* 폼 필드 스켈레톤 */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎯 서버 컴포넌트 - 레이아웃만 SSR
export default function RegisterParttimer({
  searchParams,
}: {
  searchParams: { idx?: string };
}) {
  const workplaceId = Number(searchParams.idx);

  return (
    <Suspense fallback={<RegisterFormSkeleton />}>
      <RegisterFormClient workplaceId={workplaceId} />
    </Suspense>
  );
}
