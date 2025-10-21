import { Suspense } from "react";
import BackButton from "@/src/app/components/BackButton";
import AddBusinessForm from "./components/AddBusinessForm";

/**
 * 사업장 등록 페이지 (Server Component)
 * - 정적 UI는 SSR로 즉시 렌더링
 * - 인터랙티브 폼은 클라이언트 컴포넌트로 분리
 */
export default function AddBusinessPage() {
  return (
    <div className="h-dvh bg-white w-full flex flex-col max-w-[430px]">
      {/* 정적 헤더 영역 - SSR */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex flex-col py-3 gap-5">
          <BackButton />
          <span className="text-2xl font-bold">사업장 등록</span>
        </div>

        {/* 클라이언트 컴포넌트 - Hydration */}
        <Suspense
          fallback={
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-gray-100 rounded-lg" />
              <div className="h-20 bg-gray-100 rounded-lg" />
              <div className="h-32 bg-gray-100 rounded-lg" />
            </div>
          }
        >
          <AddBusinessForm />
        </Suspense>
      </div>
    </div>
  );
}
