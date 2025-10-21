"use client";

import { useRouter } from "next/navigation";
import { useGetWP } from "@/src/lib/queries/getWP";
import { useDeleteWP } from "@/src/lib/queries/useDeleteWP";
import { useState } from "react";
import ToastModal from "@/app/components/ToastModal";
import WorkplaceListSkeleton from "../WorkplaceListSkeleton";

export default function WorkplaceList() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetWP();
  const deleteMutation = useDeleteWP();
  const workplaces = data?.workplaces ?? [];
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const hideToast = () => {
    setIsToastVisible(false);
  };

  const handleDelete = (idx: number) => {
    const workplaceId = workplaces[idx]?.id;
    const workplaceName = workplaces[idx]?.workplaceName;
    deleteMutation.mutate(workplaceId, {
      onSuccess: () => {
        showToast(`${workplaceName}이(가) 성공적으로 삭제되었습니다.`);
      },
      onError: () => {
        showToast("삭제에 실패했습니다. 다시 시도해주세요.");
      },
    });
  };

  // 로딩 상태
  if (isLoading) {
    return <WorkplaceListSkeleton />;
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-500 px-4">
          에러 발생:{" "}
          {error instanceof Error ? error.message : "알 수 없는 에러"}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 메인 컨텐츠 영역 */}
      <div
        className={`flex-1 overflow-y-auto ${
          workplaces.length === 0
            ? "flex justify-center items-center"
            : "flex flex-col gap-4 pb-4"
        }`}
      >
        {workplaces.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            등록된 사업장이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4 px-4 pb-4">
            {workplaces.map((b, idx) => (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow p-4 border border-gray2 flex items-start justify-between gap-2 cursor-pointer"
                onClick={() =>
                  router.push(`/user/business/add-business/detail?idx=${b.id}`)
                }
              >
                <div>
                  <div className="text-main font-bold text-lg mb-1">
                    {b.workplaceName}
                  </div>
                  <div className="text-gray3 text-sm mb-1">
                    {b.workplacePhone}
                  </div>
                  <div className="text-gray4 text-md font-bold">
                    {b.workplaceDescription}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                  className="ml-2 p-2 rounded text-main2"
                  aria-label="사업장 삭제"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6 text-main"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      <ToastModal
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
      />
    </>
  );
}
