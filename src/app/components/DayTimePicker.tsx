"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";

interface TimeValue {
  period: "오전" | "오후";
  hour: number; // 1-12
  minute: number; // 0-59
}

export interface ScheduleItem {
  dayOfWeek: string; // SUNDAY | MONDAY ...
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
}

interface DayTimePickerProps {
  onChange?: (schedules: ScheduleItem[]) => void;
  className?: string;
  debug?: boolean; // 디버깅 로그 활성화
}

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"] as const;
const DAY_KEYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const DAY_NAMES_KR: Record<string, string> = {
  SUNDAY: "일요일",
  MONDAY: "월요일",
  TUESDAY: "화요일",
  WEDNESDAY: "수요일",
  THURSDAY: "목요일",
  FRIDAY: "금요일",
  SATURDAY: "토요일",
};

// Debug logging utility
const debugLog = (enabled: boolean, label: string, data?: unknown) => {
  if (enabled) {
    console.log(`[DayTimePicker] ${label}:`, data);
  }
};

export default function DayTimePicker({
  onChange,
  className,
  debug = false,
}: DayTimePickerProps) {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  const [startTime, setStartTime] = useState<TimeValue>({
    period: "오전",
    hour: 9,
    minute: 0,
  });

  const [endTime, setEndTime] = useState<TimeValue>({
    period: "오후",
    hour: 6,
    minute: 0,
  });

  const [addedSchedules, setAddedSchedules] = useState<ScheduleItem[]>([]);
  const [applySameTime, setApplySameTime] = useState<boolean>(false);
  const [selectedDayIndexes, setSelectedDayIndexes] = useState<Set<number>>(
    new Set([0])
  );

  // 12시간제 ↔ 24시간 분 단위 변환 유틸
  const timeToMinutes = (t: TimeValue): number => {
    const hour12 = t.hour % 12;
    const hour24 = t.period === "오전" ? hour12 : hour12 + 12;
    return hour24 * 60 + t.minute;
  };

  const minutesToTime = (minutesOfDay: number): TimeValue => {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, minutesOfDay));
    const hour24 = Math.floor(clamped / 60);
    const minute = clamped % 60;
    const period: TimeValue["period"] = hour24 < 12 ? "오전" : "오후";
    const hour12Raw = hour24 % 12;
    const hour12 = hour12Raw === 0 ? 12 : hour12Raw;
    return { period, hour: hour12, minute };
  };

  type ChangeSource = "period" | "hour" | "minute";

  const ensureEndAfterStart = (start: TimeValue, end: TimeValue): TimeValue => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    const minAllowed = Math.min(startMin + 1, 23 * 60 + 59);
    if (endMin < minAllowed) return minutesToTime(minAllowed);
    return end;
  };

  const ensureEndAfterStartWithPriority = (
    start: TimeValue,
    end: TimeValue,
    source: ChangeSource
  ): TimeValue => {
    const startMin = timeToMinutes(start);
    const minAllowed = Math.min(startMin + 1, 23 * 60 + 59);
    const endMin = timeToMinutes(end);
    if (endMin >= minAllowed) return end;

    const reqHour24 = Math.floor(minAllowed / 60);
    const reqMinute = minAllowed % 60;
    const endHour24 = Math.floor(endMin / 60);

    if (source === "minute") {
      if (endHour24 > reqHour24)
        return minutesToTime(endHour24 * 60 + end.minute);
      if (endHour24 === reqHour24 && end.minute >= reqMinute)
        return minutesToTime(endHour24 * 60 + end.minute);
      return minutesToTime(reqHour24 * 60 + reqMinute);
    }

    if (source === "hour") {
      const newHour24 = endHour24 < reqHour24 ? reqHour24 : endHour24;
      let newMinute = end.minute;
      if (newHour24 === reqHour24 && newMinute < reqMinute)
        newMinute = reqMinute;
      const candidate = minutesToTime(newHour24 * 60 + newMinute);
      if (timeToMinutes(candidate) >= minAllowed) return candidate;
      return minutesToTime(minAllowed);
    }

    // source === 'period'
    const reqIsAM = reqHour24 < 12;
    const endIsAM = end.period === "오전";
    if (endIsAM && !reqIsAM) {
      return minutesToTime(minAllowed);
    }
    const periodFloorHour24 = endIsAM ? 0 : 12;
    const newHour24 = Math.max(endHour24, Math.max(periodFloorHour24, reqHour24));
    let newMinute = end.minute;
    if (newHour24 === reqHour24 && newMinute < reqMinute) newMinute = reqMinute;
    const candidate = minutesToTime(newHour24 * 60 + newMinute);
    if (timeToMinutes(candidate) >= minAllowed) return candidate;
    return minutesToTime(minAllowed);
  };

  const handleStartChange = (t: TimeValue) => {
    debugLog(Boolean(debug), "handleStartChange", { t });
    setStartTime(t);
    setEndTime((prev) => {
      const adjusted = ensureEndAfterStart(t, prev);
      debugLog(debug, "ensureEndAfterStart", { prev, adjusted });
      return adjusted;
    });
  };

  const handleEndChange = (t: TimeValue, source: ChangeSource) => {
    const adjusted = ensureEndAfterStartWithPriority(startTime, t, source);
    debugLog(Boolean(debug), "handleEndChange", {
      source,
      t,
      adjusted,
      startTime,
    });
    setEndTime(adjusted);
  };

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const formatToHHMM = (t: TimeValue): string => {
    const hour12 = t.hour % 12;
    const hour24 = t.period === "오전" ? hour12 : hour12 + 12;
    const hh = hour24.toString().padStart(2, "0");
    const mm = t.minute.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const addWorkTime = () => {
    const start = formatToHHMM(startTime);
    const end = formatToHHMM(endTime);

    if (applySameTime) {
      const indexes =
        selectedDayIndexes.size > 0
          ? Array.from(selectedDayIndexes)
          : Array.from({ length: DAY_KEYS.length }, (_, i) => i);

      const schedulesForSelected: ScheduleItem[] = indexes.map((i) => ({
        dayOfWeek: DAY_KEYS[i],
        startTime: start,
        endTime: end,
      }));
      setAddedSchedules((prev) => [...prev, ...schedulesForSelected]);
      return;
    }

    const schedule: ScheduleItem = {
      dayOfWeek: DAY_KEYS[activeDayIndex],
      startTime: start,
      endTime: end,
    };
    setAddedSchedules((prev) => [...prev, schedule]);
  };

  const removeSchedule = (indexToRemove: number) => {
    setAddedSchedules((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  useEffect(() => {
    if (onChange) onChange(addedSchedules);
  }, [addedSchedules, onChange]);

  // 동일시간 적용 토글 상태가 변경되면 선택 초기화 규칙 적용
  useEffect(() => {
    if (applySameTime) {
      // 토글 ON 시 현재 활성 요일을 초기 선택으로 설정
      setSelectedDayIndexes(new Set([activeDayIndex]));
    }
  }, [applySameTime]);

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div className="rounded-xl border border-gray2 bg-white overflow-hidden">
        {/* 헤더 영역: 제목 + 동일시간 적용 토글 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray2">
          <span className="text-main2 font-semibold">업무 시간</span>
          <label className="flex items-center gap-2 text-gray4">
            <span className="text-sm">동일시간 적용</span>
            {/* radix onCheckedChange 타입은 boolean | CheckedState 이므로 강제 boolean 변환 */}
            <Switch
              checked={applySameTime}
              onCheckedChange={(v: boolean) => setApplySameTime(Boolean(v))}
              aria-label="동일시간 적용 토글"
            />
          </label>
        </div>
        {/* 요일 탭 */}
        <div className="grid grid-cols-7 bg-gray1 text-main2 relative z-10">
          {DAYS_KR.map((d, idx) => (
            <button
              key={d}
              type="button"
              className={`py-3 text-sm ${
                (applySameTime && selectedDayIndexes.has(idx)) ||
                (!applySameTime && idx === activeDayIndex)
                  ? "text-main font-semibold border-b-2 border-main"
                  : "text-gray4"
              }`}
              onClick={() => {
                if (applySameTime) {
                  setSelectedDayIndexes((prev) => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  });
                } else {
                  setActiveDayIndex(idx);
                }
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div className="px-4 pt-4 pb-3 relative isolate overflow-hidden">
          {/* 좌/우 섹션: 시작시간 / 종료시간 */}
          <div className="w-full flex items-center justify-center gap-2 px-4 overflow-hidden">
            <TimeSection
              time={startTime}
              onChange={(t) => handleStartChange(t)}
              hours={hours}
              minutes={minutes}
              ariaLabelPrefix="시작"
            />
            <div className="text-gray3 select-none px-2">-</div>
            <TimeSection
              time={endTime}
              onChange={(t, src) => handleEndChange(t, src)}
              hours={hours}
              minutes={minutes}
              ariaLabelPrefix="종료"
            />
          </div>

          {/* 추가 버튼 */}
          <button
            type="button"
            className="mt-1 w-full h-12 rounded-[12px] bg-main text-gray1 font-semibold"
            onClick={() => {
              debugLog(Boolean(debug), "addWorkTime", {
                day: DAY_KEYS[activeDayIndex],
                startTime,
                endTime,
              });
              addWorkTime();
            }}
          >
            업무 시간 추가
          </button>

          {/* 추가된 업무 시간 목록 */}
          <div className="mt-4">
            {addedSchedules.length === 0 ? (
              <p className="flex justify-center text-gray-500">
                추가된 업무 시간이 없습니다.
              </p>
            ) : (
              <ul>
                {addedSchedules.map((s, idx) => (
                  <li
                    key={`${s.dayOfWeek}-${s.startTime}-${s.endTime}-${idx}`}
                    className="border rounded-xl p-3 mb-2 flex justify-between items-center bg-gray2 text-sm"
                  >
                    <span className="font-semibold">
                      <span className="mr-3">
                        {DAY_NAMES_KR[s.dayOfWeek] ?? s.dayOfWeek}
                      </span>
                      {formatToKorean(s.startTime)} -{" "}
                      {formatToKorean(s.endTime)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSchedule(idx)}
                      className="text-main font-semibold ml-4"
                      aria-label="스케줄 삭제"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSection({
  time,
  onChange,
  hours,
  minutes,
  ariaLabelPrefix,
}: {
  time: TimeValue;
  onChange: (t: TimeValue, source: "period" | "hour" | "minute") => void;
  hours: number[];
  minutes: number[];
  ariaLabelPrefix: string;
}) {
  const update = (
    partial: Partial<TimeValue>,
    source: "period" | "hour" | "minute"
  ) => onChange({ ...time, ...partial }, source);

  return (
    <div className="flex items-center justify-between gap-2 w-full min-w-0">
      <ScrollWheel
        ariaLabel={`${ariaLabelPrefix} 오전/오후 선택`}
        values={["오전", "오후"]}
        valueIndex={time.period === "오전" ? 0 : 1}
        onChange={(idx) =>
          update({ period: idx === 0 ? "오전" : "오후" }, "period")
        }
        className="w-14"
        itemHeight={34}
        visibleCount={3}
        syncDep={time.period}
      />

      <ScrollWheel
        ariaLabel={`${ariaLabelPrefix} 시간 선택`}
        values={hours.map((h) => String(h))}
        valueIndex={time.hour - 1}
        onChange={(idx) => update({ hour: idx + 1 }, "hour")}
        className="w-12"
        itemHeight={34}
        visibleCount={3}
        syncDep={time.hour}
      />

      <div className="px-1 text-gray3">:</div>

      <ScrollWheel
        ariaLabel={`${ariaLabelPrefix} 분 선택`}
        values={minutes.map((m) => m.toString().padStart(2, "0"))}
        valueIndex={time.minute}
        onChange={(idx) => update({ minute: idx }, "minute")}
        className="w-14"
        itemHeight={34}
        visibleCount={3}
        syncDep={time.minute}
      />
    </div>
  );
}

function ScrollWheel({
  values,
  valueIndex,
  onChange,
  itemHeight = 34,
  visibleCount = 3,
  ariaLabel,
  className,
  syncDep,
  debug,
}: {
  values: string[];
  valueIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  visibleCount?: number;
  ariaLabel?: string;
  className?: string;
  syncDep?: unknown;
  debug?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const programmaticTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const programmaticRef = useRef<boolean>(false);
  const isScrollingRef = useRef<boolean>(false);
  const lastUserScrollTime = useRef<number>(0);
  const lastValueIndex = useRef<number>(valueIndex);
  const pendingScrolls = useRef<number>(0);
  const centerIndex = Math.floor(visibleCount / 2);
  const height = itemHeight * visibleCount;

  // 외부 값(valueIndex) 변화에 따른 스크롤 동기화 (프로그램적 스크롤)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // valueIndex가 실제로 변경되었는지 확인
    if (lastValueIndex.current === valueIndex) return;
    lastValueIndex.current = valueIndex;

    // 연속적인 스크롤 카운트 증가
    pendingScrolls.current++;
    const currentScrollId = pendingScrolls.current;

    // 사용자 스크롤 타이머는 유지하되, 프로그래밍적 스크롤만 취소
    if (programmaticTimeoutRef.current) {
      clearTimeout(programmaticTimeoutRef.current);
    }

    // 사용자가 최근에 스크롤했다면 프로그래밍적 스크롤을 지연시킴
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTime.current;
    const delay = timeSinceLastUserScroll < 200 ? 150 : 0;

    debugLog(Boolean(debug), "valueIndex-change", {
      valueIndex,
      currentScrollId,
      pendingScrolls: pendingScrolls.current,
      delay,
      timeSinceLastUserScroll,
    });

    programmaticTimeoutRef.current = setTimeout(() => {
      // 최신 스크롤 요청인지 확인
      if (currentScrollId !== pendingScrolls.current) {
        debugLog(Boolean(debug), "skip-outdated-scroll", {
          currentScrollId,
          latest: pendingScrolls.current,
        });
        return;
      }

      programmaticRef.current = true;
      isScrollingRef.current = true;
      const targetTop = valueIndex * itemHeight;

      debugLog(Boolean(debug), "programmatic-scroll-execute", {
        targetTop,
        valueIndex,
        currentScrollTop: el.scrollTop,
        scrollId: currentScrollId,
      });

      // 즉시 스크롤 실행 (연속 변경에서 더 확실함)
      el.scrollTo({ top: targetTop, behavior: "smooth" });

      // 프로그래밍적 스크롤 완료 후 플래그 해제
      programmaticTimeoutRef.current = setTimeout(() => {
        programmaticRef.current = false;
        isScrollingRef.current = false;
        debugLog(Boolean(debug), "programmatic-scroll-complete", {
          scrollId: currentScrollId,
        });
      }, 350);
    }, delay);

    return () => {
      if (programmaticTimeoutRef.current)
        clearTimeout(programmaticTimeoutRef.current);
    };
  }, [valueIndex, itemHeight, syncDep]);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (programmaticTimeoutRef.current)
        clearTimeout(programmaticTimeoutRef.current);
    };
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    // 프로그래밍적 스크롤 중이면 무시
    if (programmaticRef.current) return;

    // 사용자 스크롤 시간 기록
    lastUserScrollTime.current = Date.now();
    isScrollingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // 다시 한 번 프로그래밍적 스크롤 체크
      if (programmaticRef.current) return;

      const index = Math.round(el.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      const targetTop = clamped * itemHeight;

      debugLog(Boolean(debug), "user-scroll-stop", {
        scrollTop: el.scrollTop,
        index,
        clamped,
        targetTop,
      });

      // 스냅 동작
      el.scrollTo({ top: targetTop, behavior: "smooth" });

      // 값이 변경되었을 때만 onChange 호출
      if (clamped !== valueIndex) {
        onChange(clamped);
      }

      // 스크롤 완료 후 플래그 해제
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    }, 100); // 디바운스 시간을 약간 늘림
  };

  return (
    <div className={`relative overflow-hidden min-w-0 ${className ?? ""}`}>
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 border-y border-gray2"
        style={{ height: itemHeight }}
      />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-5 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-5 bg-gradient-to-t from-white to-transparent" />

      <div
        ref={containerRef}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth snap-y snap-mandatory text-center"
        style={{ height }}
      >
        <div style={{ height: centerIndex * itemHeight }} />
        {values.map((v, i) => (
          <div
            key={`${v}-${i}`}
            role="option"
            aria-selected={i === valueIndex}
            className={`snap-center flex items-center justify-center text-main2 whitespace-nowrap overflow-hidden ${
              i === valueIndex
                ? "font-semibold text-[18px]"
                : "text-gray4 text-[15px]"
            }`}
            style={{ height: itemHeight }}
          >
            {v}
          </div>
        ))}
        <div style={{ height: centerIndex * itemHeight }} />
      </div>
    </div>
  );
}

function formatToKorean(time: string) {
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour < 12 ? "오전" : "오후";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  if (minute === "00") return `${ampm} ${hour}시`;
  return `${ampm} ${hour}시 ${minute}분`;
}
