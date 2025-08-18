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
import LoadingAuthentication from "@/src/app/components/loadingAuthentication";
import { BusinessInfoDisplay, ImageUploadSection } from "./components";

export default function BusinessSignupStep1() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 인증 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    console.log("🔐 인증 상태 확인:", {
      token: token ? "존재함" : "없음",
      user: user ? JSON.parse(user) : "없음"
    });
  }, []);

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
      headers: error.response?.headers
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
        // ✅ 업로드 후 서버 분석 중일 때
        <LoadingAuthentication />
      ) : (
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
