import Image from "next/image";

export default function LoadingAuthentication() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
      {/* 임시 체크리스트 일러스트 */}
      <div className="mt-12 mb-8">
        <Image
          src="/loading-check.png"
          alt="체크리스트 일러스트"
          width={240}
          height={240}
          priority
        />
      </div>
      {/* 텍스트 */}
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-[15px] text-gray5 leading-tight mb-1 font-regular">
          등록해주신
          <br />
          사업자 등록증을
        </span>
        <span className="text-[24px] font-extrabold text-main leading-tight mb-4 ">
          확인중입니다.
        </span>
      </div>
      {/* 로딩 스피너 */}
      <div className="mb-4">
        <svg
          className="animate-spin h-8 w-8 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
      <div className="text-gray-400 text-[16px]">조금만 기다려주세요.</div>
    </div>
  );
}
