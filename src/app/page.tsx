"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    // Next.js API 라우트로 리다이렉트
    router.push("/kakao-login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white max-w-[430px] w-full mx-auto ">
      {/* 중앙 컨텐츠 */}
      <div className="flex flex-col items-center justify-center flex-1 pt-24">
        {/* 로고 */}
        <div className="mb-6">
          <svg
            width="120"
            height="80"
            viewBox="0 0 120 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 60L30 30C31.5 25 38.5 25 40 30L45 50L70 25C73 22 78 23 77 28L70 60C69 65 62 65 61 60L56 40L30 65C27 68 22 67 20 60Z"
              fill="#050B25"
            />
            <path
              d="M60 60L90 30C93 27 98 28 97 33L90 60C89 65 82 65 81 60L76 40L60 60Z"
              fill="#FA6956"
            />
          </svg>
        </div>
        {/* 앱명 */}
        <h1 className="text-main text-3xl font-extrabold mb-2 tracking-tight">
          Work Snap
        </h1>
        {/* 설명 */}
        <div className="text-main2 text-lg font-extrabold">
          편리한 알바 출석 관리
        </div>
      </div>
      {/* 하단 카카오 버튼 */}
      <div className="w-full flex flex-col items-center gap-4 justify-center pb-8">
        <button
          onClick={handleKakaoLogin}
          className="w-[90%] max-w-[340px] h-12 bg-[#FFE812] rounded-xl flex items-center shadow font-semibold text-main2 text-base"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="ml-4"
          >
            <ellipse cx="12" cy="12" rx="12" ry="12" fill="#3C1E1E" />
            <path
              d="M12 6.5C8.41015 6.5 5.5 8.63401 5.5 11.25C5.5 13.0732 7.01213 14.6092 9.17013 15.3382L8.5 17.5L11.0112 15.7892C11.3292 15.8182 11.6612 15.8332 12 15.8332C15.5899 15.8332 18.5 13.6992 18.5 11.0832C18.5 8.4672 15.5899 6.5 12 6.5Z"
              fill="#FFE812"
            />
          </svg>
          <span className="flex-1 text-center">카카오로 계속하기</span>
        </button>
      </div>
    </div>
  );
}
