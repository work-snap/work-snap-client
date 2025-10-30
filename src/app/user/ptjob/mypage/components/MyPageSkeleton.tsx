export default function MyPageSkeleton() {
  return (
    <div className="h-dvh bg-white max-w-[430px] w-full flex flex-col">
      <div className="p-4 flex flex-col gap-6 flex-grow pt-[40px]">
        {/* 타이틀 스켈레톤 */}
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>

        {/* 프로필 카드 스켈레톤 */}
        <div className="flex items-center gap-4 p-4 rounded-xl border animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>

        {/* 버튼 리스트 스켈레톤 */}
        <div className="space-y-2 pt-[20px]">
          <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* 하단 버튼 스켈레톤 */}
      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <div className="flex-1 h-14 border rounded-xl bg-gray-50 animate-pulse"></div>
          <div className="flex-1 h-14 border rounded-xl bg-gray-50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
