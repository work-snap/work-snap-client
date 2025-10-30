import Benner from "@/src/app/components/benner";

export default function JobListSkeleton() {
  return (
    <div className="h-dvh flex flex-col w-full relative max-w-[430px] overflow-y-auto">
      <div className="shrink-0">
        <Benner />
      </div>

      {/* 인증코드 스켈레톤 */}
      <div className="px-4 mt-2 shrink-0">
        <div className="flex items-center w-full">
          <span className="text-m text-gray4 font-bold mr-2 whitespace-nowrap">
            인증코드
          </span>
          <div className="flex-1 flex items-center rounded-lg px-3 py-2 shadow-sm border border-gray2">
            <div className="flex-1 h-8 bg-gray2 animate-pulse rounded" />
            <div className="ml-2 w-5 h-5 bg-gray2 animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* 워크플레이스 카드 스켈레톤 (3개) */}
      <div className="px-4 mt-4 flex flex-col gap-3 flex-1">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray2 p-4 flex justify-between items-center mb-3 shrink-0"
          >
            <div className="flex flex-col gap-2 flex-1">
              {/* 색상 동그라미 + 이름 */}
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray2 rounded-full animate-pulse mr-2" />
                <div className="h-6 w-32 bg-gray2 animate-pulse rounded" />
              </div>
              {/* 계약 기간 */}
              <div className="h-4 w-48 bg-gray2 animate-pulse rounded" />
              {/* 스케줄 */}
              <div className="flex flex-col gap-1">
                <div className="h-4 w-40 bg-gray2 animate-pulse rounded" />
                <div className="h-4 w-36 bg-gray2 animate-pulse rounded" />
              </div>
            </div>

            {/* 출근 확인 버튼 */}
            <div className="w-24 h-20 bg-gray2 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
