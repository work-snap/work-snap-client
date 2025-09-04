"use client";
import { useCallback, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
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
  schedules?: Schedule[];
}

const getColorFromIndex = (index: number) => {
  const colors = ["#eeace3", "#fcdd2c", "#08fd31", "#44d1fc", "#b700ff"];
  return colors[index % colors.length];
};

export default function WorkCalendar() {
  const searchParams = useSearchParams();
  const workplaceIdFromQuery = searchParams.get("workplaceId");

  const [currentMonth, setCurrentMonth] = useState(new Date());
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
      <div className="flex flex-wrap justify-between gap-3 mt-8 text-sm text-gray5">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-500 rounded-full"></span> 출근일
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-500 rounded-full"></span> 출근완료
        </span>
        {/* <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-500 rounded-full"></span> 휴무
        </span> */}
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-orange-500 rounded-full"></span> 조퇴
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-500 rounded-full"></span> 지각
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-black rounded-full"></span> 무단
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
          const workday = isWorkday(date);

          return (
            <div
              key={date}
              className={`flex flex-col items-center gap-1 rounded-lg justify-evenly ${
                today ? "border border-gray4" : ""
              }`}
            >
              <div
                className={`w-8 h-8 flex justify-center items-center bg-gray2 rounded-full ${
                  workday ? "text-black" : "text-gray-400"
                }`}
                style={{
                  border: workday ? "2px solid #3B82F6" : "none", // 출근일 색상 고정
                }}
              >
                {date}
              </div>
              <span className="text-[10px] leading-none mt-0.5 h-[12px] text-pink-500">
                {workday && selectedWorkplace
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
