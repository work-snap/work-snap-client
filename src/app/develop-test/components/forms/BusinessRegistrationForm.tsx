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
    <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-orange-100/50 shadow-lg relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-400/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-amber-400/20 rounded-full blur-xl"></div>

      <form onSubmit={onSubmit} className="space-y-6 relative">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">📄</span>
          </div>
          <h5 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
            사업자 등록 신청
          </h5>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            사업자등록증 이미지
            <span className="text-red-500 ml-1">*</span>
          </label>

          {/* 이미지 업로드 영역 */}
          <div className="space-y-6">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-orange-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-500 file:to-amber-500 file:text-white hover:file:from-orange-600 hover:file:to-amber-600 file:cursor-pointer file:shadow-md"
              />
            </div>

            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-orange-100/50 shadow-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    이미지 미리보기
                  </div>
                </div>
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="사업자등록증 미리보기"
                    className="max-w-full h-48 object-contain border-2 border-orange-200/50 rounded-xl shadow-lg bg-white/50"
                  />
                  <button
                    type="button"
                    onClick={onImageRemove}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 hover:scale-110"
                    title="이미지 제거"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Base64 데이터 확인용 */}
            {form.businessRegistrationImage && (
              <div className="backdrop-blur-sm bg-gray-50/60 rounded-xl p-4 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔍</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-600">
                    Base64 데이터 확인 (개발자용 - 처음 100자)
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-gray-200/50 text-xs font-mono text-gray-700 break-all leading-relaxed">
                  {form.businessRegistrationImage.substring(0, 100)}...
                </div>
              </div>
            )}

            {/* 테스트용 더미 이미지 버튼 */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleDummyImage}
                className="group relative px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>테스트용 더미 이미지 사용</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading === "business-registration"}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-lg"
        >
          {loading === "business-registration" ? (
            <span className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>등록 중...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-3">
              <span>🏢</span>
              <span>사업자 등록 신청</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
