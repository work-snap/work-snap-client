"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateWP } from "@/src/lib/queries/useCreateWP";
import ToastModal from "@/src/app/components/ToastModal";

// 휴대폰 번호 포맷팅 유틸리티
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, "");

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
    7,
    11
  )}`;
};

/**
 * 사업장 등록 폼 (Client Component)
 * - 사용자 입력 처리
 * - API mutation 실행
 */
export default function AddBusinessForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: createWorkplace, isPending } = useCreateWP();

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const isFormValid =
    businessName.trim() && phone.length >= 12 && description.trim();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setPhone(formattedValue);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const handleRegister = () => {
    if (!isFormValid) return;

    createWorkplace(
      {
        workplaceName: businessName,
        workplacePhone: phone,
        workplaceDescription: description,
      },
      {
        onSuccess: (data) => {
          console.log("✅ 등록 성공:", data);
          showToast(`사업장 등록 완료! ${data.workplaceName}`);

          // 🔄 사업장 목록 캐시 무효화 (새로 등록된 사업장이 바로 표시되도록)
          queryClient.invalidateQueries({ queryKey: ["myWorkplaces"] });

          // 1초 후 목록 페이지로 이동
          setTimeout(() => {
            router.push("/user/business/add-business");
          }, 1000);
        },
        onError: (error) => {
          console.error("❌ 등록 실패:", error);
          showToast("올바른 전화번호를 입력해주세요.");
        },
      }
    );
  };

  return (
    <>
      {/* 입력 폼 영역 */}
      <div className="space-y-4">
        {/* 사업장 이름 */}
        <label className="block">
          <h2 className="text-lg font-bold mb-2">사업장 이름</h2>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="border border-gray2 rounded-lg p-4 w-full focus:outline-none focus:border-gray3"
            disabled={isPending}
          />
        </label>

        {/* 연락처 */}
        <label className="block">
          <h2 className="text-lg font-bold mb-2">연락처</h2>
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            maxLength={13}
            className="border border-gray2 rounded-lg p-4 w-full focus:outline-none focus:border-gray3"
            disabled={isPending}
          />
        </label>

        {/* 사업장 설명 */}
        <div>
          <h2 className="text-lg font-bold mb-2">사업장 설명</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="사업장에 대한 설명을 입력해주세요"
            className="border border-gray2 rounded-lg w-full p-4 focus:outline-none focus:border-gray3 resize-none"
            rows={4}
            disabled={isPending}
          />
        </div>
      </div>

      {/* 하단 버튼 (고정) */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white max-w-[430px] mx-auto">
        <button
          onClick={handleRegister}
          disabled={!isFormValid || isPending}
          className={`w-full py-5 rounded-xl font-bold transition-colors ${
            isFormValid && !isPending
              ? "bg-main text-white hover:bg-main/90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isPending ? "등록 중..." : "사업장 등록하기"}
        </button>
      </div>

      {/* Toast Notification */}
      <ToastModal
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </>
  );
}
