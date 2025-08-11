import Image from "next/image";

export default function ReAuthentication() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
      {/* 텍스트 */}
      <div className="flex flex-col items-center text-center ">
        <span className="text-[15px] text-gray5 leading-tight mb-4 font-regular">
          등록해주신
          <br />
          사업자 등록증이
          <br />
          인증이 되지 않았습니다.
        </span>
        <span className="text-[24px] font-extrabold text-main leading-tight ">
          재인증 필요
        </span>
      </div>
      {/* 임시 체크리스트 일러스트 */}
      <div className="mt-8 mb-8">
        <Image
          src="/re-authentication.png"
          alt="체크리스트 일러스트"
          width={160}
          height={160}
          priority
        />
      </div>

      <div className="text-gray-400 text-[18px] text-center">
        사업자 등록증을 <br /> 다시 인증해주시기 바랍니다.
      </div>
      {/* 하단 버튼 */}

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <button className="w-full py-5 rounded-lg bg-main text-white">
          사업자등록증 확인 바로가기
        </button>
      </div>
    </div>
  );
}
