"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TimePicker from "@/app/components/TimePicker";
import { createAdditionalWork } from "@/api/attendanceApi";
import { getMyWorkplacesSummary, WorkplaceSummary } from "@/lib/api/getMyWP";
import { BaseButton } from "@/app/components/BaseButton";
import PageHeader from "./components/PageHeader";
import WorkplaceDropdown from "./components/WorkplaceDropdown";
import DateSelector from "./components/DateSelector";

export default function AddAttendanceWorkPage() {
  const router = useRouter();
  const [workplaces, setWorkplaces] = useState<WorkplaceSummary[]>([]);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("18:00");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkplaces = async () => {
      try {
        const res = await getMyWorkplacesSummary();
        if (res.success && Array.isArray(res.data)) {
          setWorkplaces(res.data);
          if (res.data.length > 0) {
            setSelectedWorkplaceId(res.data[0].id);
          }
        }
      } catch (e) {
        console.error("사업장 목록 조회 실패", e);
      }
    };
    fetchWorkplaces();
  }, []);

  const handleTimeChange = (t: { startTime: string; endTime: string }) => {
    setStartTime(t.startTime);
    setEndTime(t.endTime);
  };

  const handleCreate = async () => {
    if (!selectedWorkplaceId) {
      alert("사업장을 선택해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      await createAdditionalWork({
        workplaceId: selectedWorkplaceId,
        workDate: selectedDate,
        startTime,
        endTime,
      });
      router.push("/attendance");
    } catch (e) {
      console.error(e);
      alert(
        (e as Error)?.message ||
          "추가 근무 생성에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between bg-white max-w-[430px] w-full h-full mx-auto relative pb-4 px-4">
      <PageHeader title="추가근무" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-5">
          <div>
            <div className="text-[15px] font-bold mb-2">알바선택</div>
            <WorkplaceDropdown
              workplaces={workplaces}
              selectedWorkplaceId={selectedWorkplaceId}
              onChange={setSelectedWorkplaceId}
            />
          </div>

          <DateSelector date={selectedDate} onChange={setSelectedDate} />

          <div>
            <div className="text-[15px] font-bold mb-2">시간</div>
            <TimePicker onChange={handleTimeChange} />
          </div>
        </div>
      </div>

      <div className="w-full">
        <BaseButton
          buttonState={{
            label: isLoading ? "생성 중..." : "추가근무 만들기",
            variant: "primary",
            loading: isLoading,
            disabled: isLoading,
          }}
          onClick={handleCreate}
          className="w-full py-5 rounded-xl font-bold max-w-[430px] mx-auto"
          disableHover
        />
      </div>
    </div>
  );
}
