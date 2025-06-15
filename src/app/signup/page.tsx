"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white max-w-[430px] w-full mx-auto">
      {/* 상단 뒤로가기 */}
      <div className="flex items-center h-12 px-2 py-8">
        <Link href="/" className="">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      {/* 본문 */}
      <div className="flex flex-col items-start px-4 pt-2 w-full">
        <div className="mb-1 w-full">
          <span className="text-4xl font-extrabold text-main ">Work Snap</span>
          <span className="text-2xl font-extrabold text-gray5 ml-1">
            을 어떻게 이용할 예정이신가요?
          </span>
        </div>
        <div className="text-gray3 text-sm mb-10 mt-2 w-full">
          사용자 유형을 선택해 주세요.
        </div>
        {/* 선택 버튼 */}
        <div className="w-full flex flex-col gap-4">
          <Link
            href="/signup/ptjob"
            className="w-full bg-gray2 rounded-xl py-7 flex flex-col items-center justify-center hover:bg-gray3 transition-colors"
          >
            <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
              <path
                d="M20 36c8.837 0 16-7.163 16-16S28.837 4 20 4 4 11.163 4 20s7.163 16 16 16Z"
                fill="#fff"
              />
              <path
                d="M20 36c8.837 0 16-7.163 16-16S28.837 4 20 4 4 11.163 4 20s7.163 16 16 16Z"
                stroke="#FA6956"
                strokeWidth="2"
              />
              <path
                d="M20 22c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
                fill="#FA6956"
              />
            </svg>
            <span className="mt-2 text-gray5 font-semibold">알바님</span>
          </Link>
          <button className="w-full bg-gray2 rounded-xl py-7 flex flex-col items-center justify-center  hover:bg-gray3 transition-colors">
            <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
              <rect
                x="6"
                y="14"
                width="28"
                height="16"
                rx="3"
                fill="#fff"
                stroke="#FA6956"
                strokeWidth="2"
              />
              <path
                d="M10 14V10a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4"
                stroke="#FA6956"
                strokeWidth="2"
              />
              <rect x="14" y="22" width="4" height="4" rx="1" fill="#FA6956" />
              <rect x="22" y="22" width="4" height="4" rx="1" fill="#FA6956" />
            </svg>
            <span className="mt-2 text-gray5 font-semibold">사장님</span>
          </button>
        </div>
      </div>
    </div>
  );
}
