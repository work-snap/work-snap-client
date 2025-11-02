"use client";

import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { ResisterBusinessRequest } from "@/src/lib/auth/types";

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
  // Flutter에서 실행 중인지 감지
  const isFlutterApp =
    typeof window !== "undefined" &&
    (window as any).ImagePickerChannel !== undefined;

  // Flutter 앱용 이미지 선택 핸들러
  const handleFlutterImagePick = () => {
    console.log("📸 Flutter 이미지 선택 요청");
    if ((window as any).ImagePickerChannel) {
      try {
        (window as any).ImagePickerChannel.postMessage(
          JSON.stringify({
            type: "pickImage",
            timestamp: new Date().toISOString(),
          })
        );
        console.log("✅ Flutter에 이미지 선택 요청 전송 완료");
      } catch (error) {
        console.error("❌ Flutter 이미지 선택 요청 실패:", error);
        alert("이미지 선택 요청에 실패했습니다.");
      }
    } else {
      console.error("❌ ImagePickerChannel을 찾을 수 없습니다");
      alert("이미지 선택 기능을 사용할 수 없습니다.");
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
          dataUrl.substring(0, 50) + "..."
        );

        try {
          // Base64 데이터를 Blob으로 변환
          const response = await fetch(dataUrl);
          const blob = await response.blob();

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
          alert("이미지 처리에 실패했습니다. 다시 시도해주세요.");
        }
      };

      // 이미지 선택 취소 콜백
      (window as any).handleNativeImageCancelled = () => {
        console.log("ℹ️ 이미지 선택이 취소되었습니다");
      };

      // 에러 콜백
      (window as any).handleNativeImageError = (error: string) => {
        console.error("❌ 이미지 선택 오류:", error);
        alert("이미지 선택 중 오류가 발생했습니다. 다시 시도해주세요.");
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
      <h2 className="font-medium mb-3 text-lg flex-shrink-0">사업자등록증 확인</h2>
      
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
                <span className="text-sm text-gray-600">
                  {imageFile?.name}
                </span>
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
              alert("이미지 변환에 실패했습니다. 다시 시도해주세요.");
            }
          }}
        >
          {isPending ? "등록 중..." : "등록하기"}
        </button>
      </div>
    </div>
  );
}
