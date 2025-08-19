"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useGetWorkplaceDetail } from "@/src/lib/queries/getWPDetail";
import { useGetEmployeeList } from "@/lib/queries/getEmployeeList";

export default function BusinessDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("idx"));

  // 사업장 상세
  const {
    data: workplace,
    isLoading: isWorkplaceLoading,
    isError: isWorkplaceError,
    error: workplaceError,
  } = useGetWorkplaceDetail(workplaceId);

  // 직원 목록
  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
    error: employeeError,
  } = useGetEmployeeList(workplaceId);

  if (isWorkplaceLoading || isEmployeeLoading) return <div>로딩중...</div>;
  if (isWorkplaceError)
    return <div>에러: {(workplaceError as Error).message}</div>;
  if (isEmployeeError)
    return <div>에러: {(employeeError as Error).message}</div>;

  return (
    <div className="h-full flex flex-col max-w-[430px] w-full mx-auto bg-white pb-[80px]">
      {/* 헤더 */}
      <div className="flex items-center px-2 py-4 ">
        <button
          onClick={() => router.back()}
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

      {/* 사업장 정보 */}
      <div className="px-9 py-4 bg-gray-100">
        <div className="text-main font-bold text-lg mb-1">
          {workplace?.workplaceName}
        </div>
        <div className="text-gray3 text-sm mb-1">
          {workplace?.workplacePhone}
        </div>
        <div className="text-gray4 text-md font-bold">
          {workplace?.workplaceDescription}
        </div>
      </div>

      {/* 직원 목록 */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-lg mb-2">등록된 알바</h2>
        {employeeData?.data?.length ? (
          <ul className="space-y-3">
            {employeeData.data.map((emp) => (
              <li
                key={emp.userId}
                className="p-3 border rounded-xl shadow-sm flex flex-col bg-gray-50"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {emp.name ?? "이름 없음"}
                  </span>
                  <span className="text-sm text-gray-500">
                    스케줄 {emp.activeScheduleCount}/{emp.totalScheduleCount}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  초대 코드: {emp.inviteCode}
                </div>
                <div className="text-xs text-gray-400">
                  최근 근무일: {emp.lastWorkDate ?? "없음"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 text-sm">등록된 알바가 없습니다.</div>
        )}
      </div>

      {/* 직원 수 요약 */}
      {typeof employeeData?.totalCount === "number" && (
        <div className="px-4 mt-8">
          <h2 className="font-bold text-lg mb-2">통계</h2>
          <div className="p-4 border rounded-xl bg-gray-50 shadow-sm space-y-1 text-sm">
            <div>총 등록 직원: {employeeData.totalCount}명</div>
          </div>
        </div>
      )}

      {/* 알바 등록 버튼 */}
      <div className="w-full px-4 mt-8">
        <button
          className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
          onClick={() => {
            router.push(
              `/user/business/add-business/detail/register-parttimer?idx=${workplace?.id}`
            );
          }}
        >
          알바 인증코드 등록
        </button>
      </div>
    </div>
  );
}
