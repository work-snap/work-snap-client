"use client";

import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { useGetDailyTimeLine } from "@/lib/queries/getDailyTimeLine";

interface TimelineDisplayProps {
  workplaceId: number | null;
  date: string;
}

// 🎨 타임라인 스켈레톤
export function TimelineSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2 border-b pb-2">
          <div className="bg-gray-200 h-10 rounded animate-pulse" />
          <div className="space-y-2 p-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TimelineDisplay({
  workplaceId,
  date,
}: TimelineDisplayProps) {
  const { data: timelineData, isLoading } = useGetDailyTimeLine(
    workplaceId,
    date
  );

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  return (
    <div className="mt-6 space-y-4">
      {timelineData?.data.employees?.length ? (
        timelineData.data.employees.map((emp) => (
          <div key={emp.userId} className="flex flex-col gap-2 border-b pb-2">
            <div className="bg-gray2 p-2">
              <span className="font-medium">{emp.employeeName}</span>
            </div>
            <div className="mt-1 text-md text-gray-600 space-y-1 p-1">
              {emp.items.map((item, idx) => {
                const isLate = item.badges?.includes("지각");
                const isEarlyLeave = item.badges?.includes("조퇴");
                const isEarlyCheckIn = item.badges?.includes("조기출근");

                const getActionKorean = (action: string) => {
                  switch (action) {
                    case "CHECK_IN":
                      return "출근";
                    case "CHECK_OUT":
                      return "퇴근";
                    case "OVERTIME":
                      return "연장근무";
                    case "ABSENT":
                      return "무단결근";
                    default:
                      return action;
                  }
                };

                const actionColor =
                  item.action === "CHECK_IN"
                    ? "text-blue-500"
                    : item.action === "CHECK_OUT"
                    ? "text-red-500"
                    : item.action === "ABSENT"
                    ? "text-black"
                    : "text-gray-600";

                return (
                  <div key={idx} className="flex justify-between">
                    {isLate ? (
                      <>
                        <span className="text-gray4 font-medium">
                          {formatTime(item.time)}
                          <span className="text-white text-md ml-1 border border-gray4 bg-gray4 px-2 py-0.5 rounded-md">
                            지각
                          </span>
                        </span>
                        <span className="text-blue-500 font-medium">출근</span>
                      </>
                    ) : isEarlyLeave ? (
                      <>
                        <span className="text-yellow-500 font-medium">
                          {formatTime(item.time)}
                        </span>
                        <span className="text-yellow-500 font-medium">
                          조퇴
                        </span>
                      </>
                    ) : isEarlyCheckIn ? (
                      <>
                        <span className={`font-medium ${actionColor}`}>
                          {formatTime(item.time)}
                        </span>
                        <span className="text-blue-500 font-medium">
                          조기출근
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`font-medium ${actionColor}`}>
                          {formatTime(item.time)}
                        </span>
                        <span className={`font-medium ${actionColor}`}>
                          {getActionKorean(item.action)}
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
  );
}

function formatTime(timeString: string) {
  if (!timeString) return "";

  const withSeconds = timeString.match(/^\d{2}:\d{2}:\d{2}/)?.[0];
  if (withSeconds) {
    return format(parse(withSeconds, "HH:mm:ss", new Date()), "a h:mm", {
      locale: ko,
    });
  }

  const withMinutes = timeString.match(/^\d{2}:\d{2}/)?.[0];
  if (withMinutes) {
    return format(parse(withMinutes, "HH:mm", new Date()), "a h:mm", {
      locale: ko,
    });
  }

  return timeString;
}
