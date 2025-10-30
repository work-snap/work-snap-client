import { ChevronLeft, ChevronRight } from "lucide-react";

interface AttendanceSkeletonProps {
  currentDate?: Date;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onToday?: () => void;
  showInteraction?: boolean;
}

export default function AttendanceSkeleton({
  currentDate = new Date(),
  onPrevDay,
  onNextDay,
  onToday,
  showInteraction = false,
}: AttendanceSkeletonProps) {
  const formatDisplayDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const HeaderComponent = showInteraction ? "button" : "div";

  return (
    <div className="flex flex-col bg-white w-full h-dvh">
      {/* 헤더 - 고정 높이 */}
      <div className="bg-white w-full flex-shrink-0">
        <div className="flex justify-between items-center p-2 w-full space-x-2">
          {/* 왼쪽 고정 박스 */}
          <div className="w-16 h-16 bg-main rounded-xl flex items-center justify-center">
            <CalenderIcon />
          </div>
          {/* 가운데 가변 박스 */}
          <div className="flex-1 bg-main rounded-xl p-2 flex items-center justify-between h-16 text-white font-semibold">
            <HeaderComponent
              {...(showInteraction && onPrevDay ? { onClick: onPrevDay } : {})}
              className={`p-1 rounded ${
                showInteraction ? "cursor-pointer" : ""
              }`}
            >
              <ChevronLeft size={28} strokeWidth={2.5} color="#fff" />
            </HeaderComponent>
            <div className="text-center">{formatDisplayDate(currentDate)}</div>
            <HeaderComponent
              {...(showInteraction && onNextDay ? { onClick: onNextDay } : {})}
              className={`p-1 rounded ${
                showInteraction ? "cursor-pointer" : ""
              }`}
            >
              <ChevronRight size={28} strokeWidth={2.5} color="#fff" />
            </HeaderComponent>
          </div>
          {/* 오른쪽 고정 박스 */}
          <HeaderComponent
            {...(showInteraction && onToday ? { onClick: onToday } : {})}
            className={`w-16 h-16 bg-main rounded-xl flex items-center justify-center text-white font-semibold ${
              showInteraction ? "transition-colors cursor-pointer" : ""
            }`}
          >
            오늘
          </HeaderComponent>
        </div>
      </div>

      {/* 스켈레톤 카드 리스트 */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1 flex flex-col gap-2 p-2">
          {/* 스켈레톤 카드 1 */}
          <SkeletonCard />
          {/* 스켈레톤 카드 2 */}
          <SkeletonCard delay="200ms" />
        </div>

        {/* 추가근무 버튼 스켈레톤 */}
        <div
          className="max-w-[400px] w-full mx-auto py-4 bg-gray-200 rounded-xl 
           text-gray-600 font-bold flex items-center justify-center mb-2 animate-pulse"
        >
          추가근무 +
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ delay = "0ms" }: { delay?: string }) {
  return (
    <div
      className="w-full bg-white rounded-xl overflow-hidden border border-gray1 animate-pulse"
      style={{ animationDelay: delay }}
    >
      {/* 헤더 스켈레톤 */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray1 bg-gray2">
        <div className="h-6 bg-gray-300 rounded w-24"></div>
        <div className="h-8 bg-gray-300 rounded-full w-20"></div>
      </div>

      {/* 바디 스켈레톤 */}
      <div className="flex flex-col px-4 py-3">
        <div className="flex items-center justify-start mb-2">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          {/* 왼쪽 시간 */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            <div className="h-12 bg-gray-300 rounded w-24"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
          </div>
          {/* 가운데 점 */}
          <div className="flex items-center justify-center w-8 h-8">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
          {/* 오른쪽 시간 */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            <div className="h-12 bg-gray-300 rounded w-24"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* 버튼 스켈레톤 */}
      <div className="w-full h-12 bg-gray-200 border-t border-gray1"></div>
    </div>
  );
}

const CalenderIcon = () => {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 65.1067 72.3367"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      strokeWidth={1}
    >
      <desc>Created with Pixso.</desc>
      <defs />
      <path
        id="event_available_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24-32"
        d="M28.75 59.13L15.91 46.29L21.15 41.05L28.76 48.65L43.95 33.46L49.19 38.7L28.75 59.13ZM7.23 72.33C5.22 72.36 3.52 71.65 2.12 70.21C0.67 68.81 -0.03 67.11 0 65.1L0 14.46C-0.03 12.45 0.68 10.75 2.12 9.35C3.52 7.9 5.22 7.2 7.23 7.22L10.85 7.22L10.85 0L18.08 0L18.08 7.23L47.02 7.23L47.02 0L54.25 0L54.25 7.23L57.87 7.23C59.88 7.2 61.58 7.91 62.98 9.35C64.42 10.75 65.13 12.45 65.1 14.46L65.1 65.1C65.13 67.1 64.42 68.81 62.98 70.2C61.58 71.65 59.88 72.36 57.87 72.33L7.23 72.33ZM7.23 65.1L57.87 65.1L57.87 28.93L7.23 28.93L7.23 65.1ZM7.23 21.7L57.87 21.7L57.87 14.46L7.23 14.46L7.23 21.7Z"
        fill="#FFFFFF"
        fillOpacity="1.000000"
        fillRule="nonzero"
      />
    </svg>
  );
};
