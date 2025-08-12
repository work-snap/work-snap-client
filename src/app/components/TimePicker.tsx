"use client";

import { useMemo, useState, useEffect, useRef } from "react";

interface TimeValue {
  period: "오전" | "오후";
  hour: number; // 1-12
  minute: number; // 0-59
}

interface TimePickerProps {
  onChange?: (times: { startTime: string; endTime: string }) => void;
  className?: string;
  debug?: boolean;
}

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
  source: "period" | "hour" | "minute"
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
    let newHour24 = endHour24 < reqHour24 ? reqHour24 : endHour24;
    let newMinute = end.minute;
    if (newHour24 === reqHour24 && newMinute < reqMinute) newMinute = reqMinute;
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
  let newHour24 = Math.max(endHour24, Math.max(periodFloorHour24, reqHour24));
  let newMinute = end.minute;
  if (newHour24 === reqHour24 && newMinute < reqMinute) newMinute = reqMinute;
  const candidate = minutesToTime(newHour24 * 60 + newMinute);
  if (timeToMinutes(candidate) >= minAllowed) return candidate;
  return minutesToTime(minAllowed);
};

const formatToHHMM = (t: TimeValue): string => {
  const hour12 = t.hour % 12;
  const hour24 = t.period === "오전" ? hour12 : hour12 + 12;
  const hh = hour24.toString().padStart(2, "0");
  const mm = t.minute.toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function TimePicker({
  onChange,
  className,
  debug = false,
}: TimePickerProps) {
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

  const handleStartChange = (t: TimeValue) => {
    if (debug) console.log("[TimePicker] handleStartChange", t);
    setStartTime(t);
    setEndTime((prev) => {
      const adjusted = ensureEndAfterStart(t, prev);
      if (debug) console.log("[TimePicker] adjusted endTime", adjusted);
      return adjusted;
    });
  };

  const handleEndChange = (
    t: TimeValue,
    source: "period" | "hour" | "minute"
  ) => {
    const adjusted = ensureEndAfterStartWithPriority(startTime, t, source);
    if (debug) console.log("[TimePicker] handleEndChange", { t, adjusted });
    setEndTime(adjusted);
  };

  useEffect(() => {
    if (onChange) {
      onChange({
        startTime: formatToHHMM(startTime),
        endTime: formatToHHMM(endTime),
      });
    }
  }, [startTime, endTime, onChange]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div className="rounded-xl border border-gray2 bg-white p-4">
        <div className="flex items-center justify-center gap-4">
          <TimeSection
            time={startTime}
            onChange={(t, src) => handleStartChange(t)}
            hours={hours}
            minutes={minutes}
            ariaLabelPrefix="시작"
          />
          <div className="text-gray3 select-none text-xl">-</div>
          <TimeSection
            time={endTime}
            onChange={handleEndChange}
            hours={hours}
            minutes={minutes}
            ariaLabelPrefix="종료"
          />
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
    <div className="flex items-center justify-between gap-2 min-w-0">
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

    if (lastValueIndex.current === valueIndex) return;
    lastValueIndex.current = valueIndex;

    pendingScrolls.current++;
    const currentScrollId = pendingScrolls.current;

    if (programmaticTimeoutRef.current) {
      clearTimeout(programmaticTimeoutRef.current);
    }

    const timeSinceLastUserScroll = Date.now() - lastUserScrollTime.current;
    const delay = timeSinceLastUserScroll < 200 ? 150 : 0;

    programmaticTimeoutRef.current = setTimeout(() => {
      if (currentScrollId !== pendingScrolls.current) return;

      programmaticRef.current = true;
      isScrollingRef.current = true;
      const targetTop = valueIndex * itemHeight;

      el.scrollTo({ top: targetTop, behavior: "smooth" });

      programmaticTimeoutRef.current = setTimeout(() => {
        programmaticRef.current = false;
        isScrollingRef.current = false;
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

    if (programmaticRef.current) return;

    lastUserScrollTime.current = Date.now();
    isScrollingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (programmaticRef.current) return;

      const index = Math.round(el.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      const targetTop = clamped * itemHeight;

      el.scrollTo({ top: targetTop, behavior: "smooth" });

      if (clamped !== valueIndex) {
        onChange(clamped);
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    }, 100);
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
