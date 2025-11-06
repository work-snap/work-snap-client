"use client";

import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { ResisterBusinessRequest } from "@/src/lib/auth/types";
import Modal from "@/src/app/components/Modal";

interface ImageUploadSectionProps {
  imageFile: File | null;
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onComplete: (request: ResisterBusinessRequest) => void;
  toBase64: (file: File) => Promise<string>;
  isPending?: boolean;
}

export default function ImageUploadSection({
  imageFile,
  imagePreview,
  onImageUpload,
  onRemoveImage,
  onComplete,
  toBase64,
  isPending = false,
}: ImageUploadSectionProps) {
  // Flutter에서 실행 중인지 동적으로 감지 (채널이 나중에 등록될 수 있음)
  const [isFlutterApp, setIsFlutterApp] = useState(false);

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

  // 채널 존재 여부를 주기적으로 확인
  useEffect(() => {
    const checkChannel = () => {
      const hasChannel =
        typeof window !== "undefined" &&
        (window as any).ImagePickerChannel !== undefined;

      if (hasChannel !== isFlutterApp) {
        console.log(`🔄 [Client] Flutter 앱 감지 상태 변경: ${hasChannel}`);
        setIsFlutterApp(hasChannel);
      }

      return hasChannel;
    };

    // 초기 확인
    checkChannel();

    // 0.5초, 1초, 2초, 3초 후 재확인 (WebView 초기화 지연 대응)
    const timeouts = [500, 1000, 2000, 3000].map((delay) =>
      setTimeout(() => {
        checkChannel();
      }, delay)
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [isFlutterApp]);

  // 🔍 디버깅: 채널 존재 여부 로깅
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("🔍 [Client] 채널 감지 상태:");
      console.log("  - window 객체:", typeof window);
      console.log(
        "  - ImagePickerChannel:",
        typeof (window as any).ImagePickerChannel
      );
      console.log(
        "  - _hasImagePickerChannel:",
        (window as any)._hasImagePickerChannel
      );
      console.log("  - isFlutterApp:", isFlutterApp);

      // 1초 후 다시 확인 (WebView 초기화 지연 대응)
      setTimeout(() => {
        console.log("🔍 [Client] 1초 후 재확인:");
        console.log(
          "  - ImagePickerChannel:",
          typeof (window as any).ImagePickerChannel
        );
        console.log(
          "  - _hasImagePickerChannel:",
          (window as any)._hasImagePickerChannel
        );
      }, 1000);

      // 3초 후 다시 확인
      setTimeout(() => {
        console.log("🔍 [Client] 3초 후 재확인:");
        console.log(
          "  - ImagePickerChannel:",
          typeof (window as any).ImagePickerChannel
        );
        console.log(
          "  - _hasImagePickerChannel:",
          (window as any)._hasImagePickerChannel
        );
      }, 3000);
    }
  }, []);

  // Flutter 앱용 이미지 선택 핸들러
  const handleFlutterImagePick = () => {
    console.log("📸 [Client] Flutter 이미지 선택 요청 시작");
    console.log(
      "  - ImagePickerChannel 타입:",
      typeof (window as any).ImagePickerChannel
    );
    console.log(
      "  - ImagePickerChannel 값:",
      (window as any).ImagePickerChannel
    );

    // ImagePickerChannel 존재 여부 확인
    if (!(window as any).ImagePickerChannel) {
      console.error("❌ [Client] ImagePickerChannel을 찾을 수 없습니다");
      console.error(
        "  - window 객체 키:",
        Object.keys(window).filter((key) => key.includes("Channel"))
      );
      showModal(
        "이미지 선택 기능을 사용할 수 없습니다.\n" +
          "앱을 최신 버전으로 업데이트해주세요.\n" +
          "문제가 지속되면 웹 브라우저에서 이용해주세요.",
        "기능 사용 불가"
      );
      return;
    }

    try {
      const message = JSON.stringify({
        type: "pickImage",
        timestamp: new Date().toISOString(),
      });
      console.log("📤 [Client] 전송할 메시지:", message);

      (window as any).ImagePickerChannel.postMessage(message);
      console.log("✅ [Client] Flutter에 이미지 선택 요청 전송 완료");
    } catch (error) {
      console.error("❌ [Client] Flutter 이미지 선택 요청 실패:", error);
      console.error("  - 에러 상세:", {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      showModal(
        "이미지 선택 요청에 실패했습니다.\n" +
          "앱을 다시 시작하거나 웹 브라우저에서 이용해주세요.",
        "요청 실패"
      );
    }
  };

  // Flutter에서 이미지를 받는 콜백 등록
  useEffect(() => {
    if (isFlutterApp) {
      console.log("🔧 Flutter 이미지 콜백 등록 중...");

      // Flutter에서 이미지를 받았을 때 호출되는 함수
      (window as any).handleNativeImagePicked = async (dataUrl: string) => {
        console.log(
          "📸 Flutter에서 이미지 수신:",
          `길이: ${dataUrl?.length || 0}, 시작: ${
            dataUrl?.substring(0, 50) || "undefined"
          }...`
        );

        try {
          // Base64 데이터 유효성 검증
          if (!dataUrl) {
            throw new Error("이미지 데이터가 비어있습니다.");
          }

          if (!dataUrl.startsWith("data:image/")) {
            console.error("❌ 잘못된 데이터 형식:", dataUrl.substring(0, 100));
            throw new Error("유효하지 않은 이미지 데이터입니다.");
          }

          console.log("✅ Base64 데이터 유효성 검증 통과");

          // Base64를 Blob으로 변환 (fetch() 대신 직접 변환 - Android WebView CSP 우회)
          const base64Data = dataUrl.split(",")[1];
          const mimeType = dataUrl.split(";")[0].split(":")[1];

          console.log("🔄 Base64 디코딩 시작...");
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });

          console.log("✅ Blob 변환 완료:", blob.size, "bytes");

          // 파일 크기 검증 (10MB)
          const MAX_FILE_SIZE = 10 * 1024 * 1024;
          if (blob.size > MAX_FILE_SIZE) {
            showModal(
              "파일 크기는 10MB를 초과할 수 없습니다.\n더 작은 이미지를 선택해주세요.",
              "파일 크기 초과"
            );
            return;
          }

          // Blob을 File 객체로 변환
          const file = new File([blob], "business-license.jpg", {
            type: blob.type || "image/jpeg",
          });

          console.log("✅ 이미지 File 객체 생성 완료:", {
            name: file.name,
            size: file.size,
            type: file.type,
          });

          // 기존 핸들러 호출 (미리보기 생성)
          const syntheticEvent = {
            target: {
              files: [file],
            },
          } as any;

          onImageUpload(syntheticEvent);
          console.log("✅ 이미지 업로드 핸들러 호출 완료");
        } catch (error) {
          console.error("❌ 이미지 변환 실패:", error);
          showModal(
            "이미지 처리에 실패했습니다.\n" +
              (error instanceof Error ? error.message : "다시 시도해주세요."),
            "처리 실패"
          );
        }
      };

      // 이미지 선택 취소 콜백
      (window as any).handleNativeImageCancelled = () => {
        console.log("ℹ️ 이미지 선택이 취소되었습니다");
      };

      // 에러 콜백
      (window as any).handleNativeImageError = (error: string) => {
        console.error("❌ 이미지 선택 오류:", error);

        // 사용자에게 더 구체적인 에러 메시지 표시
        let errorMessage = "이미지 선택 중 오류가 발생했습니다.";
        let errorTitle = "오류 발생";

        if (error.includes("permission") || error.includes("권한")) {
          errorMessage =
            "갤러리 접근 권한이 필요합니다.\n기기 설정에서 Work Snap 앱의 권한을 확인해주세요.";
          errorTitle = "권한 필요";
        } else if (error.includes("size") || error.includes("크기")) {
          errorMessage =
            "이미지 파일이 너무 큽니다.\n더 작은 이미지를 선택해주세요.";
          errorTitle = "파일 크기 초과";
        } else if (error.includes("format") || error.includes("형식")) {
          errorMessage =
            "지원하지 않는 이미지 형식입니다.\nJPG 또는 PNG 파일을 선택해주세요.";
          errorTitle = "형식 오류";
        }

        showModal(
          errorMessage + "\n\n문제가 지속되면 다시 시도해주세요.",
          errorTitle
        );
      };

      console.log("✅ Flutter 이미지 콜백 등록 완료");
    }

    // cleanup
    return () => {
      if (isFlutterApp) {
        delete (window as any).handleNativeImagePicked;
        delete (window as any).handleNativeImageCancelled;
        delete (window as any).handleNativeImageError;
        console.log("🧹 Flutter 이미지 콜백 정리 완료");
      }
    };
  }, [isFlutterApp, onImageUpload]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h2 className="font-medium mb-3 text-lg flex-shrink-0">
        사업자등록증 확인
      </h2>

      <div className="flex-1 overflow-y-auto pb-24">
        {imagePreview ? (
          // 이미지 미리보기 표시
          <div className="relative w-full border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="사업자등록증 미리보기"
              className="w-full h-auto max-h-96 object-contain"
            />
            <div className="absolute top-2 right-2">
              <button
                onClick={onRemoveImage}
                className="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{imageFile?.name}</span>
                <label
                  htmlFor="business-license"
                  className="text-sm text-main cursor-pointer hover:underline"
                >
                  다시 선택
                </label>
              </div>
            </div>
            <input
              id="business-license"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </div>
        ) : isFlutterApp ? (
          // Flutter 앱용 버튼
          <button
            type="button"
            onClick={handleFlutterImagePick}
            disabled={isPending}
            className="block w-full border border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {isPending && " (처리 중...)"}
            </span>
          </button>
        ) : (
          // 웹 브라우저용 이미지 업로드 버튼
          <label
            htmlFor="business-license"
            className="block w-full border border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-main transition-colors"
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
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white max-w-[430px] mx-auto">
        <button
          className={`w-full py-5 rounded-lg ${
            imageFile && !isPending
              ? "bg-main text-white"
              : "bg-gray-100 text-gray-400"
          }`}
          disabled={!imageFile || isPending}
          onClick={async () => {
            if (!imageFile || isPending) return;

            try {
              const base64Image = await toBase64(imageFile);
              if (base64Image) {
                onComplete({
                  businessRegistrationImage: base64Image,
                });
              }
            } catch (error) {
              console.error("❌ 이미지 변환 실패:", error);
              showModal(
                "이미지 변환에 실패했습니다. 다시 시도해주세요.",
                "변환 실패"
              );
            }
          }}
        >
          {isPending ? "등록 중..." : "등록하기"}
        </button>
      </div>

      {/* 에러 모달 */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
}
