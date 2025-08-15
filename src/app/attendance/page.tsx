"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AttendanceCard from "./components/AttendanceCard";
import { ScedulesProps } from "./components/types";
import { format, addDays, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { useUser } from "@/contexts/UserContext";
import { useDailySchedules } from "@/hooks/useAttendanceQuery";

export default function AttendancePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { user, isLoading: userLoading } = useUser();

  // 실제 API 연동 - 사용자의 모든 사업장 스케줄 조회
  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useDailySchedules(formatApiDate(currentDate));

  // 날짜 변경 핸들러
  const handlePrevDay = () => {
    setCurrentDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 근무 추가 핸들러
  const handleAddAttendance = () => {
    router.push("/attendance/add-work");
  };

  // 날짜 포맷팅 함수
  function formatDisplayDate(date: Date) {
    return format(date, "yyyy년 M월 d일", { locale: ko });
  }

  function formatApiDate(date: Date) {
    return format(date, "yyyy-MM-dd");
  }

  // API 호출이 실패할 경우 폴백 데이터 처리
  const fallbackSchedules = error ? [] : schedules;

  // 사업장별로 스케줄 그룹화
  const schedulesByWorkplace = fallbackSchedules.reduce((acc, schedule) => {
    const workplaceKey = `${schedule.workplaceId}-${schedule.workplaceName}`;
    if (!acc[workplaceKey]) {
      acc[workplaceKey] = {
        workplaceId: schedule.workplaceId,
        workplaceName: schedule.workplaceName,
        schedules: [],
      };
    }
    acc[workplaceKey].schedules.push(schedule);
    return acc;
  }, {} as Record<string, { workplaceId: number; workplaceName: string; schedules: ScedulesProps[] }>);

  // 각 사업장 내 스케줄들을 시작 시간 순으로 정렬
  const workplaceGroups = Object.values(schedulesByWorkplace).map(
    (workplace) => ({
      ...workplace,
      schedules: workplace.schedules.sort((a, b) => {
        // scheduledStartDate를 기준으로 정렬
        const timeA = new Date(a.scheduledStartDate).getTime();
        const timeB = new Date(b.scheduledStartDate).getTime();
        return timeA - timeB;
      }),
    })
  );

  return (
    <div className="flex flex-col bg-white w-full h-screen max-w-[430px] mx-auto">
      {/* 헤더 - 고정 높이 */}
      <div className="bg-white w-full flex-shrink-0">
        <div className="flex justify-between items-center p-2 w-full space-x-2">
          {/* 왼쪽 고정 박스 */}
          <div className="w-16 h-16 bg-main rounded-xl flex items-center justify-center">
            <CalenderIcon />
          </div>
          {/* 가운데 가변 박스 */}
          <div className="flex-1 bg-main rounded-xl p-2 flex items-center justify-between h-16 text-white font-semibold">
            <button onClick={handlePrevDay} className="p-1 rounded">
              <ChevronLeft size={28} strokeWidth={2.5} color="#fff" />
            </button>
            <div className="text-center">{formatDisplayDate(currentDate)}</div>
            <button onClick={handleNextDay} className="p-1 rounded">
              <ChevronRight size={28} strokeWidth={2.5} color="#fff" />
            </button>
          </div>
          {/* 오른쪽 고정 박스 */}
          <button
            onClick={handleToday}
            className="w-16 h-16 bg-main rounded-xl flex items-center justify-center text-white font-semibold transition-colors"
          >
            오늘
          </button>
        </div>
      </div>
      {/* 리스트 - 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-2 p-2">
          {userLoading || isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-8 space-y-2">
              <div className="text-red-500 text-center">
                <div className="font-semibold">
                  {error.message?.includes("401")
                    ? "로그인이 필요합니다"
                    : "서버에 연결할 수 없습니다"}
                </div>
                <div className="text-sm mt-1">
                  {error.message?.includes("401")
                    ? "test-login 페이지에서 로그인 후 다시 시도해주세요"
                    : "서버가 실행되지 않았거나 네트워크 연결을 확인해주세요"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-main text-white rounded-lg"
                >
                  다시 시도
                </button>
                {error.message?.includes("401") && (
                  <button
                    onClick={() => (window.location.href = "/test-login")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    로그인하기
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                API:{" "}
                {process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "http://localhost:8080"}
              </div>
            </div>
          ) : workplaceGroups.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">
                해당 날짜에 스케줄이 없습니다.
              </div>
            </div>
          ) : (
            workplaceGroups.map((workplace) => (
              <div key={`workplace-${workplace.workplaceId}`} className="mb-4">
                {/* 해당 사업장의 스케줄들 */}
                <div className="space-y-2">
                  {workplace.schedules.map((schedule) => (
                    <AttendanceCard key={schedule.id} {...schedule} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* 근무 추가 버튼 */}
          {!userLoading && !isLoading && !error && (
            <div
              className="w-full py-4 bg-gray-200 rounded-xl text-gray-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
              onClick={handleAddAttendance}
            >
              추가근무 +
            </div>
          )}
        </div>
      </div>
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
