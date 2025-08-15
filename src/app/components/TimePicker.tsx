"use client";

import { useMemo, useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

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

  // onChange 콜백을 ref로 저장하여 안정성 확보
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;



  const handleStartChange = (t: TimeValue) => {
    if (debug) console.log("[TimePicker] handleStartChange", t);
    setStartTime(t);
  };

  const handleEndChange = (t: TimeValue) => {
    if (debug) console.log("[TimePicker] handleEndChange", t);
    setEndTime(t);
  };

  useEffect(() => {
    if (onChangeRef.current) {
      const startTimeFormatted = formatToHHMM(startTime);
      const endTimeFormatted = formatToHHMM(endTime);
      
      if (debug) {
        console.log("[TimePicker] useEffect - calling onChange:", {
          startTime: startTimeFormatted,
          endTime: endTimeFormatted,
          startTimeRaw: startTime,
          endTimeRaw: endTime
        });
      }
      
      onChangeRef.current({
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
      });
    }
  }, [startTime, endTime, debug]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div className="rounded-xl border border-gray2 bg-white p-4">
        <div className="flex items-center justify-center gap-4">
          <TimeSection
            time={startTime}
            onChange={handleStartChange}
            hours={hours}
            minutes={minutes}
            ariaLabelPrefix="시작"
            debug={debug}
          />
          <div className="text-gray3 select-none text-xl">-</div>
          <TimeSection
            time={endTime}
            onChange={handleEndChange}
            hours={hours}
            minutes={minutes}
            ariaLabelPrefix="종료"
            debug={debug}
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
  debug,
}: {
  time: TimeValue;
  onChange: (t: TimeValue) => void;
  hours: number[];
  minutes: number[];
  ariaLabelPrefix: string;
  debug?: boolean;
}) {
  const update = (partial: Partial<TimeValue>) => onChange({ ...time, ...partial });

  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <ScrollWheel
        ariaLabel={`${ariaLabelPrefix} 오전/오후 선택`}
        values={["오전", "오후"]}
        valueIndex={time.period === "오전" ? 0 : 1}
        onChange={(idx) =>
          update({ period: idx === 0 ? "오전" : "오후" })
        }
        className="w-14"
        itemHeight={34}
        visibleCount={3}
        syncDep={time.period}
        debug={debug}
      />

      <ScrollWheel
        ariaLabel={`${ariaLabelPrefix} 시간 선택`}
        values={hours.map((h) => String(h))}
        valueIndex={time.hour - 1}
        onChange={(idx) => update({ hour: idx + 1 })}
        className="w-12"
        itemHeight={34}
        visibleCount={3}
        syncDep={time.hour}
        debug={debug}
      />

      <div className="px-1 text-gray3">:</div>

      <ScrollWheel
        ariaLabel={`${ariaLabelPrefix} 분 선택`}
        values={minutes.map((m) => m.toString().padStart(2, "0"))}
        valueIndex={time.minute}
        onChange={(idx) => update({ minute: idx })}
        className="w-14"
        itemHeight={34}
        visibleCount={3}
        syncDep={time.minute}
        debug={debug}
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

    // 값이 실제로 변경되었는지 확인
    if (lastValueIndex.current === valueIndex) return;
    
    if (debug) {
      console.log(`[ScrollWheel] valueIndex changed from ${lastValueIndex.current} to ${valueIndex}`);
    }
    
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

      if (debug) {
        console.log(`[ScrollWheel] scrolling to position: ${targetTop} for valueIndex: ${valueIndex}`);
      }

      el.scrollTo({ top: targetTop, behavior: "smooth" });

      programmaticTimeoutRef.current = setTimeout(() => {
        programmaticRef.current = false;
        isScrollingRef.current = false;
        if (debug) {
          console.log(`[ScrollWheel] scroll animation completed`);
        }
      }, 350);
    }, delay);

    return () => {
      if (programmaticTimeoutRef.current)
        clearTimeout(programmaticTimeoutRef.current);
    };
  }, [valueIndex, itemHeight, syncDep, debug]);

  // 컴포넌트 마운트 시 초기 위치 설정
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 초기 스크롤 위치 설정 (즉시 실행)
    const targetTop = valueIndex * itemHeight;
    el.scrollTop = targetTop;
    
    if (debug) {
      console.log(`[ScrollWheel] initial scroll position set to: ${targetTop} for valueIndex: ${valueIndex}`);
    }
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // valueIndex 변경 시 스크롤 위치 업데이트
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 값이 실제로 변경되었는지 확인
    if (lastValueIndex.current === valueIndex) return;
    
    if (debug) {
      console.log(`[ScrollWheel] valueIndex changed from ${lastValueIndex.current} to ${valueIndex}`);
    }
    
    lastValueIndex.current = valueIndex;
    const targetTop = valueIndex * itemHeight;
    el.scrollTop = targetTop;
    
    if (debug) {
      console.log(`[ScrollWheel] immediate scroll position update to: ${targetTop} for valueIndex: ${valueIndex}`);
    }
  }, [valueIndex, itemHeight, debug]);

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

      if (debug) {
        console.log(`[ScrollWheel] user scroll detected, snapping to index: ${clamped}`);
      }

      el.scrollTo({ top: targetTop, behavior: "smooth" });

      if (clamped !== valueIndex) {
        if (debug) {
          console.log(`[ScrollWheel] onChange called with index: ${clamped}`);
        }
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
