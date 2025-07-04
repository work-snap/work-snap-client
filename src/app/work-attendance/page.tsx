"use client";

import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DailyAttendanceDashboard } from "./components/dashboard";
import { LoadingSpinner } from "./components/common";
import {
  useTodayDailyAttendance,
  useRefreshAttendance,
} from "./lib/hooks/use-attendance";
import { DailyAttendanceRes } from "./lib/types";

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

/**
 * 출근기록 메인 페이지 컴포넌트
 */
const WorkAttendancePage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[430px] mx-auto bg-white min-h-screen">
          {/* 헤더 */}
          <header className="bg-white shadow-sm border-b border-gray-200 p-4">
            <h1 className="text-xl font-bold text-main2 text-center">
              출근 기록
            </h1>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="p-4">
            <Suspense fallback={<AttendancePageSkeleton />}>
              <AttendanceContent />
            </Suspense>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
};

/**
 * 출근기록 콘텐츠 컴포넌트 (새로운 대시보드 사용)
 */
const AttendanceContent: React.FC = () => {
  const { data: dailyAttendance, isLoading, error } = useTodayDailyAttendance();
  const { refreshTodayDaily } = useRefreshAttendance();

  const handleUpdate = async () => {
    console.log("데이터 새로고침");
    await refreshTodayDaily();
  };

  return (
    <DailyAttendanceDashboard
      dailyAttendance={dailyAttendance}
      isLoading={isLoading}
      error={error}
      onUpdate={handleUpdate}
    />
  );
};

/**
 * 로딩 스켈레톤 컴포넌트 (대시보드에서 처리하므로 간소화)
 */
const AttendancePageSkeleton: React.FC = () => {
  return (
    <div className="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  );
};

/**
 * 에러 바운더리 컴포넌트
 */
class AttendanceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AttendanceErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray1 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-main2 mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-600 mb-4">
              출근기록 페이지를 불러오는 중 문제가 발생했습니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-main text-white px-6 py-2 rounded-lg font-medium hover:bg-main2 transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 에러 바운더리로 감싼 메인 컴포넌트
 */
const WrappedWorkAttendancePage: React.FC = () => {
  return (
    <AttendanceErrorBoundary>
      <WorkAttendancePage />
    </AttendanceErrorBoundary>
  );
};

export default WrappedWorkAttendancePage;
