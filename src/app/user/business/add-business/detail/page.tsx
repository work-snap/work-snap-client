"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useGetWorkplaceDetail } from "@/src/lib/queries/getWPDetail";
import { useGetEmployeeList } from "@/lib/queries/getEmployeeList";
import { ChevronRight } from "lucide-react";

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
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col max-w-[430px] w-full mx-auto">
      {/* 헤더 */}
      <div className="flex items-center px-2 py-4">
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
                className="p-4 border rounded-xl shadow-sm bg-white flex flex-col"
              >
                {/* 이름 + 전화번호 */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex gap-4">
                    <span className="font-semibold text-main">{emp.name}</span>
                    <span className="text-md text-main2">
                      {emp.phoneNumber}
                    </span>
                  </div>
                  <div>
                    <ChevronRight />
                  </div>
                </div>

                {/* 계약기간 */}
                <div className="text-xs text-gray-400 mb-2">
                  {emp.contractStartDate ?? "미등록"} -{" "}
                  {emp.contractEndDate ?? "미등록"}
                </div>

                {/* 근무 스케줄 */}
                <div className="text-sm text-main2 space-y-1">
                  {emp.schedules.map((sch, idx) => (
                    <div key={idx}>
                      {sch.dayOfWeekKorean} {sch.startTime} ~ {sch.endTime}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 text-sm">등록된 알바가 없습니다.</div>
        )}
      </div>

      {/* 알바 등록 버튼 */}
      <div className="w-full px-4 mt-4 mb-4">
        <button
          className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
          onClick={() => {
            router.push(
              `/user/business/add-business/detail/register-parttimer?idx=${workplaceId}`
            );
          }}
        >
          알바 인증코드 등록
        </button>
      </div>
    </div>
  );
}
