"use client";

import { IoClose } from "react-icons/io5";
import { ResisterBusinessRequest } from "@/src/lib/auth/types";

interface ImageUploadSectionProps {
  imageFile: File | null;
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onComplete: (request: ResisterBusinessRequest) => void;
  toBase64: (file: File) => Promise<string>;
}

export default function ImageUploadSection({
  imageFile,
  imagePreview,
  onImageUpload,
  onRemoveImage,
  onComplete,
  toBase64,
}: ImageUploadSectionProps) {
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
        ) : (
          // 이미지 업로드 버튼
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
            imageFile ? "bg-main text-white" : "bg-gray-100 text-gray-400"
          }`}
          disabled={!imageFile}
          onClick={async () => {
            if (!imageFile) return;

            const base64Image = await toBase64(imageFile);
            if (base64Image) {
              onComplete({
                businessRegistrationImage: base64Image,
              });
            }
          }}
        >
          등록하기
        </button>
      </div>
    </div>
  );
}
