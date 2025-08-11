"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function EmployeeOnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("workplaceId"));

  const [inviteCode, setInviteCode] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");

  // 요일별 스케줄 상태
  const [schedules, setSchedules] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day,
      enabled: false,
      startTime: "09:00",
      endTime: "18:00",
    }))
  );

  //   const onboardMutation = useOnboardEmployee(workplaceId);

  const handleToggleDay = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules[index].enabled = !newSchedules[index].enabled;
    setSchedules(newSchedules);
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  //   const handleSubmit = () => {
  //     const selectedSchedules = schedules
  //       .filter((s) => s.enabled)
  //       .map(({ dayOfWeek, startTime, endTime }) => ({
  //         dayOfWeek,
  //         startTime,
  //         endTime,
  //       }));

  //     onboardMutation.mutate(
  //       {
  //         inviteCode,
  //         schedules: selectedSchedules,
  //       },
  //       {
  //         onSuccess: (res) => {
  //           alert(res.message);
  //           router.push(`/workplace/${workplaceId}`);
  //         },
  //       }
  //     );
  //   };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">직원 온보딩</h2>

      {/* 요일별 스케줄 */}
      <div>
        <h3 className="font-semibold">요일별 스케줄</h3>
        {schedules.map((schedule, idx) => (
          <div
            key={schedule.dayOfWeek}
            className="flex items-center space-x-2 py-2 border-b"
          >
            <Switch
              checked={schedule.enabled}
              onCheckedChange={() => handleToggleDay(idx)}
            />
            <span className="w-28">{schedule.dayOfWeek}</span>
            <input
              type="time"
              value={schedule.startTime}
              disabled={!schedule.enabled}
              onChange={(e) =>
                handleTimeChange(idx, "startTime", e.target.value)
              }
            />
            <span>~</span>
            <input
              type="time"
              value={schedule.endTime}
              disabled={!schedule.enabled}
              onChange={(e) => handleTimeChange(idx, "endTime", e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button>
        등록하기기
        {/* {onboardMutation.isLoading ? "등록 중..." : "등록하기"} */}
      </Button>
    </div>
  );
}
