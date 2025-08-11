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

export default function BusinessSignupStep1() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);

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
      setImageFile(e.target.files[0]);
    }
  };

  const {
    mutate: ResisterBusiness,
    data: resisterBusinessData,
    isPending, // ✅ 업로드 & 분석 중 상태
  }: UseMutationResult<
    ResisterBusinessResponse,
    Error,
    ResisterBusinessRequest
  > = useResisterBusiness();

  // 서버 응답 확인용
  useEffect(() => {
    if (resisterBusinessData !== undefined) {
      console.log("서버 응답:", resisterBusinessData);
    }
  }, [resisterBusinessData]);

  const businessInfo = resisterBusinessData;

  return (
    <>
      {isPending ? (
        // ✅ 업로드 후 서버 분석 중일 때
        <LoadingAuthentication />
      ) : (
        <div className="min-h-screen flex flex-col bg-white max-w-[430px] w-full mx-auto">
          {/* 헤더 */}
          <div className="flex items-center py-4 px-2">
            <button onClick={() => router.push("/signup")} className="p-2">
              <IoArrowBack size={24} />
            </button>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="flex flex-col items-start px-4 pt-2 w-full">
            <div className="mb-1 w-full">
              <span className="text-2xl font-bold text-black">
                Work Snap에 오신 것을
              </span>
              <br />
              <span className="text-2xl font-bold text-black">환영합니다.</span>
              <div className="text-gray3 text-sm mb-10 mt-2 w-full">
                <span className="text-gray3 text-lg font-normal w-full">
                  사장님이시라면
                </span>
                <br />
                <span className="text-gray3 text-lg font-normal w-full">
                  사업자 정보를 올려 주세요.
                </span>
              </div>
            </div>

            {/* 사업자등록증 업로드 섹션 또는 사업자 정보 표시 */}
            {businessInfo ? (
              <div className="w-full">
                <h2 className="font-medium mb-3 text-lg">사업자등록증 확인</h2>
                <div className="block w-full border border-gray-200 rounded-lg p-6 text-center">
                  <span className="text-gray3 text-sm">
                    사업자등록증 업로드 완료
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
                    상호 : {businessInfo.businessName || "-"}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
                    성명 : {businessInfo.ownerName || "-"}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
                    사업장소재지 : {businessInfo.businessAddress || "-"}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
                    업태 : {businessInfo.businessType || "-"}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
                    사업 설명 : {businessInfo.businessDescription || "-"}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
                    직원 수 : {businessInfo.employeeCount ?? "-"}
                  </div>
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4">
                  <button
                    onClick={() =>
                      router.push("/signup/business/success-signup")
                    }
                    className="w-full py-5 rounded-lg bg-main text-white"
                  >
                    가입 완료
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <h2 className="font-medium mb-3 text-lg">사업자등록증 확인</h2>
                <label
                  htmlFor="business-license"
                  className="block w-full border border-gray-200 rounded-lg p-6 text-center cursor-pointer"
                >
                  <div className="flex justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 62.5 56.25"
                    >
                      <path
                        id="photo_camera_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24"
                        d="M111.25-794.687a13.561,13.561,0,0,0,9.961-4.1,13.561,13.561,0,0,0,4.1-9.961,13.561,13.561,0,0,0-4.1-9.961,13.561,13.561,0,0,0-9.961-4.1,13.561,13.561,0,0,0-9.961,4.1,13.561,13.561,0,0,0-4.1,9.961,13.561,13.561,0,0,0,4.1,9.961A13.561,13.561,0,0,0,111.25-794.687Zm0-6.25A7.544,7.544,0,0,1,105.7-803.2a7.544,7.544,0,0,1-2.266-5.547A7.544,7.544,0,0,1,105.7-814.3a7.543,7.543,0,0,1,5.547-2.266A7.543,7.543,0,0,1,116.8-814.3a7.544,7.544,0,0,1,2.266,5.547A7.544,7.544,0,0,1,116.8-803.2,7.544,7.544,0,0,1,111.25-800.937Zm-25,17.188a6.018,6.018,0,0,1-4.414-1.836A6.018,6.018,0,0,1,80-790v-37.5a6.018,6.018,0,0,1,1.836-4.414,6.018,6.018,0,0,1,4.414-1.836h9.844l5.781-6.25h18.75l5.781,6.25h9.844a6.018,6.018,0,0,1,4.414,1.836A6.018,6.018,0,0,1,142.5-827.5V-790a6.018,6.018,0,0,1-1.836,4.414,6.018,6.018,0,0,1-4.414,1.836Zm0-6.25h50v-37.5H123.594l-5.7-6.25H104.609l-5.7,6.25H86.25ZM111.25-808.75Z"
                        transform="translate(-80 840)"
                        fill="#aaa"
                      />
                    </svg>
                  </div>
                  <span className="text-gray3 text-sm">
                    사업자등록증 사진 등록하기
                  </span>
                  <input
                    id="business-license"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          {!businessInfo && (
            <div className="fixed bottom-0 left-0 right-0 p-4">
              <button
                className={`w-full py-5 rounded-lg ${
                  imageFile ? "bg-main text-white" : "bg-gray-100 text-gray-400"
                }`}
                disabled={!imageFile}
                onClick={async () => {
                  if (!imageFile) return;

                  const base64Image = await toBase64(imageFile);
                  if (base64Image) {
                    ResisterBusiness({
                      businessRegistrationImage: base64Image,
                    });
                  }
                }}
              >
                가입 완료
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
