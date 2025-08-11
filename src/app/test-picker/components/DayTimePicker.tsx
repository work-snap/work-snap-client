"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TimeValue {
  period: "오전" | "오후";
  hour: number; // 1-12
  minute: number; // 0-59
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export default function DayTimePicker() {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  const [startTime, setStartTime] = useState<TimeValue>({
    period: "오전",
    hour: 6,
    minute: 30,
  });

  const [endTime, setEndTime] = useState<TimeValue>({
    period: "오전",
    hour: 6,
    minute: 30,
  });

  /**
   * 12시간제 ↔ 24시간 분 단위 변환 유틸
   * - 12시는 0시로 취급(12 AM → 0, 12 PM → 12)
   */
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

  /**
   * 일반 보정: 종료가 시작 이전이면 시작+1분으로 보정(가장 단순)
   */
  const ensureEndAfterStart = (start: TimeValue, end: TimeValue): TimeValue => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    const minAllowed = Math.min(startMin + 1, 23 * 60 + 59);
    if (endMin < minAllowed) return minutesToTime(minAllowed);
    return end;
  };

  /**
   * 우선순위 보정: 사용자가 마지막으로 바꾼 필드(source)를 최대한 존중하여 보정
   * - minute 변경: 같은 시 안에서 분을 우선 맞추고, 부족하면 시를 올림
   * - hour 변경: 시를 우선 올리고, 부족하면 분을 올림
   * - period 변경: 선택한 오전/오후를 우선 유지한 채 시/분을 보정. 동일 기간에서 불가능하면 최소 보정(minAllowed)
   */
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
      // 같은 시에서 분을 올려보고, 안 되면 필요한 시/분으로 세팅
      if (endHour24 > reqHour24)
        return minutesToTime(endHour24 * 60 + end.minute);
      if (endHour24 === reqHour24 && end.minute >= reqMinute)
        return minutesToTime(endHour24 * 60 + end.minute);
      return minutesToTime(reqHour24 * 60 + reqMinute);
    }

    if (source === "hour") {
      let newHour24 = endHour24 < reqHour24 ? reqHour24 : endHour24;
      // 시를 올렸다면 분은 가능한 한 사용자 입력 유지, 부족하면 reqMinute
      let newMinute = end.minute;
      if (newHour24 === reqHour24 && newMinute < reqMinute)
        newMinute = reqMinute;
      const candidate = minutesToTime(newHour24 * 60 + newMinute);
      if (timeToMinutes(candidate) >= minAllowed) return candidate;
      return minutesToTime(minAllowed);
    }

    // source === 'period' (사용자가 고른 오전/오후를 최대한 유지)
    const reqIsAM = reqHour24 < 12; // minAllowed의 기간
    const endIsAM = end.period === "오전"; // 사용자가 선택한 기간

    if (endIsAM && !reqIsAM) {
      // 사용자는 오전을 선택했지만 minAllowed가 오후라면, 같은 날 내에서는 불가
      return minutesToTime(minAllowed);
    }

    // 가능한 경우: 선택한 기간 내에서 minAllowed 이상이 되도록 시/분 보정
    // 기간 경계 하한: AM → 0시, PM → 12시
    const periodFloorHour24 = endIsAM ? 0 : 12;
    let newHour24 = Math.max(endHour24, Math.max(periodFloorHour24, reqHour24));
    let newMinute = end.minute;
    if (newHour24 === reqHour24 && newMinute < reqMinute) newMinute = reqMinute;

    const candidate = minutesToTime(newHour24 * 60 + newMinute);
    if (timeToMinutes(candidate) >= minAllowed) return candidate;

    return minutesToTime(minAllowed);
  };

  const handleStartChange = (t: TimeValue, _source?: ChangeSource) => {
    setStartTime(t);
    setEndTime((prev) => ensureEndAfterStart(t, prev));
  };

  const handleEndChange = (t: TimeValue, source: ChangeSource) => {
    setEndTime(ensureEndAfterStartWithPriority(startTime, t, source));
  };

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-gray2 bg-white overflow-hidden">
        {/* 요일 탭 */}
        <div className="grid grid-cols-7 bg-gray1 text-main2 relative z-10">
          {DAYS.map((d, idx) => (
            <button
              key={d}
              type="button"
              className={`py-3 text-sm ${
                idx === activeDayIndex
                  ? "text-main font-semibold border-b-2 border-main"
                  : "text-gray4"
              }`}
              onClick={() => setActiveDayIndex(idx)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div className="px-4 pt-4 pb-3 relative isolate overflow-hidden">
          {/* 좌/우 섹션: 시작시간 / 종료시간 (중앙 '-' 구분자 포함) */}
          <div className="w-full flex items-center justify-center gap-2 px-4 overflow-hidden">
            <TimeSection
              time={startTime}
              onChange={handleStartChange}
              hours={hours}
              minutes={minutes}
              ariaLabelPrefix="시작"
            />
            <div className="text-gray3 select-none px-2">-</div>
            <TimeSection
              time={endTime}
              onChange={handleEndChange}
              hours={hours}
              minutes={minutes}
              ariaLabelPrefix="종료"
            />
          </div>

          {/* 추가 버튼 */}
          <button
            type="button"
            className="mt-1 w-full h-12 rounded-[12px] bg-main text-white font-semibold"
            onClick={() => {
              alert(
                `${DAYS[activeDayIndex]} ${formatTime(
                  startTime
                )} - ${formatTime(endTime)}`
              );
            }}
          >
            업무 시간 추가
          </button>
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
}: {
  values: string[];
  valueIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  visibleCount?: number;
  ariaLabel?: string;
  className?: string;
  syncDep?: unknown;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const programmaticRef = useRef<boolean>(false);
  const centerIndex = Math.floor(visibleCount / 2);
  const height = itemHeight * visibleCount;

  // 외부 값(valueIndex) 변화에 따른 스크롤 동기화 (프로그램적 스크롤)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // 사용자 스크롤 디바운스 타이머 제거 및 프로그램적 스크롤 플래그 설정
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    programmaticRef.current = true;
    const targetTop = valueIndex * itemHeight;
    el.scrollTo({ top: targetTop, behavior: "smooth" });
    // 잠시 후 프로그램적 스크롤 플래그 해제
    const off = setTimeout(() => {
      programmaticRef.current = false;
    }, 160);
    return () => clearTimeout(off);
  }, [valueIndex, itemHeight, syncDep]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    // 프로그램적 스크롤 중에는 선택 변경 로직을 무시
    if (programmaticRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const index = Math.round(el.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      const targetTop = clamped * itemHeight;
      el.scrollTo({ top: targetTop, behavior: "smooth" });
      if (clamped !== valueIndex) onChange(clamped);
    }, 80);
  };

  return (
    <div className={`relative overflow-hidden min-w-0 ${className ?? ""}`}>
      {/* 선택 라인 */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 border-y border-gray2"
        style={{ height: itemHeight }}
      />
      {/* 상/하 그라데이션 (이미지 수준 높이) */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-5 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-5 bg-gradient-to-t from-white to-transparent" />

      <div
        ref={containerRef}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth snap-y snap-mandatory text-center"
        style={{ height }}
      >
        {/* 위 여백 */}
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
        {/* 아래 여백 */}
        <div style={{ height: centerIndex * itemHeight }} />
      </div>
    </div>
  );
}

function formatTime(t: TimeValue) {
  const hh = t.hour.toString();
  const mm = t.minute.toString().padStart(2, "0");
  return `${t.period} ${hh} : ${mm}`;
}
