"use client";
import { useCallback, useState, useEffect, Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  getDaysInMonth,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useGetMyWP } from "@/lib/queries/getMyWP";
import { useSearchParams } from "next/navigation";
import ColorWorkplaceDropdown from "../add-work/components/ColorWorkplaceDropDown";
import { fetchMonthlyCalendar } from "@/api/attendanceApi";

interface AddWorkForm {
  date: string;
  workplaceId: number | null;
  startTime: string;
  endTime: string;
  notes: string;
}

interface Schedule {
  id: number;
  workplaceId: number;
  dayOfWeek: string; // SUNDAY, MONDAY, ...
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface WorkplaceSummary {
  id: number;
  workplaceName: string;
  workplaceType: string | null;
  workplaceAddress: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  workplaceColorIndex: number;
  contractStartDate: string;
  contractEndDate: string;
  schedules?: Schedule[];
}

function WorkCalendarContent() {
  const searchParams = useSearchParams();
  const workplaceIdFromQuery = searchParams.get("workplaceId");

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 새로운 API 응답 구조: Map<날짜, 상태배열>
  const [dailyStatuses, setDailyStatuses] = useState<Map<string, string[]>>(
    new Map()
  );
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const { data: workplacesResponse } = useGetMyWP();

  const workplaces: WorkplaceSummary[] =
    workplacesResponse?.data?.map((wp) => ({
      id: wp.workplace.id,
      workplaceName: wp.workplace.workplaceName,
      workplaceType: wp.workplace.workplaceType,
      workplaceAddress: wp.workplace.workplaceAddress,
      isMainWorkplace: wp.workplace.isMainWorkplace,
      isActive: wp.workplace.isActive,
      workplaceColorIndex: wp.workplace.workplaceColorIndex,
      contractStartDate: wp.contractStartDate,
      contractEndDate: wp.contractEndDate,
      schedules: wp.schedules?.map((s) => ({
        id: s.id,
        workplaceId: s.workplaceId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive,
      })),
    })) || [];

  const getTodayDate = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [form, setForm] = useState<AddWorkForm>({
    date: getTodayDate(),
    workplaceId: null,
    startTime: "",
    endTime: "",
    notes: "",
  });

  // 초기값 세팅용 useEffect (한 번만)
  useEffect(() => {
    if (!workplaces || workplaces.length === 0) return;
    if (form.workplaceId !== null) return;

    const initialId = workplaceIdFromQuery
      ? Number(workplaceIdFromQuery)
      : workplaces[0].id;

    setForm((prev) => ({ ...prev, workplaceId: initialId }));
  }, [workplaces, workplaceIdFromQuery]);

  // 월별 출근 기록 가져오기 (새로운 API 구조)
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!form.workplaceId) return;

