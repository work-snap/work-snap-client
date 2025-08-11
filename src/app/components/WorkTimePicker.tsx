"use client";

import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

const days = ["일", "월", "화", "수", "목", "금", "토"];
const dayKeys = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

interface Props {
  onChange?: (
    schedules: { dayOfWeek: string; startTime: string; endTime: string }[]
  ) => void;
}

export default function WorkTimePicker({ onChange }: Props) {
  const [sameTime, setSameTime] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [times, setTimes] = useState<{ start: string; end: string }[]>(
    Array.from({ length: 7 }, () => ({ start: "09:00", end: "18:00" }))
  );

  // 추가된 업무 시간 목록 상태
  const [addedSchedules, setAddedSchedules] = useState<
    { dayOfWeek: string; startTime: string; endTime: string }[]
  >([]);

  const toggleDay = (index: number) => {
    if (sameTime) {
      setSelectedDays((prev) =>
        prev.includes(index)
          ? prev.filter((d) => d !== index)
          : [...prev, index]
      );
    } else {
      setSelectedDays([index]);
    }
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (sameTime) {
      setTimes((prev) =>
        prev.map((time, idx) =>
          selectedDays.includes(idx) ? { ...time, [type]: value } : time
        )
      );
    } else {
      const day = selectedDays[0];
      setTimes((prev) =>
        prev.map((time, idx) =>
          idx === day ? { ...time, [type]: value } : time
        )
      );
    }
  };

  // 업무 시간 추가 버튼 클릭 핸들러
  const addWorkTime = () => {
    if (selectedDays.length === 0) return; // 선택된 요일 없으면 추가 안 함

    const newSchedules = selectedDays.map((dayIdx) => ({
      dayOfWeek: dayKeys[dayIdx],
      startTime: times[dayIdx].start,
      endTime: times[dayIdx].end,
    }));

    setAddedSchedules((prev) => [...prev, ...newSchedules]);
  };
  //업무 시간 삭제 버튼 클릭 핸들러
  const removeSchedule = (indexToRemove: number) => {
    setAddedSchedules((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };
  const dayNamesKR: Record<string, string> = {
    SUNDAY: "일요일",
    MONDAY: "월요일",
    TUESDAY: "화요일",
    WEDNESDAY: "수요일",
    THURSDAY: "목요일",
    FRIDAY: "금요일",
    SATURDAY: "토요일",
  };

  useEffect(() => {
    if (onChange) {
      onChange(addedSchedules);
    }
  }, [addedSchedules, onChange]);

  useEffect(() => {
    if (!sameTime) {
      setSelectedDays([]); // 모두 해제
    }
  }, [sameTime]);

  return (
    <div className="flex flex-col justify-center rounded-lg border p-4 ">
      <div className="flex justify-between mb-4">
        <span className="font-semibold">업무 시간</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className={sameTime ? "text-main font-semibold" : "text-gray4"}>
            동일시간 적용
          </span>
          <Switch
            id="switchId"
            checked={sameTime}
            onCheckedChange={setSameTime}
          />
        </label>
      </div>

      <div className="flex justify-between p-2 gap-2 mb-4">
        {days.map((day, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => toggleDay(idx)}
            className={`flex items-center justify-center w-8 h-8   ${
              selectedDays.includes(idx)
                ? "bg-white border-sub3 text-sub3 border rounded-full "
                : "border-gray-300 text-gray-400"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center gap-2">
        <input
          type="time"
          value={times[selectedDays[0] ?? 0].start} // 선택된 요일 없으면 0번째 요일 기준
          onChange={(e) => handleTimeChange("start", e.target.value)}
          className="border rounded px-2 py-1"
        />
        <span>-</span>
        <input
          type="time"
          value={times[selectedDays[0] ?? 0].end}
          onChange={(e) => handleTimeChange("end", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <button
        type="button"
        onClick={addWorkTime}
        className="p-3 flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl  text-lg mt-4"
      >
        업무 시간 추가
      </button>

      {/* 추가된 업무 시간 목록 표시 */}
      <div className="mt-6">
        {addedSchedules.length === 0 ? (
          <p className="flex justify-center text-gray-500">
            추가된 업무 시간이 없습니다.
          </p>
        ) : (
          <ul>
            {addedSchedules.map((schedule, idx) => (
              <li
                key={idx}
                className="border rounded-xl p-3 mb-2 flex justify-between items-center bg-gray2 text-md"
              >
                <span className="font-semibold">
                  <span className="mr-3">
                    {dayNamesKR[schedule.dayOfWeek] ?? schedule.dayOfWeek}
                  </span>
                  {formatTimeToKorean(schedule.startTime)} -{" "}
                  {formatTimeToKorean(schedule.endTime)}
                </span>

                <button
                  type="button"
                  onClick={() => removeSchedule(idx)}
                  className="text-main hover:text-red-700 font-semibold ml-4"
                >
                  {/* 휴지통 아이콘 */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6 text-main"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function formatTimeToKorean(time: string) {
  // time 형식: "HH:mm"
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour < 12 ? "오전" : "오후";
  if (hour === 0) hour = 12; // 0시는 오전 12시
  else if (hour > 12) hour -= 12;

  if (minute === "00") {
    return `${ampm} ${hour}시`;
  } else {
    return `${ampm} ${hour}시 ${minute}분`;
  }
}
