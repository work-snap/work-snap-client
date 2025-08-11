"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/src/app/components/navigation";
import { useCreateWP } from "@/src/lib/queries/useCreateWP";

export default function Add() {
  const router = useRouter();
  const { mutate: createWorkplace, isPending } = useCreateWP();

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const isFormValid = businessName && phone && description;

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
          alert(
            `사업장 등록 완료! ID: ${data.id}, 이름: ${data.workplaceName}`
          );
          router.push("/user/business/add-business");
        },
        onError: (error) => {
          console.error("❌ 등록 실패:", error);
          alert("등록에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white max-w-[430px] mx-auto">
      {/* Work Snap 헤더 */}
      <header className="flex items-center gap-2  px-5 pt-6 pb-3">
        <h1 className="text-main text-[26px] font-extrabold tracking-tight">
          Work Snap
        </h1>
        <div className="flex items-center gap-2">
          <span className="bg-main text-gray1 text-xs font-semibold rounded-full px-2 py-1">
            사장님
          </span>
        </div>
      </header>

      {/* 서브 헤더 */}
      <div className="flex flex-col px-3 py-3 gap-5">
        <button
          onClick={() => router.push("/user/business/add-business")}
          className="mr-10 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="text-xl font-bold ml-2">사업장 등록</span>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-5 mt-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">사업장 이름</h2>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="border border-gray2 rounded-lg p-4 w-full focus:outline-none focus:border-gray3"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">연락처</h2>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray2 rounded-lg p-4 w-full focus:outline-none focus:border-gray3"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">사업장 설명</h2>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray2 rounded-lg p-4 w-full py-14 focus:outline-none focus:border-gray3"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-[130px] left-0 right-0 px-6">
        <button
          onClick={handleRegister}
          disabled={!isFormValid || isPending}
          className={`w-full py-5 rounded-xl font-bold max-w-[430px] mx-auto flex items-center justify-center ${
            isFormValid && !isPending
              ? "bg-main text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isPending ? "등록 중..." : "사업장 등록하기"}
        </button>
      </div>

      <Navigation />
    </div>
  );
}
