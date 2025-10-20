"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export default function BusinessInfoDisplay() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zustand 스토어에서 사업자 등록 응답 데이터 및 사용자 정보 가져오기
  const { businessRegistrationResponse, user } = useUserStore();

  useEffect(() => {
    // 이미 인증 완료된 사용자는 메인 페이지로 리다이렉트
    if (
      user?.userType === "BUSINESS_OWNER" &&
      (user?.businessVerificationStatus === "APPROVED" ||
        user?.businessVerificationStatus === "VERIFIED")
    ) {
      console.log(
        "✅ 이미 인증 완료된 사용자 감지 → /user/business/add-business로 리다이렉트"
      );
      router.replace("/user/business/add-business");
      return;
    }

    // Zustand 스토어에서 사업자 등록 응답 데이터 확인
    if (businessRegistrationResponse) {
      console.log(
        "✅ Zustand 스토어에서 사업자 등록 응답 데이터 로드:",
        businessRegistrationResponse
      );
      setIsLoading(false);
    } else {
      console.log("⚠️ 사업자 등록 응답 데이터 없음");
      setError("사업자 정보를 찾을 수 없습니다.");
      setIsLoading(false);
    }
  }, [businessRegistrationResponse, user, router]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center mt-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray2 border-t-main rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="w-full pb-24">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500 text-center">
            <div className="mb-4">{error}</div>
            <button
              onClick={() => router.push("/signup/business/signup-1")}
              className="px-4 py-2 bg-main text-white rounded-lg"
            >
              다시 등록하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // businessRegistrationResponse가 없으면 에러 상태로 처리
  if (!businessRegistrationResponse) {
    return (
      <div className="w-full pb-24">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500 text-center">
            <div className="mb-4">사업자 정보를 찾을 수 없습니다.</div>
            <button
              onClick={() => router.push("/signup/business/signup-1")}
              className="px-4 py-2 bg-main text-white rounded-lg"
            >
              다시 등록하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-white max-w-[430px] w-full mx-auto">
      {/* 메인 컨텐츠 */}

      <div className="flex flex-col flex-1  px-4 pt-12 w-full min-h-0">
        <div className="mb-1 w-full flex-shrink-0">
          <span className="text-2xl font-bold text-black">
            Work Snap에 오신 것을
          </span>
          <br />
          <span className="text-2xl font-bold text-black">환영합니다.</span>
        </div>
        <h2 className="font-medium mb-3 text-lg">사업자등록증 확인</h2>
        <div className="flex flex-col gap-2">
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
            상호 {businessRegistrationResponse.businessName || "-"}
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
            사업자 번호 :{" "}
            {businessRegistrationResponse.businessRegistrationNumber || "-"}
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
            성명 : {businessRegistrationResponse.ownerName || "-"}
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
            사업장소재지 : {businessRegistrationResponse.businessAddress || "-"}
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
            업태 : {businessRegistrationResponse.businessType || "-"}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white max-w-[430px] mx-auto">
        <button
          onClick={() => {
            // 가입 완료 페이지로 이동
            router.push("/signup/business/success-signup");
          }}
          className="w-full py-5 rounded-lg bg-main text-white"
        >
          가입 완료
        </button>
      </div>
    </div>
  );
}
