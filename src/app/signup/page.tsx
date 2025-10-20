import { Suspense } from "react";
import SignupContent from "./components/SignupContent";

/**
 * 회원가입 페이지 (서버 컴포넌트)
 * - 정적 UI는 SSR로 렌더링하여 초기 로딩 성능 최적화
 * - 클라이언트 로직은 SignupContent로 분리
 */
export default function SignupPage() {
  return (
    <div className="h-full flex flex-col bg-white max-w-[430px] w-full mx-auto">
      <Suspense fallback={<SignupPageSkeleton />}>
        <SignupContent />
      </Suspense>
    </div>
  );
}

/**
 * 로딩 스켈레톤 (SSR로 렌더링)
 */
function SignupPageSkeleton() {
  return (
    <>
      {/* 상단 헤더 스켈레톤 */}
      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center">
          <div className="p-2 w-8 h-8 bg-gray2 rounded animate-pulse" />
        </div>
        <div className="h-5 w-16 bg-gray2 rounded animate-pulse" />
      </div>

      {/* 본문 스켈레톤 */}
      <div className="flex flex-col items-start px-4 pt-2 w-full">
        {/* 타이틀 스켈레톤 */}
        <div className="mb-1 w-full">
          <div className="h-10 w-full bg-gray2 rounded animate-pulse mb-2" />
        </div>
        <div className="h-5 w-48 bg-gray2 rounded animate-pulse mb-10 mt-2" />

        {/* 버튼 스켈레톤 */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full bg-gray2 rounded-xl py-7 h-[140px] animate-pulse" />
          <div className="w-full bg-gray2 rounded-xl py-7 h-[140px] animate-pulse" />
        </div>
      </div>
    </>
  );
}
