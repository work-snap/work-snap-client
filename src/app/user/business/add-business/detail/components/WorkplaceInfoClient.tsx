"use client";

import { useGetWorkplaceDetail } from "@/src/lib/queries/getWPDetail";

export default function WorkplaceInfoClient({
  workplaceId,
}: {
  workplaceId: number;
}) {
  const {
    data: workplace,
    isError,
    error,
  } = useGetWorkplaceDetail(workplaceId);

  if (isError) {
    return (
      <div className="px-9 py-4 bg-red-50 text-red-600 text-sm">
        사업장 정보를 불러오는데 실패했습니다: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="px-9 py-4 bg-gray-100">
      <div className="text-main font-bold text-lg mb-1">
        {workplace?.workplaceName}
      </div>
      <div className="text-gray3 text-sm mb-1">{workplace?.workplacePhone}</div>
      <div className="text-gray4 text-md font-bold">
        {workplace?.workplaceDescription}
      </div>
    </div>
  );
}
