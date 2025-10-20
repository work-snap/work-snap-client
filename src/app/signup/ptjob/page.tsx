import Link from "next/link";

export default function SignupPtjobPage() {
  return (
    <div className="h-dvh w-full flex justify-center items-center">
      {/* 콘텐츠 박스 */}
      <div className="bg-white w-full max-w-[430px] h-full flex flex-col justify-between items-center mx-auto">
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
        <div className="p-4 w-full">
          <Link href="/user/ptjob/job-list">
            <button className="w-full py-5 rounded-xl bg-main text-white">
              메인으로
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
