"use client";

import WorkplaceDropdown from "@/app/attendance/add-work/components/WorkplaceDropdown";
import { useState } from "react";
import { format, subDays, addDays, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { workplaceTestApis } from "@/app/develop-test/lib/api";
import { useGetDailyTimeLine } from "@/lib/queries/getDailyTimeLine";

interface WorkplaceSummary {
  id: number;
  workplaceName: string;
  workplaceType: string | null;
  workplaceAddress: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  workplaceColorIndex: number;
}

interface AddWorkForm {
  date: string;
  workplaceId: number | null;
  startTime: string;
  endTime: string;
  notes: string;
}

export default function MainPage() {
  const [form, setForm] = useState<AddWorkForm>({
    date: getTodayDate(),
    workplaceId: null,
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [currentDay, setCurrentDay] = useState(new Date());

  // 하루 단위 이전/다음
  const prevDay = () => {
    const newDate = subDays(currentDay, 1);
    setCurrentDay(newDate);
    setForm((prev) => ({ ...prev, date: format(newDate, "yyyy-MM-dd") }));
  };

  const nextDay = () => {
    const newDate = addDays(currentDay, 1);
    setCurrentDay(newDate);
    setForm((prev) => ({ ...prev, date: format(newDate, "yyyy-MM-dd") }));
  };

  const handleInputChange = (field: keyof AddWorkForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 사업장 목록 조회
  const {
    data: workplacesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myWorkplaces"],
    queryFn: async () => {
      const res = await workplaceTestApis.getWorkplaces();
      return res.data.workplaces.map((wp: any) => ({
        id: wp.id,
        workplaceName: wp.workplaceName,
        workplaceType: wp.workplaceType,
        workplaceAddress: wp.workplaceAddress,
        isMainWorkplace: wp.isMainWorkplace,
        isActive: wp.isActive,
        workplaceColorIndex: wp.workplaceColorIndex,
      })) as WorkplaceSummary[];
    },
  });
  const { data: timelineData } = useGetDailyTimeLine(
    form.workplaceId,
    form.date
  );

  return (
    <div className="h-dvh flex flex-col bg-white p-4 rounded-2xl">
      {/* 사업장 드롭다운 */}
      {isLoading ? (
        <p>로딩중...</p>
      ) : isError ? (
        <p>사업장 조회 실패</p>
      ) : (
        <WorkplaceDropdown
          workplaces={workplacesData || []}
          selectedWorkplaceId={form.workplaceId}
          onChange={(id) => handleInputChange("workplaceId", id)}
          label="사업장을 선택하세요"
        />
      )}

      {/* 날짜 네비게이션 */}
      <div className="w-full flex justify-between items-center gap-2 mt-4">
        <button
          className="bg-main text-white text-sm px-4 py-2 rounded-lg"
          onClick={() => {
            const today = new Date();
            setCurrentDay(today);
            setForm((prev) => ({ ...prev, date: format(today, "yyyy-MM-dd") }));
          }}
        >
          오늘
        </button>
        <div className="flex items-center space-x-2 text-md text-gray4">
          <ChevronLeft
            size={24}
            className="cursor-pointer text-gray3"
            onClick={prevDay}
          />
          <span>{format(currentDay, "yyyy년 M월 d일", { locale: ko })}</span>
          <ChevronRight
            size={24}
            className="cursor-pointer text-gray3"
            onClick={nextDay}
          />
        </div>
        <div className="px-8"></div>
      </div>

      {/* 직원별 출퇴근 기록 */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p>출퇴근 기록 불러오는 중...</p>
        ) : isError ? (
          <p>출퇴근 기록 조회 실패</p>
        ) : timelineData?.data.employees?.length ? (
          timelineData.data.employees.map((emp) => (
            <div key={emp.userId} className="flex flex-col gap-2 border-b pb-2">
              <div className="bg-gray2 p-2">
                <span className="font-medium">{emp.employeeName}</span>
              </div>
              <div className="mt-1 text-md text-gray-600  space-y-1 p-1">
                {emp.items.map((item, idx) => {
                  // 기본 색상 매핑
                  const actionColor = item.badges?.includes("조퇴")
                    ? "text-yellow-500"
                    : item.actionKorean === "출근"
                    ? "text-blue-500"
                    : item.actionKorean === "퇴근"
                    ? "text-red-500"
                    : item.actionKorean === "무단결근"
                    ? "text-black"
                    : "text-gray-600";

                  return (
                    <div key={idx} className="flex justify-between">
                      {item.badges?.length > 0 ? (
                        <>
                          <span className={`${actionColor} text-md`}>
                            {formatTime(item.time)}
                          </span>
                          <span className={`${actionColor} text-md`}>
                            {item.badges.join(", ")}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={`font-medium ${actionColor}`}>
                            {formatTime(item.time)}
                          </span>
                          <span className={`font-medium ${actionColor}`}>
                            {item.actionKorean}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <span className="text-gray-400">기록 없음</span>
        )}
      </div>
    </div>
  );
}

// 오늘 날짜 문자열 반환 (yyyy-MM-dd)
function getTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
}
function formatTime(timeString: string) {
  if (!timeString) return "";

  // 초까지 있는 경우: 16:48:49.181719 → 16:48:49
  const withSeconds = timeString.match(/^\d{2}:\d{2}:\d{2}/)?.[0];
  if (withSeconds) {
    return format(parse(withSeconds, "HH:mm:ss", new Date()), "a h:mm", {
      locale: ko,
    });
  }

  // 초 없이 시:분만 있는 경우: 18:00
  const withMinutes = timeString.match(/^\d{2}:\d{2}/)?.[0];
  if (withMinutes) {
    return format(parse(withMinutes, "HH:mm", new Date()), "a h:mm", {
      locale: ko,
    });
  }

  return timeString; // fallback
}
