"use client";

import { useState, useEffect, useCallback } from "react";
import { useCreateInviteCode } from "../../../../lib/auth/auth.query";
import { UseMutationResult } from "@tanstack/react-query";
import { CreateInvitationCodeRequest } from "../../../../lib/auth/types";
import ToastModal from "../../../components/ToastModal";
import Benner from "@/src/app/components/benner";
import { useUser } from "@/src/lib/queries/useUser";
import { useGetMyWP } from "@/lib/queries/getMyWP";
import Header from "@/app/components/Header";
import { updateWorkPlaceColor } from "@/lib/queries/updateWPColor";

// 색상 값값
const colorMap = ["#eeace3", "#fcdd2c", "#08fd31", "#44d1fc", "#b700ff"];

export default function PtJobPage() {
  const { data: user } = useUser();
  const { data: workPlaces } = useGetMyWP();
  const [localWorkPlaces, setLocalWorkPlaces] = useState(
    (workPlaces?.data ?? []).map((wp) => ({
      ...wp,
      workplaceColorIndex: Number(wp.workplace.workplaceColorIndex),
    }))
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const isVerified = (workPlaces?.data?.length ?? 0) > 0;
  const { mutate: updateColor } = updateWorkPlaceColor();

  // 워크플레이스별 색상 선택 모달 상태
  const [colorSelectingState, setColorSelectingState] = useState<{
    [id: string]: boolean;
  }>({});

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
  }, [isPending, isInitialLoading]);

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

  // workPlaces 동기화 시 숫자 변환 유지
  useEffect(() => {
    setLocalWorkPlaces(
      (workPlaces?.data ?? []).map((wp) => ({
        ...wp,
        workplaceColorIndex: Number(wp.workplace.workplaceColorIndex),
      }))
    );
  }, [workPlaces?.data]);

  // updateColor 실패 대비 (이전 상태 저장 후 롤백)
  const handleColorSelect = (workplaceId: number, index: number) => {
    const prev = localWorkPlaces;
    setLocalWorkPlaces((prev) =>
      prev.map((wp) =>
        String(wp.workplace.id) === String(workplaceId)
          ? { ...wp, workplaceColorIndex: Number(index) }
          : wp
      )
    );
    setColorSelectingState((prev) => ({ ...prev, [workplaceId]: false }));

    updateColor(
      { workplaceId, index },
      {
        onError: () => setLocalWorkPlaces(prev), // 롤백
        // onSuccess: () => refetchMyWP?.(), // 필요 시 새로고침
      }
    );
  };

  return (
    <div className="h-full flex flex-col w-full relative min-h-0">
      <ToastModal
        message="인증코드가 복사되었습니다"
        isVisible={showToast}
        onClose={handleCloseToast}
      />

      <Header />
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
      {!isVerified && (
        <div className="px-4">
          <div className="w-full  mt-4 flex flex-col items-center justify-center py-6 border border-gray2 rounded-2xl bg-gray2 ">
            <div className="text-main text-xl font-bold text-center">
              사장님께서 알바님
              <br /> 인증번호를 등록할 때까지
              <br />
              잠시 기다려주세요.
            </div>
          </div>
        </div>
      )}

      {/* 출근 카드 리스트 */}
      {isVerified && (
        <div className="px-4 mt-4 flex flex-col gap-3 overflow-y-auto">
          {localWorkPlaces.map((wp) => (
            <div
              key={wp.workplace.id}
              className="rounded-xl border border-gray2 p-4 flex justify-between relative mb-3"
            >
              {/* 이름 + 현재 색상 */}
              <div className="flex flex-col gap-2 relative">
                <div className="flex items-center ">
                  <div
                    className="flex mr-2 w-4 h-4 rounded-full cursor-pointer"
                    style={{
                      backgroundColor: colorMap[wp.workplaceColorIndex],
                    }}
                    onClick={() =>
                      setColorSelectingState((prev) => ({
                        ...prev,
                        [wp.workplace.id]: !prev[wp.workplace.id],
                      }))
                    }
                  />
                  <span className="font-bold text-xl text-main">
                    {wp.workplace.workplaceName}
                  </span>
                </div>
                {/* 색상 선택 모달 */}
                {colorSelectingState[wp.workplace.id] && (
                  <div className="absolute top-7 left-[-4px] px-3 py-3 bg-white rounded-xl border-[0.5px] shadow-lg flex gap-2 ">
                    {colorMap.map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-5 h-5 rounded-full cursor-pointer border-2 ${
                          wp.workplaceColorIndex === idx
                            ? "border-gray3"
                            : "border-none"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(wp.workplace.id, idx)}
                      />
                    ))}
                  </div>
                )}
                {/* 여기는 계약 기간 넣어야함 */}
                <span className="text-md text-gray3 font-bold">
                  {wp.contractStartDate} - {wp.contractEndDate}
                </span>
                {/* 같은 시간대 묶어서 요일 순 정렬 + '요일' 제거 */}
                <div className="text-md text-main2 font-bold">
                  {Object.values(
                    wp.schedules.reduce((acc, sch) => {
                      const timeRange = `${sch.startTime.slice(
                        0,
                        5
                      )}~${sch.endTime.slice(0, 5)}`;
                      if (!acc[timeRange]) {
                        acc[timeRange] = { time: timeRange, days: [] };
                      }
                      acc[timeRange].days.push(sch.dayOfWeekKorean);
                      return acc;
                    }, {} as Record<string, { time: string; days: string[] }>)
                  ).map((group, idx) => {
                    const dayOrder = [
                      "월요일",
                      "화요일",
                      "수요일",
                      "목요일",
                      "금요일",
                      "토요일",
                      "일요일",
                    ];
                    const sortedDays = group.days
                      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
                      .map((day) => day.replace("요일", ""));
                    return (
                      <span key={idx}>
                        {sortedDays.join(", ")} {group.time}
                        <br />
                      </span>
                    );
                  })}
                </div>
              </div>

              <button className="flex flex-col items-center justify-center bg-gray2 rounded-lg px-8 text-gray4 text-xs font-semibold">
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
                출근 확인
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
