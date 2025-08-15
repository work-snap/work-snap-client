"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateWP } from "@/src/lib/queries/useCreateWP";
import ToastModal from "@/src/app/components/ToastModal";
import Header from "@/src/app/components/Header";
import BackButton from "@/src/app/components/BackButton";

// 휴대폰 번호 포맷팅 함수
const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');
  
  // 길이에 따라 하이픈 추가
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

export default function Add() {
  const router = useRouter();
  const { mutate: createWorkplace, isPending } = useCreateWP();

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const isFormValid = businessName && phone && description;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setPhone(formattedValue);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const hideToast = () => {
    setIsToastVisible(false);
  };

  const handleRegister = () => {
    createWorkplace(
      {
        workplaceName: businessName,
        workplacePhone: phone,
        workplaceDescription: description,
      },
      {
        onSuccess: (data) => {
          console.log("✅ 등록 성공:", data);
          showToast(`사업장 등록 완료! ID: ${data.id}, 이름: ${data.workplaceName}`);
          router.push("/user/business/add-business");
        },
        onError: (error) => {
          console.error("❌ 등록 실패:", error);
          showToast("등록에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  return (
    <div className="h-full bg-white w-full flex flex-col min-h-0">
      <Header />
      <div className="overflow-y-auto px-5">
        {/* 서브 헤더 */}
        <div className="flex flex-col py-3 gap-5">
          <BackButton />
          <span className="text-2xl font-bold">사업장 등록</span>
        </div>

        <div>

          {/* 메인 컨텐츠 */}
          <div>
            <label className="mb-4">
              <h2 className="text-lg font-bold mb-2">사업장 이름</h2>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="border border-gray2 rounded-lg p-4 w-full focus:outline-none focus:border-gray3"
              />
            </label>

            <label className="mb-4">
              <h2 className="text-lg font-bold mb-2">연락처</h2>
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
                className="border border-gray2 rounded-lg p-4 w-full focus:outline-none focus:border-gray3"
              />
            </label>

            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">사업장 설명</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray2 rounded-lg w-full p-4 flex-1 focus:outline-none focus:border-gray3 resize-none"
                rows={4}
                placeholder="사업장에 대한 설명을 입력해주세요"
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button
          onClick={handleRegister}
          disabled={!isFormValid || isPending}
          className={`w-full py-5 rounded-xl font-bold max-w-[430px] flex items-center justify-center ${isFormValid && !isPending
            ? "bg-main text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {isPending ? "등록 중..." : "사업장 등록하기"}
        </button>
      </div>

      {/* Toast Modal */}
      <ToastModal
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
      />
    </div>
  );
}
