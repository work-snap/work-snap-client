"use client";

import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { UseMutationResult } from "@tanstack/react-query";
import {
  ResisterBusinessRequest,
  ResisterBusinessResponse,
} from "@/src/lib/auth/types";
import { useResisterBusiness } from "@/src/lib/auth/auth.query";
import { authApis } from "@/src/lib/auth/auth";
import LoadingAuthentication from "@/src/app/components/loadingAuthentication";
import Loading from "@/src/app/components/loading";
import { BusinessInfoDisplay, ImageUploadSection } from "./components";

export default function BusinessSignupStep1() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCheckingBusinessOwner, setIsCheckingBusinessOwner] = useState(false);

  // 사업자 정보 확인 및 리다이렉트 로직
  useEffect(() => {
    const checkBusinessOwnerStatus = async () => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");

      console.log("🔐 인증 상태 확인:", {
        token: token ? "존재함" : "없음",
        user: user ? JSON.parse(user) : "없음",
      });

      // 토큰이 없으면 확인하지 않음
      if (!token) {
        console.log("🔒 토큰 없음 - 사업자 정보 확인 건너뜀");
        return;
      }

      setIsCheckingBusinessOwner(true);

      try {
        // 1차: 사업자 검증 상태 확인
        console.log("🔍 사업자 검증 상태 확인 시도...");
        const verificationResponse = await authApis.getVerificationStatus();

        // 검증 상태가 존재하고 승인된 경우에만 리다이렉트
        if (
          verificationResponse?.data &&
          verificationResponse.data.verificationStatus === "APPROVED"
        ) {
          console.log("✅ 사업자 검증 상태 승인됨 - 메인페이지로 리다이렉트");
          router.replace("/user/business/add-business");
          return;
        } else if (verificationResponse?.data) {
          console.log(
            "ℹ️ 사업자 검증 상태 존재하지만 미승인 - 사업자 정보 확인으로 진행"
          );
        }
      } catch (verificationError: any) {
        console.log(
          "⚠️ 사업자 검증 상태 확인 실패:",
          verificationError?.response?.status,
          verificationError?.response?.data?.message
        );
        // 404, 400 에러는 정상적인 상황 (사업자 정보 없음)
        if (
          verificationError?.response?.status === 404 ||
          verificationError?.response?.status === 400 ||
          verificationError?.response?.data?.message?.includes(
            "사업자 등록 정보를 찾을 수 없습니다"
          )
        ) {
          console.log("ℹ️ 사업자 검증 상태 없음 - 사업자 정보 확인으로 진행");
        }
      }

      // 2차: 사업자 정보 존재 여부 확인 (서버 API 문제로 임시 비활성화)
      // TODO: 서버에 /api/business-owner/info 엔드포인트 구현 후 활성화
      /*
      try {
        console.log("🔍 사업자 정보 존재 여부 확인 시도...");
        const businessOwnerResponse = await authApis.getBusinessOwner();

        // 사업자 정보가 존재하고 활성화된 경우에만 리다이렉트
        if (
          businessOwnerResponse?.data &&
          businessOwnerResponse.data.isActive === true &&
          businessOwnerResponse.data.verificationStatus === "APPROVED"
        ) {
          console.log(
            "✅ 사업자 정보 존재 및 승인됨 - 메인페이지로 리다이렉트"
          );
          router.replace("/user/business/mainpage");
          return;
        } else if (businessOwnerResponse?.data) {
          console.log(
            "ℹ️ 사업자 정보 존재하지만 미승인 또는 비활성 - 등록 페이지 표시"
          );
        }
      } catch (businessOwnerError: any) {
        console.log(
          "⚠️ 사업자 정보 확인 실패:",
          businessOwnerError?.response?.status,
          businessOwnerError?.response?.data?.message
        );
        // 404, 400 에러는 정상적인 상황 (사업자 정보 없음)
        if (
          businessOwnerError?.response?.status === 404 ||
          businessOwnerError?.response?.status === 400 ||
          businessOwnerError?.response?.data?.message?.includes(
            "사업자 등록 정보를 찾을 수 없습니다"
          )
        ) {
          console.log("ℹ️ 사업자 정보 없음 - 등록 페이지 표시");
        }
        // 모든 확인 실패 시 등록 페이지 유지
      }
      */

      // 로딩 상태 해제
      setIsCheckingBusinessOwner(false);
    };

    checkBusinessOwnerStatus();
  }, [router]);

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // input 값 초기화
    const fileInput = document.getElementById(
      "business-license"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // 에러 처리 함수
  const handleError = (error: any) => {
    console.error("❌ 사업자 등록 실패:", error);
    console.error("❌ 에러 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    alert("사업자 등록에 실패했습니다. 다시 시도해주세요.");
  };

  const {
    mutate: ResisterBusiness,
    data: resisterBusinessData,
    isPending, // ✅ 업로드 & 분석 중 상태
    error: resisterBusinessError,
  }: UseMutationResult<
    ResisterBusinessResponse,
    Error,
    ResisterBusinessRequest
  > = useResisterBusiness();

  // 서버 응답 확인용
  useEffect(() => {
    if (resisterBusinessData !== undefined) {
      console.log("✅ 서버 응답:", resisterBusinessData);
    }
  }, [resisterBusinessData]);

  // 에러 확인용
  useEffect(() => {
    if (resisterBusinessError) {
      handleError(resisterBusinessError);
    }
  }, [resisterBusinessError]);

  const businessInfo = resisterBusinessData;

  return (
    <>
      {isPending ? (
        // ✅ 사업자등록증 분석 중일 때
        <LoadingAuthentication />
      ) : isCheckingBusinessOwner ? (
        // ✅ 사업자 정보 확인 중일 때
        <Loading />
      ) : (
        // ✅ 일반 등록 페이지
        <div className="h-dvh flex flex-col bg-white max-w-[430px] w-full mx-auto">
          {/* 헤더 */}
          <div className="flex items-center py-4 px-2 flex-shrink-0">
            <button onClick={() => router.push("/signup")} className="p-2">
              <IoArrowBack size={24} />
            </button>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="flex flex-col flex-1 px-4 pt-2 w-full min-h-0">
            <div className="mb-1 w-full flex-shrink-0">
              <span className="text-2xl font-bold text-black">
                Work Snap에 오신 것을
              </span>
              <br />
              <span className="text-2xl font-bold text-black">환영합니다.</span>
              <div className="text-gray3 text-sm mb-4 mt-2 w-full">
                <span className="text-gray3 text-lg font-normal w-full">
                  사장님이시라면
                </span>
                <br />
                <span className="text-gray3 text-lg font-normal w-full">
                  사업자 정보를 올려 주세요.
                </span>
              </div>
            </div>

            {/* 조건부 렌더링: 사업자 정보 표시 또는 이미지 업로드 */}
            {businessInfo ? (
              <BusinessInfoDisplay businessInfo={businessInfo} />
            ) : (
              <ImageUploadSection
                imageFile={imageFile}
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onComplete={ResisterBusiness}
                toBase64={toBase64}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
