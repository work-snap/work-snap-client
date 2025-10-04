"use client";

import { useUserStore } from "@/stores/userStore";

export default function Header() {
  const { user, isLoading } = useUserStore();

  // 로딩 중이면 스켈레톤 UI 표시
  if (isLoading) {
    return (
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-[26px] font-extrabold text-main tracking-tight">
          Work Snap
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  // 사용자 정보가 없으면 기본 헤더만 표시
  if (!user) {
    return (
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-[26px] font-extrabold text-main tracking-tight">
          Work Snap
        </h1>
      </header>
    );
  }

  const userType = user.userType;
  const roleLabel = userType === "PART_TIME_WORKER" ? "알바님" : "사장님";
  const roleBgClass = userType === "PART_TIME_WORKER" ? "bg-main2" : "bg-main";

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-3">
      <h1 className="text-[26px] font-extrabold text-main tracking-tight">
        Work Snap
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-bold text-gray5">
          {user?.nickname}
        </span>
        <span
          className={`${roleBgClass} text-gray1 text-xs font-semibold rounded-full px-2 py-1`}
        >
          {roleLabel}
        </span>
      </div>
    </header>
  );
}
