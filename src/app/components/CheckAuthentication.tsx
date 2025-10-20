import Image from "next/image";

export default function CheckAuthentication() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
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
          검토중입니다.
        </span>
      </div>
      {/* 로딩 스피너 */}
      <div className="w-full flex justify-center items-center mt-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray2 border-t-main rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
      </div>
      <div className="text-gray-400 text-[16px]">조금만 기다려주세요.</div>
    </div>
  );
}
