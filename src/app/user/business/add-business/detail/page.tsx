"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/src/app/components/navigation";
import { useGetWorkplaceDetail } from "@/src/lib/queries/getWPDetail";
import Header from "@/app/components/Header";

export default function BusinessDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("idx"));

  const { data, isLoading, isError, error } =
    useGetWorkplaceDetail(workplaceId);

  if (isLoading) return <div>로딩중...</div>;
  if (isError) return <div>에러: {(error as Error).message}</div>;

  return (
    <div className="h-full flex flex-col max-w-[430px] w-full mx-auto bg-white pb-[80px]">
      <Header />

      <div className="flex items-center px-2 py-4 ">
        <button
          onClick={() => router.push("/user/business/add-business")}
          className="flex items-center text-gray5 font-semibold text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          사업장 목록으로
        </button>
      </div>

      <div className="px-9 py-4 bg-gray-100">
        <div className="text-main font-bold text-lg mb-1">
          {data?.workplaceName}
        </div>
        <div className="text-gray3 text-sm mb-1">{data?.workplacePhone}</div>
        <div className="text-gray4 text-md font-bold">
          {data?.workplaceDescription}
        </div>
      </div>

      <div className="w-full px-4 mt-8">
        <button
          className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
          onClick={() => {
            console.log(
              "이동 URL:",
              `/user/business/add-business/detail/register-parttimer?idx=${data?.id}`
            );
            router.push(
              `/user/business/add-business/detail/register-parttimer?idx=${data?.id}`
            );
          }}
        >
          알바 인증코드 등록
        </button>
      </div>
    </div>
  );
}
