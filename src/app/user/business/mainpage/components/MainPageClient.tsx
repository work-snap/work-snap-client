"use client";

import WorkplaceDropdown from "@/app/attendance/add-work/components/WorkplaceDropdown";
import { Suspense, useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { workplaceTestApis } from "@/app/develop-test/lib/api";
import { useUserStore } from "@/stores/userStore";
import { useUser } from "@/lib/queries/useUser";
import Loading from "@/app/components/loading";
import TimelineDisplay, { TimelineSkeleton } from "./TimelineDisplay";

interface WorkplaceSummary {
  id: number;
  workplaceName: string;
  workplaceType: string | null;
  workplaceAddress: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  workplaceColorIndex: number;
}

interface AddWorkForm {
  date: string;
  workplaceId: number | null;
  startTime: string;
  endTime: string;
  notes: string;
}

export default function MainPageClient() {
  const {
    user: storeUser,
    isLoading: storeIsLoading,
    isBusinessVerified,
  } = useUserStore();
  const { data: user, isLoading: userIsLoading, error: userError } = useUser();

  const [form, setForm] = useState<AddWorkForm>({
    date: getTodayDate(),
    workplaceId: null,
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [currentDay, setCurrentDay] = useState(new Date());

  // 하루 단위 이전/다음
  const prevDay = () => {
    const newDate = subDays(currentDay, 1);
    setCurrentDay(newDate);
    setForm((prev) => ({ ...prev, date: format(newDate, "yyyy-MM-dd") }));
  };

  const nextDay = () => {
    const newDate = addDays(currentDay, 1);
    setCurrentDay(newDate);
    setForm((prev) => ({ ...prev, date: format(newDate, "yyyy-MM-dd") }));
  };

  const handleInputChange = (field: keyof AddWorkForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 사업장 목록 조회
  const {
    data: workplacesData,
    isLoading: isWorkplacesLoading,
    isError: isWorkplacesError,
  } = useQuery({
    queryKey: ["myWorkplaces"],
    queryFn: async () => {
      const res = await workplaceTestApis.getWorkplaces();
      return res.data.workplaces.map((wp: any) => ({
        id: wp.id,
        workplaceName: wp.workplaceName,
        workplaceType: wp.workplaceType,
        workplaceAddress: wp.workplaceAddress,
        isMainWorkplace: wp.isMainWorkplace,
        isActive: wp.isActive,
        workplaceColorIndex: wp.workplaceColorIndex,
      })) as WorkplaceSummary[];
    },
  });

  // 전체 로딩 상태 통합 (타임라인은 독립적으로 로딩)
  const isPageLoading = storeIsLoading || userIsLoading || isWorkplacesLoading;

  // 로딩 중이거나 사용자 정보가 아직 로드되지 않은 경우 로딩 표시
  if (isPageLoading || !user) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // 사용자 에러가 있는 경우
  if (userError) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <p>사용자 정보를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  // 사용자 타입이 사업자가 아닌 경우 접근 제한
  if (user.userType !== "BUSINESS_OWNER") {
    return (
      <div className="h-dvh flex items-center justify-center">
        <p>접근 권한이 없습니다. 사업자 계정으로 로그인해주세요.</p>
      </div>
    );
  }

  // 사업자 인증이 완료되지 않은 경우 접근 제한
  const isVerified =
    user.businessVerificationStatus === "APPROVED" ||
    user.businessVerificationStatus === "VERIFIED";
  if (!isVerified) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <p>접근 권한이 없습니다. 사업자 인증을 완료해주세요.</p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-white p-4 rounded-2xl">
      {/* 사업장 드롭다운 */}
      {isWorkplacesError ? (
        <p>사업장 조회 실패</p>
      ) : (
        <WorkplaceDropdown
          workplaces={workplacesData || []}
          selectedWorkplaceId={form.workplaceId}
          onChange={(id) => handleInputChange("workplaceId", id)}
          label="사업장을 선택하세요"
        />
      )}

      {/* 날짜 네비게이션 */}
      <div className="w-full flex justify-between items-center gap-2 mt-4">
        <button
          className="bg-main text-white text-sm px-4 py-2 rounded-lg"
          onClick={() => {
            const today = new Date();
            setCurrentDay(today);
            setForm((prev) => ({ ...prev, date: format(today, "yyyy-MM-dd") }));
          }}
        >
          오늘
        </button>
        <div className="flex items-center space-x-2 text-md text-gray4">
          <ChevronLeft
            size={24}
            className="cursor-pointer text-gray3"
            onClick={prevDay}
          />
          <span>{format(currentDay, "yyyy년 M월 d일", { locale: ko })}</span>
          <ChevronRight
            size={24}
            className="cursor-pointer text-gray3"
            onClick={nextDay}
          />
        </div>
        <div className="px-8"></div>
      </div>

      {/* 직원별 출퇴근 기록 - 독립적으로 로딩 */}
      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineDisplay workplaceId={form.workplaceId} date={form.date} />
      </Suspense>
    </div>
  );
}

// 오늘 날짜 문자열 반환 (yyyy-MM-dd)
function getTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
}
