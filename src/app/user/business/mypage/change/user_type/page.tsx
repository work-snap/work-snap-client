"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/lib/queries/useUser";
import { useChangeToPartTimeWorker } from "@/src/lib/queries/changeUserType";
import { useHasAnyWorkplace } from "@/src/lib/queries/getBusinessOwnerWorkplaces";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export default function UserTypePage() {
  const router = useRouter();
  const { data: user } = useUser();
  const changeToPartTimeWorker = useChangeToPartTimeWorker();
  const { toast } = useToast();

  // 확인 상태 관리
  const [showConfirmation, setShowConfirmation] = useState(false);

  // 사업자인지 확인
  const isBusinessOwner = user?.data.userType === "BUSINESS_OWNER";

  // 사업장 보유 여부 확인 (사업자인 경우에만)
  const { data: hasWorkplace, isLoading: isCheckingWorkplace } =
    useHasAnyWorkplace(isBusinessOwner);

  // 알바님으로 변경할 수 없는 조건: 사업자이면서 사업장을 보유한 경우
  const cannotChangeToPartTime = isBusinessOwner && hasWorkplace;

  const handleChangeToPartTime = () => {
    // 사업장이 있는 사업자가 알바님으로 변경하려고 할 때 차단
    if (cannotChangeToPartTime) {
      toast({
        title: "변경 불가",
        description:
          "사업장을 보유한 사업자는 알바님으로 변경할 수 없습니다. 모든 사업장을 삭제한 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Toast를 통한 확인 다이얼로그 (10초 지속)
    const confirmToast = toast({
      title: "알바님으로 변경하시겠습니까?",
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

  const executeUserTypeChange = () => {
    // 사업자 → 알바님으로 변경
    changeToPartTimeWorker.mutate(
      "사용자 요청에 의한 파트타임 근무자 타입 변경",
      {
        onSuccess: (data) => {
          toast({
            title: "변경 완료",
            description: data.message || "알바님 타입으로 변경되었습니다!",
          });
          setTimeout(() => {
            router.push("/user/ptjob/mypage");
          }, 2000); // 토스트가 보인 후 이동
        },
        onError: (error) => {
          console.error("알바님 타입 변경 오류:", error);
          toast({
            title: "변경 실패",
            description: error.message || "타입 변경 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        },
      }
    );
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
      <h1 className="px-4 text-xl font-semibold ml-2">사장님 설정</h1>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center p-6">
        {/* 클릭 가능한 아이콘 */}
        <button
          onClick={handleChangeToPartTime}
          disabled={
            changeToPartTimeWorker.isPending ||
            !isBusinessOwner ||
            cannotChangeToPartTime ||
            isCheckingWorkplace
          }
          className="w-full bg-gray2 rounded-xl py-7 flex flex-col gap-3 items-center justify-center hover:bg-gray3 transition-colors disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="60"
            viewBox="0 0 104.689 128.061"
          >
            <path
              id="emoji_people_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24"
              d="M192.015-751.939v-84.68a40.422,40.422,0,0,1-23.291-16.088A45.946,45.946,0,0,1,160-880h12.806a32.369,32.369,0,0,0,8.564,22.651q8.564,9.364,21.85,9.364h16.008a22.767,22.767,0,0,1,8.964,1.761,23.573,23.573,0,0,1,7.524,5.122l28.974,28.974-8.964,8.964-25.292-25.292v76.516H217.627v-38.418H204.821v38.418Zm19.209-102.448a12.332,12.332,0,0,1-9.044-3.762,12.332,12.332,0,0,1-3.762-9.044,12.331,12.331,0,0,1,3.762-9.044A12.331,12.331,0,0,1,211.224-880a12.331,12.331,0,0,1,9.044,3.762,12.331,12.331,0,0,1,3.762,9.044,12.331,12.331,0,0,1-3.762,9.044A12.332,12.332,0,0,1,211.224-854.388Z"
              transform="translate(-160 880)"
              fill="#fa6956"
            />
          </svg>
          <span className="text-lg font-bold text-center">
            알바님으로 변경하기
          </span>
        </button>

        {/* 제목과 설명 */}

        <div className="py-7 text-gray-500 text-center mb-4 px-4 flex flex-col gap-2">
          {changeToPartTimeWorker.isPending ? (
            "알바님으로 변경하고 있습니다. 잠시만 기다려주세요."
          ) : isCheckingWorkplace ? (
            "사업장 정보를 확인하고 있습니다..."
          ) : !isBusinessOwner ? (
            <>
              <span className="text-lg font-bold text-main">
                사업자만 접근 가능
              </span>
              이 페이지는 사업자만 이용할 수 있습니다.
            </>
          ) : cannotChangeToPartTime ? (
            <>
              <span className="text-lg font-bold text-main">
                알바님으로 변경 전 주의사항
              </span>
              사업장을 보유한 사업자는 알바님으로 변경할 수 없습니다.
              <br />
              모든 사업장을 삭제한 후 다시 시도해주세요.
            </>
          ) : (
            <>
              알바님으로 변경하면 근무 일정을 확인하고
              <br />
              출퇴근 관리를 할 수 있어요.
            </>
          )}
        </div>

        {/* 클릭 안내 */}
        {!changeToPartTimeWorker.isPending &&
          !isCheckingWorkplace &&
          isBusinessOwner &&
          !cannotChangeToPartTime && (
            <p className="text-sm text-gray-400 text-center mb-8">
              위 버튼을 클릭하여 알바님으로 변경하기
            </p>
          )}
      </div>
    </div>
  );
}
