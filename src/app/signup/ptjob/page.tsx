"use client";

import Link from "next/link";

export default function SignupPtjobPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white max-w-[430px] w-full mx-auto">
      {/* 중앙 환영 메시지 */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="text-main text-2xl font-extrabold mb-2">
            Work Snap
          </div>
          <div className="text-gray5 text-xl font-extrabold">
            가입을 환영합니다!
          </div>
        </div>
      </div>
      {/* 하단 버튼 */}
      <div className="w-full flex justify-center pb-8">
        <Link
          href="/user/ptjob"
          className="w-[90%] max-w-[340px] h-12 bg-main rounded-xl flex items-center justify-center font-semibold text-white text-base"
        >
          메인으로
        </Link>
      </div>
    </div>
  );
}
