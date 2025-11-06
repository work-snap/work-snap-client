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
import { useUserStore } from "@/src/stores/userStore";
import { useChangeUserType } from "@/lib/queries/changeUserType";
import { getUser } from "@/lib/api/user";
import LoadingAuthentication from "@/src/app/components/loadingAuthentication";
import Loading from "@/src/app/components/loading";
import Modal from "@/src/app/components/Modal";
import { ImageUploadSection } from "./components";

export default function BusinessSignupStep1() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCheckingBusinessOwner, setIsCheckingBusinessOwner] = useState(false);

  // 모달 상태 관리
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // 모달 열기 함수
  const showModal = (message: string, title?: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: "",
      message: "",
    });
  };

  // Zustand 스토어에서 사업자 등록 관련 액션 가져오기
  const { setBusinessRegistrationResponse, setUser } = useUserStore();

  // 사용자 타입 변경 훅
  const changeUserTypeMutation = useChangeUserType();

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
          (verificationResponse.data.verificationStatus === "APPROVED" ||
            verificationResponse.data.verificationStatus === "VERIFIED")
        ) {
          console.log(
            "✅ 사업자 검증 상태 승인됨 - 사업자 정보 확인 페이지로 리다이렉트"
          );
          router.replace("/signup/business/info");
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
      reader.onload = () => {
        const result = reader.result as string;
        if (!result || result.length === 0) {
          reject(new Error("이미지 변환에 실패했습니다."));
        } else {
          resolve(result);
        }
      };
      reader.onerror = (error) => {
        console.error("❌ FileReader 에러:", error);
        reject(new Error("이미지 파일을 읽는 중 오류가 발생했습니다."));
      };
    });
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 파일 크기 검증 (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        showModal("파일 크기는 10MB를 초과할 수 없습니다.", "파일 크기 초과");
        return;
      }

      // 파일 형식 검증
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        showModal("JPG, PNG 형식의 이미지만 업로드 가능합니다.", "형식 오류");
        return;
      }

      console.log("✅ 이미지 파일 검증 통과:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      setImageFile(file);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.onerror = (error) => {
        console.error("❌ 파일 읽기 오류:", error);
        showModal(
          "이미지 파일을 읽는 중 오류가 발생했습니다.",
          "파일 읽기 오류"
        );
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
    showModal(
      "이미 등록된 사업자등록번호입니다. 다시 시도해주세요.",
      "등록 실패"
    );
  };

  const {
    mutate: ResisterBusiness,
    isPending, // ✅ 업로드 & 분석 중 상태
    error: resisterBusinessError,
  }: UseMutationResult<
    ResisterBusinessResponse,
    Error,
    ResisterBusinessRequest
  > = useResisterBusiness();

  // 사업자 등록 성공 시 info 페이지로 리다이렉트
  const handleBusinessRegistration = (request: ResisterBusinessRequest) => {
    ResisterBusiness(request, {
      onSuccess: (data) => {
        console.log("✅ 사업자 등록 성공:", data);
        // Zustand 스토어에 사업자 등록 응답 데이터 저장
        setBusinessRegistrationResponse(data);
        console.log("✅ 사업자 등록 성공 - info 페이지로 이동");
        router.push("/signup/business/info");
      },
      onError: (error) => {
        console.error("❌ 사업자 등록 실패:", error);
        handleError(error);
      },
    });
  };

  // 뒤로가기 버튼 핸들러: userType을 PENDING으로 변경
  const handleBackToSignup = async () => {
    try {
      console.log("🔄 사용자 타입을 PENDING으로 변경 중...");

      await new Promise<void>((resolve, reject) => {
        changeUserTypeMutation.mutate(
          { userType: "PENDING" },
          {
            onSuccess: async () => {
              console.log("✅ 사용자 타입 PENDING으로 변경 성공");

              // 최신 사용자 정보를 다시 로드하여 Zustand 스토어 업데이트
              try {
                const userData = await getUser();
                setUser(userData);
                console.log("✅ 사용자 정보 업데이트 완료");

                // /signup 페이지로 이동
                router.push("/signup");
                resolve();
              } catch (error) {
                console.error("❌ 사용자 정보 로드 실패:", error);
                reject(error);
              }
            },
            onError: (error) => {
              console.error("❌ 사용자 타입 변경 실패:", error);
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error("❌ 뒤로가기 처리 중 오류:", error);
      // 실패해도 페이지 이동은 시도
      router.push("/signup");
    }
  };

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
            <button
              onClick={handleBackToSignup}
              className="p-2"
              disabled={changeUserTypeMutation.isPending}
            >
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

            {/* 이미지 업로드 섹션 */}
            <ImageUploadSection
              imageFile={imageFile}
              imagePreview={imagePreview}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              onComplete={handleBusinessRegistration}
              toBase64={toBase64}
              isPending={isPending}
            />
          </div>
        </div>
      )}

      {/* 에러 모달 */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
      />
    </>
  );
}
