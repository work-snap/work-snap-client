// src/app/user/business/mypage/MyPageSkeleton.tsx
/**
 * 마이페이지 스켈레톤 UI
 * - SSR로 즉시 렌더링되는 정적 레이아웃
 * - 데이터 로드 전 사용자에게 보여지는 UI
 */
export default function MyPageSkeleton() {
  return (
    <div className="h-dvh mx-auto w-full bg-white max-w-[430px] flex flex-col">
      <div className="p-4 flex flex-col gap-6 flex-grow pt-[40px]">
        {/* 제목 */}
        <h1 className="text-2xl font-bold">MY</h1>

        {/* 프로필 카드 스켈레톤 */}
        <div className="flex items-center gap-4 p-4 rounded-xl border animate-pulse">
          <div className="w-12 h-12 bg-gray2 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray2 rounded w-24" />
            <div className="h-4 bg-gray2 rounded w-32" />
            <div className="h-4 bg-gray2 rounded w-28" />
          </div>
        </div>

        {/* 메뉴 버튼 스켈레톤 */}
        <div className="space-y-2 pt-[20px]">
          <div className="w-full flex justify-between items-center p-3 border rounded-xl">
            <span>사업자등록증 관리</span>
            <span className="text-xl text-gray-400">›</span>
          </div>
          <div className="w-full flex justify-between items-center p-3 border rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed">
            <span>알림설정</span>
            <span className="text-xl text-gray-400">›</span>
          </div>
          <div className="w-full flex justify-between items-center p-3 border rounded-xl">
            <div className="h-5 bg-gray2 rounded w-32 animate-pulse" />
            <span className="text-xl text-gray-400">›</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <button className="flex-1 border rounded-xl py-4 text-sm font-medium">
            로그아웃
          </button>
          <button className="flex-1 border rounded-xl py-4 text-sm font-medium text-red-500">
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
