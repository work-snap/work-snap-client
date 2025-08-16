"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/src/app/components/navigation";
import { ConflictAlert, useConflictAlert } from "@/components/ConflictAlert";
import {
  scheduleService,
  CreateScheduleRequest,
} from "@/services/scheduleService";
import { BaseButton } from "@/app/components/BaseButton";
import { DatePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";

export default function AddWorkPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2024-06-17");
  const [startTime, setStartTime] = useState("06:30");
  const [endTime, setEndTime] = useState("18:30");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  const { isVisible, conflicts, alertProps, showAlert, hideAlert } =
    useConflictAlert();

  // 충돌 검사 함수
  const checkConflict = useCallback(
    async (scheduleData: CreateScheduleRequest) => {
      setIsCheckingConflict(true);
      try {
        const result = await scheduleService.checkScheduleConflict(
          scheduleData
        );
        if (result.hasConflict) {
          showAlert(result.conflicts, {
            type: "modal",
            canProceed: result.canProceed,
            recommendation: result.recommendation,
            onProceed: () => {
              hideAlert();
              createSchedule(scheduleData, true);
            },
            onCancel: hideAlert,
          });
          return false;
        }
        return true;
      } catch (error) {
        console.error("충돌 검사 실패:", error);
        return true;
      } finally {
        setIsCheckingConflict(false);
      }
    },
    [showAlert, hideAlert]
  );

  // 스케줄 생성 함수
  const createSchedule = useCallback(
    async (scheduleData: CreateScheduleRequest, forceCreate = false) => {
      setIsLoading(true);
      try {
        if (!forceCreate) {
          const canProceed = await checkConflict(scheduleData);
          if (!canProceed) {
            setIsLoading(false);
            return;
          }
        }

        await scheduleService.createSchedule(scheduleData);
        router.push("/user/ptjob/mainpage");
      } catch (error) {
        console.error("스케줄 생성 실패:", error);
        alert("스케줄 생성에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    },
    [checkConflict, router]
  );

  const handleCreateWork = useCallback(async () => {
    const employeeId = "user-123";
    const date = new Date(selectedDate);
    const dayOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][date.getDay()];

    const scheduleData: CreateScheduleRequest = {
      employeeId,
      workDate: selectedDate,
      startTime,
      endTime,
      dayOfWeek,
      isFlexible: false,
      workLocation: "스타벅스 해운대점",
      description: "추가근무",
    };

    await createSchedule(scheduleData);
  }, [selectedDate, startTime, endTime, createSchedule]);

  return (
    <div className="h-dvh flex flex-col bg-white w-full max-w-[430px] mx-auto relative">
      {/* Work Snap 헤더 */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <h1 className="text-main text-[26px] font-extrabold tracking-tight">
          Work Snap
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-bold text-gray5">SOO</span>
          <span className="bg-main2 text-gray1 text-xs font-semibold rounded-full px-2 py-1">
            알바님
          </span>
        </div>
      </header>

      {/* 서브 헤더 */}
      <div className="flex flex-col px-3 py-3 gap-5">
        <button
          onClick={() => router.push("/user/ptjob/mainpage")}
          className="mr-10 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="text-xl font-bold ml-2">추가근무</span>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-5 mt-4 flex-1 overflow-y-auto">
        {/* 근무지 선택 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">알바선택</h2>
          <div className="flex items-center justify-between border border-gray2 rounded-lg p-4">
            <span className="text-gray4">스타벅스 해운대점</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-gray3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">날짜</h2>
          <DatePicker
            value={parseDate(selectedDate)}
            onChange={(newDate: CalendarDate | null) => {
              if (newDate) {
                const formattedDate = `${newDate.year}-${String(
                  newDate.month
                ).padStart(2, "0")}-${String(newDate.day).padStart(2, "0")}`;
                setSelectedDate(formattedDate);
              }
            }}
            aria-label="날짜 선택"
            disableAnimation
            classNames={{
              base: "w-full",
              inputWrapper: "bg-gray1 rounded-lg border-none",
              input: "text-gray4 bg-transparent",
              popoverContent: "rounded-xl shadow-lg",
            }}
            showMonthAndYearPickers
            granularity="day"
          />
        </div>

        {/* 시간 선택 */}
        <div>
          <h2 className="text-lg font-bold mb-2">시간</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray1 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray4">시작</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-gray4 bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <div className="bg-gray1 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray4">종료</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-gray4 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 고정 */}
      <div className="p-4 w-full max-w-[430px] mx-auto bg-white z-10">
        <BaseButton
          buttonState={{
            label: isCheckingConflict ? "충돌 검사 중..." : "추가근무 만들기",
            variant: "primary",
            loading: isLoading || isCheckingConflict,
            disabled: isLoading || isCheckingConflict,
          }}
          onClick={handleCreateWork}
          className="w-full py-5 rounded-xl font-bold"
        />
      </div>

      {/* 충돌 알림 모달 */}
      {isVisible && <ConflictAlert conflicts={conflicts} {...alertProps} />}
    </div>
  );
}
