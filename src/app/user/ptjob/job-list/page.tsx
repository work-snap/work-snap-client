"use client";

import Navigation from "../../../components/navigation";
import { useState, useEffect, useCallback } from "react";
import { useCreateInviteCode } from "../../../../lib/auth/auth.query";
import { UseMutationResult } from "@tanstack/react-query";
import { CreateInvitationCodeRequest } from "../../../../lib/auth/types";
import ToastModal from "../../../components/ToastModal";
import Benner from "@/src/app/components/benner";
import { useUser } from "@/src/lib/queries/useUser";

export default function PtJobPage() {
  const { data: user } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const {
    mutate: createInviteCode,
    data: inviteCodeData,
    isPending,
  }: UseMutationResult<
    CreateInvitationCodeRequest,
    Error,
    void
  > = useCreateInviteCode();

  useEffect(() => {
    if (!isPending && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (!inviteCodeData?.data?.inviteCode) {
      createInviteCode();
    }
  }, [inviteCodeData, createInviteCode]);

  const handleCopy = useCallback(() => {
    if (inviteCodeData?.data?.inviteCode) {
      navigator.clipboard.writeText(inviteCodeData.data.inviteCode);
      setShowToast(true);
    }
  }, [inviteCodeData?.data?.inviteCode]);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-[430px] w-full mx-auto relative pb-[80px]">
      <ToastModal
        message="인증코드가 복사되었습니다"
        isVisible={showToast}
        onClose={handleCloseToast}
      />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-[26px] font-extrabold text-main tracking-tight">
          Work Snap
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-bold text-gray5">
            {user?.data.nickname}
          </span>
          <span className="bg-main2 text-gray1 text-xs font-semibold rounded-full px-2 py-1">
            알바님
          </span>
        </div>
      </header>
      {/* 배너 */}
      <Benner />
      {/* 인증코드 */}
      <div className="px-4 mt-2">
        <div className="flex items-center w-full">
          <span className="text-m text-gray4 font-bold mr-2 whitespace-nowrap">
            인증코드
          </span>
          <div className="flex-1 flex items-center rounded-lg px-3 py-2 shadow-sm border border-gray2">
            <span className="flex-1 text-2xl text-gray3 text-center select-all">
              {isPending || isInitialLoading
                ? "로딩중..."
                : inviteCodeData?.data?.inviteCode || "코드 생성 실패"}
            </span>
            <div className="flex gap-2">
              <button
                className="ml-2"
                onClick={handleCopy}
                disabled={
                  isPending ||
                  isInitialLoading ||
                  !inviteCodeData?.data?.inviteCode
                }
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <rect
                    x="5.5"
                    y="3.5"
                    width="11"
                    height="13"
                    rx="2.5"
                    stroke="#AAAAAA"
                  />
                  <path
                    d="M3.5 6.5v8A2.5 2.5 0 0 0 6 17h6.5"
                    stroke="#AAAAAA"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 대기 메시지 */}
      <div className="px-4 mt-4 flex flex-col items-center justify-center py-8 waiting-message">
        <div className="text-gray4 text-base font-medium text-center mb-4">
          사장님께서 알바님 인증번호를 등록할 때까지
          <br />
          잠시 기다려주세요.
        </div>
        <button
          onClick={() => {
            document.querySelector(".waiting-message")?.classList.add("hidden");
            document.querySelector(".card-list")?.classList.remove("hidden");
          }}
          className="bg-main text-white rounded-lg px-6 py-3 text-sm font-semibold"
        >
          인증 완료
        </button>
      </div>

      {/* 출근 카드 리스트 (인증 완료 후 표시) */}
      <div
        className={`px-4 mt-4 flex flex-col gap-3 card-list${
          isVisible ? "" : " hidden"
        }`}
      >
        {/* 카드 1 */}
        <div className="rounded-xl border border-gray2 p-4 flex items-center justify-between">
          <div>
            <div className="text-main font-bold text-base">
              스타벅스 해운대점
            </div>
            <div className="text-xs text-gray3 font-medium mt-1">
              2025.02.01 - 2025.06.01
            </div>
            <div className="text-xs text-gray4 mt-1 font-bold">
              월.수.목 <span className="text-gray5 ml-1">13:00 - 16:00</span>
            </div>
          </div>
          <button className="flex flex-col items-center justify-center bg-gray2 rounded-lg px-4 text-gray4 text-xs font-semibold py-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#FA6956"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
              />
            </svg>
            근무 확인
          </button>
        </div>
        {/* 카드 2 */}
        <div className="rounded-xl border border-gray2 p-4 flex items-center justify-between">
          <div>
            <div className="text-main font-bold text-base">
              메가커피 해운대점
            </div>
            <div className="text-xs text-gray3 font-medium mt-1">
              2025.02.01 - 2025.06.01
            </div>
            <div className="text-xs text-gray4 mt-1 font-bold">
              월.수.목 <span className="text-gray5 ml-1">13:00 - 16:00</span>
            </div>
          </div>
          <button className="flex flex-col items-center justify-center bg-gray2 rounded-lg px-4 py-4 text-gray4 text-xs font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#FA6956"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
              />
            </svg>
            근무 확인
          </button>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