      setIsLoadingAttendance(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        // 월별 API 호출 (한 번에 전체 월 데이터 조회)
        const response = await fetchMonthlyCalendar({
          workplaceId: form.workplaceId,
          year,
          month,
        });

        // 새로운 API 구조: days 배열
        const newDailyStatuses = new Map<string, string[]>();

        response.days?.forEach((day) => {
          newDailyStatuses.set(day.date, day.statuses);
        });

        setDailyStatuses(newDailyStatuses);

        console.log("📅 월간 캘린더 로드 완료:", {
          year,
          month,
          totalDays: newDailyStatuses.size,
        });
      } catch (error) {
        console.error("출근 기록 조회 실패:", error);
        setDailyStatuses(new Map());
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchAttendanceRecords();
  }, [currentMonth, form.workplaceId]);

  const handleInputChange = useCallback(
    (field: keyof AddWorkForm, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const firstDay = startOfMonth(currentMonth);
  const startWeekDay = getDay(firstDay);
  const daysInMonth = getDaysInMonth(currentMonth);

  const selectedWorkplace = workplaces.find((wp) => wp.id === form.workplaceId);

  const isWorkday = (date: number) => {
    if (!selectedWorkplace || !selectedWorkplace.schedules) return false;

    const fullDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );

    // 계약기간 체크
    const contractStart = new Date(selectedWorkplace.contractStartDate);
    const contractEnd = new Date(selectedWorkplace.contractEndDate);

    // 디버깅 로그 (첫날만)
    if (date === 1) {
      console.log("📅 계약기간 정보:", {
        workplaceName: selectedWorkplace.workplaceName,
        contractStart: selectedWorkplace.contractStartDate,
        contractEnd: selectedWorkplace.contractEndDate,
        currentMonth: currentMonth.toISOString().split("T")[0],
      });
    }

    // 해당 날짜가 계약기간에 포함되지 않으면 출근일이 아님
    if (fullDate < contractStart || fullDate > contractEnd) {
      return false;
    }

    const dayIndex = getDay(fullDate); // 0: 일요일, 1: 월요일 ...
    const dayOfWeekMap = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const dayOfWeekStr = dayOfWeekMap[dayIndex];

    return selectedWorkplace.schedules.some(
      (s) => s.dayOfWeek === dayOfWeekStr && s.isActive
    );
  };

  // 특정 날짜의 상태 배열 가져오기
  const getDayStatuses = (date: number): string[] => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

    return dailyStatuses.get(dateStr) || [];
  };

  // 특정 상태 포함 여부 체크
  const hasStatus = (date: number, statusToCheck: string): boolean => {
    const statuses = getDayStatuses(date);
    return statuses.includes(statusToCheck);
  };

  return (
    <div className="h-dvh flex flex-col bg-white p-4 rounded-2xl">
      <div className="flex flex-col items-center gap-7">
        {/* 선택된 사업장 색상 */}

        <ColorWorkplaceDropdown
          workplaces={workplaces}
          selectedWorkplaceId={form.workplaceId}
          onChange={(id) => handleInputChange("workplaceId", id)}
          label="사업장을 선택하세요"
        />

        <div className="w-full flex justify-between items-center gap-2">
          <button
            className="bg-main text-white text-sm px-4 py-2 rounded-lg"
            onClick={() => setCurrentMonth(new Date())}
          >
            오늘
          </button>
          <div className="flex items-center space-x-2 text-md text-gray4">
            <ChevronLeft
              size={18}
              className="cursor-pointer"
              onClick={prevMonth}
            />
            <span>{format(currentMonth, "yyyy년 M월", { locale: ko })}</span>
            <ChevronRight
              size={18}
              className="cursor-pointer"
              onClick={nextMonth}
            />
          </div>
          <div className="px-7"></div>
          {/* <button className="border px-4 py-2 rounded-md">
            <CalendarIcon size={16} />
          </button> */}
        </div>
      </div>

      {/* 달력 범례 */}
      <div className="flex flex-wrap justify-between gap-2 mt-8 text-xs text-gray5">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          ></span>
          출근일
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#ff0000" }}
          ></span>
          출근완료
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#F97316" }}
          ></span>
          조퇴
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#6B7280" }}
          ></span>
          지각
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#000000" }}
          ></span>
          무단
        </span>
      </div>

      <div className="h-full grid grid-cols-7 gap-2 mt-4 text-center text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="flex justify-center items-center font-bold">
            {d}
          </div>
        ))}
        {Array.from({ length: startWeekDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = i + 1;
          const fullDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            date
          );
          const today = isToday(fullDate);

          // 새로운 API 기반 상태 체크
          const statuses = getDayStatuses(date);
          const isWorkday = statuses.includes("WORKDAY");
          const isOff = statuses.includes("OFF");
          const isCheckedInDay = statuses.includes("CHECKED_IN");
          const isAbsent = statuses.includes("ABSENT");
          const hasEarlyLeave = statuses.includes("EARLY_LEAVE");
          const hasLate = statuses.includes("LATE");

          // 상태별 border 색상 결정
          let borderColor = "transparent";

          if (hasEarlyLeave) {
            borderColor = "#F97316"; // 🟠 조퇴 (최우선)
          } else if (isCheckedInDay) {
            borderColor = "#ff0000"; // 🔴 출근완료
          } else if (isAbsent && !isWorkday) {
            // WORKDAY 없이 ABSENT만 있을 때 무단 (과거 확정)
            borderColor = "#000000"; // ⚫ 무단결근
          } else if (isWorkday) {
            // 출근일 또는 출근일+무단(아직 진행 중)
            borderColor = "#3B82F6"; // 🔵 출근일 (평소 상태)
          } else if (isAbsent) {
            // WORKDAY 없는 과거 무단
            borderColor = "#000000"; // ⚫ 무단결근
          }

          // 날짜 표시 여부
          const shouldShowWorkplace = isWorkday || isCheckedInDay || isAbsent;
          const isGrayedOut = isOff || (!isWorkday && !isCheckedInDay);

          return (
            <div
              key={date}
              className={`flex flex-col items-center gap-1 rounded-lg justify-evenly ${
                today ? "border border-gray4" : ""
              }`}
            >
              <div className="relative">
                {/* 🔘 지각 indicator - 왼쪽 위 작은 회색 원 */}
                {hasLate && (
                  <div
                    className="absolute -top-0.5 -left-1 w-2 h-2 rounded-full z-10"
                    style={{ backgroundColor: "#6B7280" }}
                  />
                )}
                <div
                  className={`w-8 h-8 flex justify-center items-center bg-gray2 rounded-full ${
                    isGrayedOut ? "text-gray-400" : "text-black"
                  }`}
                  style={{
                    border:
                      borderColor !== "transparent"
                        ? `2px solid ${borderColor}`
                        : "none",
                  }}
                >
                  {date}
                </div>
              </div>
              <span className="text-[10px] leading-none mt-0.5 h-[12px] text-pink-500">
                {shouldShowWorkplace && selectedWorkplace
                  ? selectedWorkplace.workplaceName.split(" ")[0]
                  : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WorkCalendar() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh flex items-center justify-center">로딩 중...</div>
      }
    >
      <WorkCalendarContent />
    </Suspense>
  );
}
