import { Suspense } from "react";
import MainPageClient from "./components/MainPageClient";

// 🎨 메인 페이지 로딩 스켈레톤
function MainPageSkeleton() {
  return (
    <div className="h-dvh flex flex-col bg-white p-4 rounded-2xl">
      {/* 사업장 드롭다운 스켈레톤 */}
      <div className="w-full">
        <div className="h-5 w-24 bg-gray-300 rounded mb-2 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* 날짜 네비게이션 스켈레톤 */}
      <div className="w-full flex justify-between items-center gap-2 mt-4">
        <div className="h-10 w-16 bg-gray-300 rounded-lg animate-pulse" />
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-gray-300 rounded animate-pulse" />
          <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
          <div className="h-6 w-6 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="px-8"></div>
      </div>

      {/* 타임라인 스켈레톤 */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 border-b pb-2">
            <div className="bg-gray-200 h-10 rounded animate-pulse" />
            <div className="space-y-2 p-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎯 서버 컴포넌트 - 레이아웃만 SSR
export default function MainPage() {
  return (
    <Suspense fallback={<MainPageSkeleton />}>
      <MainPageClient />
    </Suspense>
  );
}
