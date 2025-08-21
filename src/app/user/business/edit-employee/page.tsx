"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import DayTimePicker, {
  type ScheduleItem,
} from "@/src/app/components/DayTimePicker";
import { DatePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { useGetEmployeeList } from "@/lib/queries/getEmployeeList";
import { useGetWorkplaceDetail } from "@/lib/queries/getWPDetail";
import { useUpdateEmployee } from "@/lib/queries/updateEmployee";

export default function EditEmployee() {
  const updateEmployeeMutation = useUpdateEmployee();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("idx"));
  const employeeId = Number(searchParams.get("userId"));

  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // 사업장 상세
  const { data: workplace, isLoading: isWorkplaceLoading } =
    useGetWorkplaceDetail(workplaceId);
  // 직원 목록
  const { data: employeeList } = useGetEmployeeList(workplaceId);

  const handleSchedulesChange = useCallback((newSchedules: ScheduleItem[]) => {
    setSchedules(newSchedules);
  }, []);

  const handleHourlyWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setHourlyWage(value);
    }
  };

  // 🔹 기존 알바 정보 초기값 세팅
  useEffect(() => {
    if (!employeeList?.data || employeeList.data.length === 0) return;

    const employeeData = employeeList.data[0]; // 배열의 첫 번째 요소 접근
    console.log("employeeData:", employeeData);

    setCode(employeeData.inviteCode || "");
    setName(employeeData.name || "");
    setPhone(employeeData.phoneNumber || "");
    setContractStartDate(employeeData.contractStartDate || "");
    setContractEndDate(employeeData.contractEndDate || "");

    if ((employeeData as any).hourlyWage) {
      setHourlyWage(String((employeeData as any).hourlyWage));
    }
  }, [employeeList]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hourlyWage || isNaN(Number(hourlyWage)) || Number(hourlyWage) <= 0) {
      toast({
        title: "시급 입력",
        description: "올바른 시급을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (schedules.length === 0) {
      toast({
        title: "입력 누락",
        description: "근무 시간을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        contractStartDate,
        contractEndDate,
        hourlyWageUpdate: {
          newHourlyWage: Number(hourlyWage),
          changeType: "IMMEDIATE" as "IMMEDIATE" | "DEFERRED",
        },
        schedules,
      };

      const res = await updateEmployeeMutation.mutateAsync({
        workplaceId,
        employeeId,
        payload: {
          ...payload,
          schedules: schedules.map((item) => ({
            ...item,
            // DayTimePicker의 ScheduleItem의 dayOfWeek(string)를
            // updateEmployee의 ScheduleItem의 dayOfWeek(enum)으로 변환
            dayOfWeek: item.dayOfWeek.toUpperCase() as
              | "MONDAY"
              | "TUESDAY"
              | "WEDNESDAY"
              | "THURSDAY"
              | "FRIDAY"
              | "SATURDAY"
              | "SUNDAY",
          })),
        },
      });

      toast({
        title: "수정 완료",
        description: "알바 정보가 업데이트되었습니다.",
        variant: "success",
      });
      router.push(`/user/business/add-business/detail?idx=${workplaceId}`);
    } catch (err: any) {
      toast({
        title: "수정 실패",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  if (isWorkplaceLoading) return <div>로딩 중...</div>;

  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      <div className="flex flex-col px-2 py-2">
        <button
          onClick={() =>
            router.push(`/user/business/add-business/detail?idx=${workplaceId}`)
          }
          className="text-gray5 font-semibold text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 max-h-[1137px] overflow-y-auto ">
        <span className="ml-4 mt-2 font-extrabold text-2xl">
          알바 정보 수정
        </span>
        <div className="px-4 mb-2">
          <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray4 font-semibold text-base">
            사업장 : {workplace?.workplaceName || "-"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 ">
          {/* 인증코드 */}
          <span className="font-semibold text-gray4">인증코드</span>
          <label className="flex gap-2">
            <input
              type="text"
              value={code}
              disabled
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="예) 23FK99"
            />
          </label>

          {/* 이름 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">이름</span>
            <input
              type="text"
              value={name}
              disabled
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="이름 입력"
            />
          </label>

          {/* 번호 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">번호</span>
            <div className="relative">
              <input
                type="text"
                value={phone}
                disabled
                className="border border-gray2 rounded-lg p-3 w-full"
                placeholder="예) 010-1234-1234"
              />
              {phone && phone.startsWith("010-1234-") && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  임시번호
                </span>
              )}
            </div>
          </label>

          {/* 계약 기간 */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray4">계약 기간</span>
            <div className="flex items-center justify-center gap-2">
              <DatePicker
                value={contractStartDate ? parseDate(contractStartDate) : null}
                onChange={(newDate: CalendarDate | null) => {
                  if (newDate) {
                    setContractStartDate(
                      `${newDate.year}-${String(newDate.month).padStart(
                        2,
                        "0"
                      )}-${String(newDate.day).padStart(2, "0")}`
                    );
                  }
                }}
                aria-label="계약 시작일"
                placeholder="시작일"
                disableAnimation
                showMonthAndYearPickers
                granularity="day"
              />
              <span>-</span>
              <DatePicker
                value={contractEndDate ? parseDate(contractEndDate) : null}
                onChange={(newDate: CalendarDate | null) => {
                  if (newDate) {
                    setContractEndDate(
                      `${newDate.year}-${String(newDate.month).padStart(
                        2,
                        "0"
                      )}-${String(newDate.day).padStart(2, "0")}`
                    );
                  }
                }}
                aria-label="계약 종료일"
                placeholder="종료일"
                disableAnimation
                showMonthAndYearPickers
                granularity="day"
              />
            </div>
          </div>

          {/* 시급 입력 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">시급</span>
            <div className="relative">
              <input
                type="text"
                value={hourlyWage}
                onChange={handleHourlyWageChange}
                className="border border-gray2 rounded-lg p-3 w-full pr-16"
                placeholder="예: 10000"
                maxLength={6}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray3 text-sm">
                원/시간
              </span>
            </div>
            {hourlyWage && (
              <div className="text-xs text-gray3 mt-1">
                입력된 시급: {Number(hourlyWage).toLocaleString()}원/시간
              </div>
            )}
          </label>

          {/* 근무 시간 */}
          <DayTimePicker onChange={handleSchedulesChange} />

          {/* 등록 버튼 */}
          <div className="w-full pt-6 pb-8">
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
            >
              알바 수정하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
