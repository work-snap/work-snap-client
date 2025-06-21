"use client";

import Link from "next/link";
import Navigation from "../../../components/navigation";
import { useState } from "react";

export default function PtjobMainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDate, setCurrentDate] = useState("2025년 6월 16일");
  const [workStatus, setWorkStatus] = useState("before"); // before, early, working, done
  const [isEarlyStart, setIsEarlyStart] = useState(false);
  const [isEarlyLeave, setIsEarlyLeave] = useState(false);

  const handleEarlyStart = () => {
    if (workStatus === "working") {
      setIsEarlyLeave(true);
    } else {
      setWorkStatus("early");
      setIsEarlyStart(true);
    }
  };

  const handleStart = () => {
    if (workStatus === "early") {
      setWorkStatus("working");
    } else if (workStatus === "before") {
      setWorkStatus("working");
      setIsEarlyStart(false);
    }
  };

  const handleEnd = () => {
    if (isEarlyLeave) {
      setWorkStatus("done");
    } else if (workStatus === "working") {
      setWorkStatus("done");
    }
  };

  const getStatusButton = (status: string) => {
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
            조기출근
          </span>
        );
      case "working":
        return (
          <span className="text-sub3 text-xs font-medium bg-white rounded-full px-4 py-2">
            조퇴하기
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
    <div className="min-h-screen flex flex-col max-w-[430px] w-full mx-auto relative pb-[80px]">
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

      {!isAuthenticated ? (
        // 인증 전 화면
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-main text-xl text-center font-extrabold whitespace-pre-line bg-gray1 rounded-3xl px-20 py-10 mb-4">
            {"사장님께서 알바님\n인증번호를 등록할 때까지\n잠시 기다려주세요."}
          </div>
          {/* 테스트용 인증 버튼 */}
          <button
            onClick={() => setIsAuthenticated(true)}
            className="mt-4 px-6 py-2 bg-main text-white rounded-lg font-medium"
          >
            인증하기
          </button>
        </div>
      ) : (
        // 인증 후 화면
        <>
          {/* 날짜 선택 */}
          <div className="flex items-center justify-between px-3 py-4 bg-main rounded-xl mb-5 mx-4">
            <button className="text-white">
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
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span className="text-lg font-bold text-white">{currentDate}</span>
            <button className="text-white">
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
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* 근무 시간표 */}
          <div className="flex-1 px-4 space-y-3">
            {/* 스타벅스 */}
            <div className="bg-white rounded-xl border border-gray2">
              <div
                className={`flex items-center justify-between mb-4 ${
                  workStatus === "working"
                    ? "bg-sub3"
                    : workStatus === "done"
                    ? "bg-main"
                    : "bg-gray1"
                } p-3 rounded-t-xl`}
              >
                <span
                  className={`font-bold ${
                    workStatus === "working" || workStatus === "done"
                      ? "text-white"
                      : "text-main"
                  }`}
                >
                  스타벅스 해운대점
                </span>
                <div onClick={handleEarlyStart}>
                  {getStatusButton(workStatus)}
                </div>
              </div>
              <div
                className={`flex items-center text-gray3 text-xs mb-3 px-6 ${
                  workStatus === "working"
                    ? "text-sub3"
                    : workStatus === "done"
                    ? "text-main"
                    : ""
                }`}
              >
                {workStatus === "done" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                )}
                {workStatus === "working"
                  ? isEarlyStart
                    ? "열심히 일하고 있어요"
                    : "열심히 일하고 있어요"
                  : workStatus === "done"
                  ? isEarlyLeave
                    ? "오늘 업무 완료"
                    : "오늘 업무 완료"
                  : "아직 출근 전입니다."}
              </div>
              <div className="flex flex-col gap-1 mb-3 px-2">
                <div className="flex justify-around text-xs text-gray3">
                  <span
                    className={`border rounded-full px-2 py-1 ${
                      workStatus === "working"
                        ? "border-sub3 text-sub3"
                        : workStatus === "done"
                        ? "border-main text-main"
                        : "border-gray3"
                    }`}
                  >
                    6월 16일
                  </span>

                  <span
                    className={`border rounded-full px-2 py-1 ${
                      workStatus === "working"
                        ? "border-sub3 text-sub3"
                        : workStatus === "done"
                        ? "border-main text-main"
                        : "border-gray3"
                    }`}
                  >
                    6월 16일
                  </span>
                </div>
                <div className="flex justify-around px-5">
                  <div className="flex flex-col">
                    <div
                      className={`text-4xl font-bold ${
                        workStatus === "working"
                          ? "text-sub3"
                          : workStatus === "done"
                          ? "text-main"
                          : ""
                      }`}
                    >
                      09:00
                    </div>
                    <div
                      className={`text-md ${
                        workStatus === "working"
                          ? "text-sub3"
                          : workStatus === "done"
                          ? "text-main"
                          : "text-gray3"
                      }`}
                    >
                      {workStatus === "working"
                        ? isEarlyStart
                          ? "조기출근 08:58"
                          : "출근 08:58"
                        : workStatus === "done"
                        ? isEarlyStart
                          ? "조기출근 08:58"
                          : "출근 08:58"
                        : "현재시각 8:58"}
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      workStatus === "working"
                        ? "text-sub3"
                        : workStatus === "done"
                        ? "text-main"
                        : "text-gray3"
                    } self-start -mt-2`}
                  >
                    . . .
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`text-4xl font-bold ${
                        workStatus === "working"
                          ? "text-sub3"
                          : workStatus === "done"
                          ? "text-main"
                          : ""
                      }`}
                    >
                      15:00
                    </div>

                    <div
                      className={`text-md ${
                        workStatus === "working"
                          ? "text-gray3"
                          : workStatus === "done"
                          ? "text-main"
                          : "text-gray1"
                      }`}
                    >
                      {workStatus === "working"
                        ? "현재시각 14:53"
                        : workStatus === "done"
                        ? isEarlyLeave
                          ? "조퇴 14:02"
                          : "퇴근 15:02"
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
              {getActionButton(workStatus)}
            </div>
          </div>

          {/* 추가 버튼 */}
          <div className="px-4 py-10">
            <div className="w-full py-5 bg-gray2 rounded-xl text-gray5 font-bold flex items-center justify-center">
              <Link href="/user/ptjob/add-work">추가근무 +</Link>
            </div>
          </div>
        </>
      )}

      {/* 하단 네비게이션 */}
      <Navigation />
    </div>
  );
}
