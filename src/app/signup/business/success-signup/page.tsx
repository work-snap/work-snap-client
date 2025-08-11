"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
export default function SuccessSignup() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
      {/* 텍스트 */}
      <div className="flex flex-col items-center text-center ">
        <span className="text-[15px] text-gray5 leading-tight font-regular">
          사업자 등록증
        </span>
        <span className="text-[28px] font-extrabold text-main leading-tight ">
          승인완료
        </span>
      </div>
      {/* 임시 체크리스트 일러스트 */}
      <div className="mb-8">
        <Image
          src="/loading-check.png"
          alt="체크리스트 일러스트"
          width={180}
          height={180}
          priority
        />
      </div>

      <div className="text-main text-[30px] text-center font-extrabold">
        Work Snap
        <br />
        <span className="text-[20px] font-bold text-gray5">
          가입을 환영합니다!
        </span>
      </div>
      {/* 하단 버튼 */}

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <button
          onClick={() => router.push("/user/business/add-business")}
          className="w-full py-5 rounded-lg bg-main text-white"
        >
          메인으로
        </button>
      </div>
    </div>
  );
}
