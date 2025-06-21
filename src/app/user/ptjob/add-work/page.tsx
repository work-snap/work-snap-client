"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/src/app/components/navigation";

export default function AddWorkPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2024년 6월 17일");
  const [startTime, setStartTime] = useState("6:30");
  const [endTime, setEndTime] = useState("6:30");

  return (
    <div className="min-h-screen bg-white max-w-[430px] mx-auto">
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
      <div className="px-5 mt-4">
        {/* 근무지 선택 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">알바선택</h2>
          <div className="flex items-center justify-between border border-gray2 rounded-lg p-4 ">
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
          <div className="bg-gray1 rounded-lg p-4">
            <span className="text-gray4">2024년 6월 17일</span>
          </div>
        </div>

        {/* 시간 선택 */}
        <div>
          <h2 className="text-lg font-bold mb-2">시간</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray1 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray4">오전</span>
                <span className="text-gray4">6 : 30</span>
              </div>
            </div>
            <div className="bg-gray1 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray4">오전</span>
                <span className="text-gray4">6 : 30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-[130px] left-0 right-0 px-6 ">
        <button
          onClick={() => router.push("/user/ptjob/mainpage")}
          className="w-full bg-main text-white py-5 rounded-xl font-bold max-w-[430px] mx-auto flex items-center justify-center"
        >
          추가근무 만들기
        </button>
      </div>

      {/* 하단 네비게이션 */}
      <Navigation></Navigation>
    </div>
  );
}
