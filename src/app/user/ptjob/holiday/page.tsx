"use client";

import Link from "next/link";
import Navigation from "../../../components/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HolidayPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workStatus, setWorkStatus] = useState("before"); // before, early, working, done
  const [isEarlyStart, setIsEarlyStart] = useState(false);
  const [isEarlyLeave, setIsEarlyLeave] = useState(false);

  // 날짜 포맷
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 시간 포맷
  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [currentTime, setCurrentTime] = useState(getFormattedTime());

  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  // 현재 시각 실시간 갱신 (1분마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTime());
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const handleEarlyStart = () => {
    if (workStatus === "working") {
      // 조퇴하기 버튼 누르면 isEarlyLeave 토글
      setIsEarlyLeave((prev) => !prev);
    } else if (workStatus === "early") {
      setWorkStatus("before");
      setIsEarlyStart(false);
    } else {
      setWorkStatus("early");
      setIsEarlyStart(true);
    }
  };

  const handleStart = () => {
    const now = getFormattedTime();
    setStartTime(now);
    setWorkStatus("working");
    setIsEarlyStart(workStatus === "early");
  };

  const handleEnd = () => {
    const now = getFormattedTime();
    if (isEarlyLeave || workStatus === "working") {
      setEndTime(now);
      setWorkStatus("done");
    }
  };

  const getStatusButton = (status: string) => {
    if (status === "working") {
      if (isEarlyLeave) {
        return (
          <span className="text-sub3 text-xs font-medium bg-white rounded-full px-4 py-2">
            정시퇴근
          </span>
        );
      } else {
        return (
          <span className="text-sub3 text-xs font-medium bg-white rounded-full px-4 py-2">
            조퇴하기
          </span>
        );
      }
    }

    switch (status) {
      case "before":
        return (
          <span className="text-white text-xs font-medium bg-main rounded-full px-4 py-2">
            조기출근
          </span>
        );
      case "early":
        return (
          <span className="text-white text-xs font-medium bg-main rounded-full px-4 py-2">
            정시출근
          </span>
        );
      case "done":
        return null;
      default:
        return (
          <span className="text-white text-xs font-medium bg-main rounded-full px-4 py-2">
            조기출근
          </span>
        );
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case "before":
        return (
          <button
            onClick={handleStart}
            className="w-full text-center text-main py-3 border-t border-gray2 font-bold"
          >
            출근하기
          </button>
        );
      case "early":
        return (
          <button
            onClick={handleStart}
            className="w-full text-center text-main py-3 border-t border-gray2 font-bold"
          >
            조기출근하기
          </button>
        );
      case "working":
        return (
          <button
            onClick={handleEnd}
            className="w-full text-center text-sub3 py-3 border-t border-gray2 font-bold bg-white"
          >
            {isEarlyLeave ? "조퇴하기" : "퇴근하기"}
          </button>
        );
      case "done":
        return (
          <button
            className="w-full text-center text-gray3 py-3 border-t border-gray2 font-bold bg-gray1"
            disabled
          >
            업무종료
          </button>
        );
      default:
        return (
          <button
            onClick={handleStart}
            className="w-full text-center text-main py-3 border-t border-gray2 font-bold"
          >
            출근하기
          </button>
        );
    }
  };

  return (
    <div className="h-full flex flex-col max-w-[430px] w-full mx-auto relative pb-[80px]">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
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
      {/* 날짜 선택 */}
      <div className="flex items-center justify-between px-3 py-4 bg-main rounded-xl mb-5 mx-4">
        <button className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="text-lg font-bold text-white">{currentDate}</span>
        <button className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
      {/* 휴일 일러스트 */}
      <div className="flex flex-col justify-center  items-center  ">
        <Image
          src="/holiday.png"
          alt="휴일 일러스트"
          width={240}
          height={240}
          priority
        />
        <span>오늘은 업무가 없는 날이에요!</span>
      </div>
      {/* 추가 버튼 */}
      <div className="px-4 py-10">
        <div className="w-full py-5 bg-gray2 rounded-xl text-gray5 text-lg font-bold flex items-center justify-center">
          <Link href="/user/ptjob/add-work">추가근무 +</Link>
        </div>
      </div>

    </div>
  );
}
