"use client";

import Link from "next/link";

export default function SignupBusinessPage() {
  return (
    <div className="h-full flex flex-col justify-between items-center bg-white max-w-[430px] w-full mx-auto">
      {/* 중앙 환영 메시지 */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="text-main text-2xl font-extrabold mb-2">
            Work Snap
          </div>
          <div className="text-gray5 text-xl font-extrabold">
            사장님, 가입을 환영합니다!
          </div>
        </div>
      </div>
      {/* 하단 버튼 */}

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <button className="w-full py-5 rounded-lg bg-main text-white">
          메인으로
        </button>
      </div>
    </div>
  );
}
