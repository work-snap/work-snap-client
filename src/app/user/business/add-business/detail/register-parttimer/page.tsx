"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Navigation from "@/src/app/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useJoinUser } from "@/src/lib/queries/joinUser";
import { useGetWorkplaceDetail } from "@/src/lib/queries/getWPDetail";
import { useValidateInviteCode } from "@/src/lib/queries/validateInviteCode";
import WorkTimePicker from "@/src/app/components/WorkTimePicker";

export default function RegisterParttimer() {
  const joinUserMutation = useJoinUser();
  const validateInviteCodeMutation = useValidateInviteCode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("idx"));
  const { data, isLoading } = useGetWorkplaceDetail(workplaceId);
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [schedules, setSchedules] = useState<
    { dayOfWeek: string; startTime: string; endTime: string }[]
  >([]);

  const handleValidateCode = async () => {
    if (!code) {
      toast({ title: "인증코드 입력", description: "코드를 입력해주세요." });
      return;
    }
    try {
      const res = await validateInviteCodeMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
      });
      setName(res.data.partTimer.name);
      setPhone(res.data.partTimer.phoneNumber);
      toast({ title: "인증 성공", description: res.message });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "인증 실패",
        description: err?.message || "잠시 후 다시 시도해주세요.",
      });
    }
  };
  const handleSchedulesChange = useCallback(
    (
      newSchedules: { dayOfWeek: string; startTime: string; endTime: string }[]
    ) => {
      setSchedules(newSchedules);
    },
    []
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !name || !phone || schedules.length === 0) {
      toast({
        title: "입력 누락",
        description: "인증코드와 근무 시간을 모두 입력해주세요.",
        duration: 5000,
      });
      return;
    }

    try {
      const res = await joinUserMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
        schedules, // 서버 포맷 그대로
      });

      toast({ title: "등록 완료", description: res.message, duration: 5000 });
      router.push(`/user/business/add-business/detail?idx=${workplaceId}`);
    } catch (err: any) {
      toast({
        title: "등록 실패",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "잠시 후 다시 시도해주세요.",
        duration: 5000,
      });
    }
  };
  return (
    <div className="min-h-screen h-screen flex flex-col max-w-[430px] w-full mx-auto bg-white">
      {/* 헤더 */}
      <header className="flex items-center gap-2 px-4 pt-6 pb-3">
        <h1 className="text-[26px] font-extrabold text-main tracking-tight">
          Work Snap
        </h1>
        <div>
          <span className="bg-main text-gray1 text-xs font-semibold rounded-full px-2 py-1">
            사장님
          </span>
        </div>
      </header>

      {/* 상단 네비게이션 */}
      <div className="flex flex-col px-2 py-2">
        <button
          onClick={() => {
            router.push(`/user/business/add-business/detail?idx=${data?.id}`);
          }}
          className="text-gray5 font-semibold text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="px-2 py-4 font-extrabold text-2xl">알바 등록</span>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 max-h-[1137px] overflow-y-auto pb-[80px]">
        <div className="px-4 mb-2">
          <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray4 font-semibold text-base">
            사업장 : {data?.workplaceName || "-"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 mt-2">
          {/* 인증코드 */}
          <span className="font-semibold text-gray4">인증코드</span>
          <label className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              // required
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="예) 23FK99"
            />
            <button
              type="button"
              onClick={handleValidateCode}
              className="bg-main text-gray1 font-semibold rounded-xl px-8 whitespace-nowrap"
            >
              인증하기
            </button>
          </label>
          {/* 이름 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">이름</span>
            <input
              type="text"
              value={name}
              disabled
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="이름 입력"
            />
          </label>
          {/* 번호 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">번호</span>
            <input
              type="text"
              value={phone}
              disabled
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="예) 010-1234-1234"
            />
          </label>
          {/* 계약 기간 */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray4">계약 기간</span>
            <div className="flex items-center justify-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                // required
                className="border border-gray2 rounded-lg p-2"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                // required
                className="border border-gray2 rounded-lg p-2"
              />
            </div>
          </div>
          <WorkTimePicker onChange={handleSchedulesChange} />
          {/* 등록 버튼 */}
          <div className="w-full pt-6 pb-8">
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
            >
              알바 등록하기
            </Button>
          </div>
        </form>
      </div>

      <Navigation userType="business" />
    </div>
  );
}
