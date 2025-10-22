"use client";

import { useRouter } from "next/navigation";
import { useGetEmployeeList } from "@/lib/queries/getEmployeeList";
import { ChevronRight } from "lucide-react";

export default function EmployeeListClient({
  workplaceId,
}: {
  workplaceId: number;
}) {
  const router = useRouter();
  const {
    data: employeeData,
    isError,
    error,
  } = useGetEmployeeList(workplaceId);

  if (isError) {
    return (
      <div className="px-4 mt-6">
        <h2 className="font-bold text-lg mb-2">등록된 알바</h2>
        <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl">
          직원 목록을 불러오는데 실패했습니다: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <h2 className="font-bold text-lg mb-2">등록된 알바</h2>
      {employeeData?.data?.length ? (
        <ul className="space-y-3">
          {employeeData.data.map((emp) => (
            <li
              key={emp.userId}
              className="p-4 border rounded-xl shadow-sm bg-white flex flex-col"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex gap-4">
                  <span className="font-semibold text-main">{emp.name}</span>
                  <span className="text-md text-main2">{emp.phoneNumber}</span>
                </div>
                <div>
                  <ChevronRight
                    onClick={() =>
                      router.push(
                        `/user/business/edit-employee/?idx=${workplaceId}&userId=${emp.userId}`
                      )
                    }
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-2">
                {emp.contractStartDate ?? "미등록"} -{" "}
                {emp.contractEndDate ?? "미등록"}
              </div>

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
  );
}
