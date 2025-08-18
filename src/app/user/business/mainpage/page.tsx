"use client";

import WorkplaceDropdown from "@/app/attendance/add-work/components/WorkplaceDropdown";
import { useState, useEffect } from "react";
import { format, subDays, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  workplaceTestApis,
  workScheduleTestApis,
} from "@/app/develop-test/lib/api";

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

interface Employee {
  userId: number;
  name: string;
  email?: string | null;
  inviteCode?: string;
  activeScheduleCount: number;
  totalScheduleCount: number;
  lastWorkDate?: string | null;
  createdAt: string;
}

// 날짜 → 한글 요일 반환
function getDayKorean(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, "eeee", { locale: ko }); // ex: "월요일"
}

export default function MainPage() {
  const [form, setForm] = useState<AddWorkForm>({
    date: getTodayDate(),
    workplaceId: null,
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Record<number, any[]>>({});
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

  // 직원 목록 조회
  useEffect(() => {
    if (!form.workplaceId) return;

    const fetchEmployees = async () => {
      try {
        const res = await workScheduleTestApis.getWorkplaceEmployees(
          form.workplaceId!
        );
        setEmployees(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, [form.workplaceId]);

  // 직원별 근무 기록 조회 (요일 기준 필터링)
  useEffect(() => {
    if (!form.workplaceId || employees.length === 0) return;

    const fetchAttendance = async () => {
      const newAttendance: Record<number, any[]> = {};
      const todayKorean = getDayKorean(form.date); // ex: "월요일"

      for (const emp of employees) {
        const res = await workScheduleTestApis.getEmployeeScheduleDetail(
          form.workplaceId!,
          emp.userId
        );
        const schedules = res.data?.data?.schedules ?? [];

        // 선택한 날짜 요일 기준 필터링
        const todayRecords = schedules.filter(
          (s: any) => s.dayOfWeekKorean === todayKorean
        );

        newAttendance[emp.userId] = todayRecords;
      }

      setAttendance(newAttendance);
    };

    fetchAttendance();
  }, [form.workplaceId, form.date, employees]);

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
        {employees.map((emp) => (
          <div key={emp.userId} className="flex flex-col gap-2 border-b pb-2">
            <div className="bg-gray2 p-2">
              <span className="font-medium">{emp.name}</span>
            </div>

            <div className="mt-1 text-sm text-gray-600">
              {attendance[emp.userId] && attendance[emp.userId].length > 0 ? (
                attendance[emp.userId].map((rec, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {rec.startTime ? `출근 ${rec.startTime}` : "미출근"}
                    </span>
                    <span>
                      {rec.endTime ? `퇴근 ${rec.endTime}` : "미퇴근"}
                    </span>
                    <span className="text-main">{rec.currentStatus ?? ""}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400">기록 없음</span>
              )}
            </div>
          </div>
        ))}
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
