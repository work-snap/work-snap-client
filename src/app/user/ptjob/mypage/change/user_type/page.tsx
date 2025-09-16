"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/lib/queries/useUser";
import { useChangeToBusinessOwner } from "@/src/lib/queries/changeUserType";
import { useHasAnyActiveWorkplace } from "@/src/lib/queries/getPartTimeWorkerWorkplaces";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useUserStore } from "@/src/stores/userStore";

export default function UserTypePage() {
  const router = useRouter();
  const { data: user } = useUser();
  const changeToBusinessOwner = useChangeToBusinessOwner();
  const { toast } = useToast();
  const { updateUserType } = useUserStore();

  // 알바님인지 확인
  const isPartTimeWorker = user?.userType === "PART_TIME_WORKER";

  // 활성 사업장 보유 여부 확인 (알바님인 경우에만)
  const { data: hasActiveWorkplace, isLoading: isCheckingWorkplace } =
    useHasAnyActiveWorkplace(isPartTimeWorker);

  // 사장님으로 변경할 수 없는 조건: 알바님이면서 활성 사업장을 보유한 경우
  const cannotChangeToBusinessOwner = isPartTimeWorker && hasActiveWorkplace;

  const handleChangeToBusinessOwner = () => {
    // 활성 사업장이 있는 알바님이 사장님으로 변경하려고 할 때 차단
    if (cannotChangeToBusinessOwner) {
      toast({
        title: "변경 불가",
        description:
          "등록된 사업장이 있는 알바님은 사장님으로 변경할 수 없습니다. 모든 사업장을 퇴사한 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Toast를 통한 확인 다이얼로그 (10초 지속)
    const confirmToast = toast({
      title: "사장님으로 변경하시겠습니까?",
      description: "변경 후에는 되돌릴 수 없습니다.",
      duration: 10000, // 10초 동안 지속
      action: (
        <ToastAction
          onClick={() => {
            confirmToast.dismiss(); // toast 제거
            executeUserTypeChange(); // 변경 실행
          }}
        >
          확인
        </ToastAction>
      ),
    });
  };

  const executeUserTypeChange = async () => {
    try {
      // 알바님 → 사장님으로 변경
      const data = await changeToBusinessOwner.mutateAsync(
        "사용자 요청에 의한 사업자 타입 변경"
      );

      // Zustand store 업데이트
      await updateUserType("BUSINESS_OWNER");

      toast({
        title: "변경 완료",
        description: data.message || "사장님 타입으로 변경되었습니다!",
      });

      // 잠시 후 사업자 페이지로 이동
      setTimeout(() => {
        router.push("/user/business/add-business");
      }, 2000);
    } catch (error: any) {
      console.error("사장님 타입 변경 오류:", error);
      toast({
        title: "변경 실패",
        description: error.message || "타입 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="h-dvh flex flex-col bg-white max-w-[430px] w-full mx-auto pt-[60px]">
      {/* 헤더 */}
      <div className="flex items-center p-4">
        <button onClick={handleGoBack} className="p-2 -ml-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <h1 className="px-4 text-xl font-semibold ml-2">알바님 설정</h1>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center p-6">
        {/* 클릭 가능한 아이콘 */}
        <button
          onClick={handleChangeToBusinessOwner}
          disabled={
            changeToBusinessOwner.isPending ||
            !isPartTimeWorker ||
            cannotChangeToBusinessOwner ||
            isCheckingWorkplace
          }
          className="w-full bg-gray2 rounded-xl py-7 flex flex-col gap-3 items-center justify-center hover:bg-gray3 transition-colors disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="60"
            viewBox="0 0 115.049 103.06"
          >
            <path
              id="storefront_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24"
              d="M188.177-793.909v45.518a11.027,11.027,0,0,1-3.364,8.087,11.027,11.027,0,0,1-8.087,3.364H96.568a11.027,11.027,0,0,1-8.087-3.364,11.027,11.027,0,0,1-3.364-8.087v-45.518a19.706,19.706,0,0,1-5.081-7.73,15.534,15.534,0,0,1-.072-10.306l6.012-19.467a12.65,12.65,0,0,1,4.079-6.155,10.336,10.336,0,0,1,6.8-2.433H176.44a10.246,10.246,0,0,1,6.728,2.362,13.321,13.321,0,0,1,4.151,6.227l6.012,19.467a15.1,15.1,0,0,1-.072,10.163A22.623,22.623,0,0,1,188.177-793.909Zm-38.934-6.012a6.9,6.9,0,0,0,5.869-2.648,7.816,7.816,0,0,0,1.575-5.94l-3.149-20.039H142.372v21.185a7.541,7.541,0,0,0,2,5.225A6.318,6.318,0,0,0,149.243-799.921Zm-25.765,0a7.017,7.017,0,0,0,5.368-2.219,7.4,7.4,0,0,0,2.076-5.225v-21.185H119.756l-3.149,20.039a7.259,7.259,0,0,0,1.5,6.012A6.577,6.577,0,0,0,123.478-799.921Zm-25.479,0a6.3,6.3,0,0,0,4.509-1.861,8,8,0,0,0,2.362-4.724l3.149-22.043H96.854l-5.726,19.181a7.875,7.875,0,0,0,.93,6.155A6.228,6.228,0,0,0,98-799.921Zm77.3,0a6.384,6.384,0,0,0,6.012-3.292,7.276,7.276,0,0,0,.859-6.155l-6.012-19.181H165.275l3.149,22.043a8,8,0,0,0,2.362,4.724A6.3,6.3,0,0,0,175.295-799.921Zm-78.727,51.53h80.158v-40.365a3.457,3.457,0,0,1-.93.286h-.5a16.782,16.782,0,0,1-6.8-1.288,19.327,19.327,0,0,1-5.8-4.151,18.884,18.884,0,0,1-5.869,4.008,17.4,17.4,0,0,1-7.014,1.431,18.268,18.268,0,0,1-7.229-1.431,18.65,18.65,0,0,1-5.94-4.008,17.457,17.457,0,0,1-5.654,4.008,16.9,16.9,0,0,1-6.942,1.431,19.011,19.011,0,0,1-7.515-1.431,18.65,18.65,0,0,1-5.94-4.008,18.817,18.817,0,0,1-5.94,4.223A17.243,17.243,0,0,1,98-788.47h-.644a1.452,1.452,0,0,1-.787-.286Zm80.158,0h0Z"
              transform="translate(-79.122 840)"
              fill="#fa6956"
            />
          </svg>
          <span className="text-lg font-bold text-center">
            사장님으로 변경하기
          </span>
        </button>

        {/* 제목과 설명 */}
        <div className="py-7 text-gray-500 text-center mb-4 px-4 flex flex-col gap-2">
          {changeToBusinessOwner.isPending ? (
            "사장님으로 변경하고 있습니다. 잠시만 기다려주세요."
          ) : isCheckingWorkplace ? (
            "사업장 정보를 확인하고 있습니다..."
          ) : !isPartTimeWorker ? (
            <>
              <span className="text-lg font-bold text-main">
                알바님만 접근 가능
              </span>
              이 페이지는 알바님만 이용할 수 있습니다.
            </>
          ) : cannotChangeToBusinessOwner ? (
            <>
              <span className="text-lg font-bold text-main">
                사장님으로 변경 전 주의사항
              </span>
              등록된 사업장이 있는 알바님은 사장님으로 변경할 수 없습니다.
              <br />
              모든 사업장을 퇴사한 후 다시 시도해주세요.
            </>
          ) : (
            <>
              사장님으로 변경하면 사업장을 등록하고
              <br />
              직원들의 출퇴근을 관리할 수 있어요.
            </>
          )}
        </div>

        {/* 클릭 안내 */}
        {!changeToBusinessOwner.isPending &&
          !isCheckingWorkplace &&
          isPartTimeWorker &&
          !cannotChangeToBusinessOwner && (
            <p className="text-sm text-gray-400 text-center mb-8">
              위 버튼을 클릭하여 사장님으로 변경하기
            </p>
          )}
      </div>
    </div>
  );
}
