import React from "react";
import { BusinessOwnerRegistrationForm, LoadingState } from "../../lib/types";
import {
  validateImageFile,
  fileToBase64,
  DUMMY_IMAGE_BASE64,
} from "../../lib/utils";

interface BusinessRegistrationFormProps {
  form: BusinessOwnerRegistrationForm;
  imagePreview: string | null;
  loading: LoadingState;
  onFormUpdate: (updates: Partial<BusinessOwnerRegistrationForm>) => void;
  onImageSet: (base64: string, preview?: string) => void;
  onImageRemove: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BusinessRegistrationForm: React.FC<
  BusinessRegistrationFormProps
> = ({
  form,
  imagePreview,
  loading,
  onFormUpdate,
  onImageSet,
  onImageRemove,
  onSubmit,
}) => {
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      const base64String = await fileToBase64(file);
      onImageSet(base64String, base64String);
    } catch (error) {
      alert("파일 변환 중 오류가 발생했습니다.");
    }
  };

  const handleDummyImage = () => {
    onImageSet(DUMMY_IMAGE_BASE64);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 bg-white rounded border space-y-4">
      <h5 className="font-medium text-orange-700">사업자 등록 신청</h5>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          사업자등록증 이미지 <span className="text-red-500">*</span>
        </label>

        {/* 이미지 업로드 영역 */}
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* 이미지 미리보기 */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="사업자등록증 미리보기"
                className="max-w-full h-48 object-contain border rounded"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              >
                ×
              </button>
            </div>
          )}

          {/* Base64 데이터 확인용 (개발자용) */}
          {form.businessRegistrationImage && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">
                Base64 데이터 (처음 100자):
              </div>
              <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                {form.businessRegistrationImage.substring(0, 100)}...
              </div>
            </div>
          )}

          {/* 테스트용 더미 이미지 버튼 */}
          <button
            type="button"
            onClick={handleDummyImage}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            테스트용 더미 이미지 사용
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading === "business-registration"}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
      >
        {loading === "business-registration"
          ? "등록 중..."
          : "사업자 등록 신청"}
      </button>
    </form>
  );
};
