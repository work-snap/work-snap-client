import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api";
import {
  ClockInReq,
  ClockOutReq,
  AttendanceRes,
  DailyAttendanceRes,
} from "../types";
import { useAppFeatures } from "./use-app-features";

/**
 * 출근 기록 쿼리 키 상수
 */
export const ATTENDANCE_QUERY_KEYS = {
  all: ["attendance"] as const,
  today: () => [...ATTENDANCE_QUERY_KEYS.all, "today"] as const,
  active: () => [...ATTENDANCE_QUERY_KEYS.all, "active"] as const,
  daily: (date: string) =>
    [...ATTENDANCE_QUERY_KEYS.all, "daily", date] as const,
  detail: (id: number) => [...ATTENDANCE_QUERY_KEYS.all, "detail", id] as const,
} as const;

/**
 * 오늘의 출근 기록 조회 훅 (메인 훅)
 * Single Responsibility: 오늘의 출근 기록만 조회
 */
export const useTodayAttendance = () => {
  const { errorFeedback } = useAppFeatures();

  const query = useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.today(),
    queryFn: () => attendanceApi.getTodayAttendance(),
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // 에러 처리
  if (query.error) {
    console.error("오늘의 출근 기록 조회 실패:", query.error);
    errorFeedback("데이터 로딩 실패", query.error.message);
  }

  return query;
};

/**
 * 활성 출근 기록 조회 훅
 * Single Responsibility: 현재 진행 중인 출근 기록만 조회
 */
export const useActiveAttendance = () => {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.active(),
    queryFn: () => attendanceApi.getActiveAttendance(),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 일별 출근 기록 조회 훅
 * Single Responsibility: 특정 날짜의 출근 기록만 조회
 */
export const useDailyAttendance = (date: string) => {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.daily(date),
    queryFn: () => attendanceApi.getDailyAttendance(date),
    enabled: !!date,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 2,
  });
};

/**
 * 특정 출근 기록 조회 훅
 * Single Responsibility: 개별 출근 기록 상세 정보만 조회
 */
export const useAttendanceDetail = (attendanceId: number) => {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.detail(attendanceId),
    queryFn: () => attendanceApi.getAttendanceById(attendanceId),
    enabled: !!attendanceId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * 출근 처리 뮤테이션 훅
 * Single Responsibility: 출근 처리만 담당
 */
export const useClockIn = () => {
  const queryClient = useQueryClient();
  const { clockInFeedback, errorFeedback } = useAppFeatures();

  return useMutation({
    mutationFn: ({
      attendanceId,
      request,
    }: {
      attendanceId: number;
      request: ClockInReq;
    }) => attendanceApi.clockIn(attendanceId, request),

    onSuccess: (data: AttendanceRes) => {
      // 관련 쿼리들 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_QUERY_KEYS.all,
      });

      // 성공한 출근 기록을 캐시에 직접 업데이트
      queryClient.setQueryData(ATTENDANCE_QUERY_KEYS.today(), data);
      queryClient.setQueryData(ATTENDANCE_QUERY_KEYS.detail(data.id), data);

      // 성공 피드백
      clockInFeedback();
      console.log("✅ 출근 처리 완료:", data);
    },

    onError: (error: Error) => {
      console.error("❌ 출근 처리 실패:", error);
      errorFeedback("출근 처리 실패", error.message);
    },

    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * 퇴근 처리 뮤테이션 훅
 * Single Responsibility: 퇴근 처리만 담당
 */
export const useClockOut = () => {
  const queryClient = useQueryClient();
  const { clockOutFeedback, errorFeedback } = useAppFeatures();

  return useMutation({
    mutationFn: ({
      attendanceId,
      request,
    }: {
      attendanceId: number;
      request: ClockOutReq;
    }) => attendanceApi.clockOut(attendanceId, request),

    onSuccess: (data: AttendanceRes) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_QUERY_KEYS.all,
      });

      // 성공한 출근 기록을 캐시에 직접 업데이트
      queryClient.setQueryData(ATTENDANCE_QUERY_KEYS.today(), data);
      queryClient.setQueryData(ATTENDANCE_QUERY_KEYS.detail(data.id), data);

      // 성공 피드백
      clockOutFeedback();
      console.log("✅ 퇴근 처리 완료:", data);
    },

    onError: (error: Error) => {
      console.error("❌ 퇴근 처리 실패:", error);
      errorFeedback("퇴근 처리 실패", error.message);
    },

    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * 추가 근무 등록 뮤테이션 훅
 * Single Responsibility: 추가 근무 등록만 담당
 */
export const useCreateAdditionalWork = () => {
  const queryClient = useQueryClient();
  const { errorFeedback } = useAppFeatures();

  return useMutation({
    mutationFn: (request: {
      workDate: string;
      workplaceId: number;
      startTime: string;
      endTime: string;
      notes?: string;
    }) => attendanceApi.createAdditionalWork(request),

    onSuccess: (data: AttendanceRes) => {
      // 활성 출근 기록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_QUERY_KEYS.active(),
      });

      // 해당 날짜의 일별 출근 기록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_QUERY_KEYS.daily(data.workDate),
      });

      // 오늘 날짜면 today 쿼리도 무효화
      const today = new Date().toISOString().split("T")[0];
      if (data.workDate === today) {
        queryClient.invalidateQueries({
          queryKey: ATTENDANCE_QUERY_KEYS.today(),
        });
      }

      console.log("✅ 추가 근무 등록 완료:", data);
    },

    onError: (error: Error) => {
      console.error("❌ 추가 근무 등록 실패:", error);
      errorFeedback("추가 근무 등록 실패", error.message);
    },

    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * 오늘의 일별 출근 현황 조회 훅 (대시보드용)
 * Single Responsibility: 오늘 날짜의 모든 출근 기록 조회
 */
export const useTodayDailyAttendance = () => {
  const { errorFeedback } = useAppFeatures();
  const today = new Date().toISOString().split("T")[0];

  const query = useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.daily(today),
    queryFn: () => attendanceApi.getDailyAttendance(today),
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // 에러 처리
  if (query.error) {
    console.error("오늘의 일별 출근 현황 조회 실패:", query.error);
    errorFeedback("데이터 로딩 실패", query.error.message);
  }

  return query;
};

/**
 * 특정 날짜의 일별 출근 현황 조회 훅 (카드 지원)
 * Single Responsibility: 특정 날짜의 모든 출근 기록을 카드 형태로 조회
 */
export const useDailyAttendanceWithCards = (date: string) => {
  const { errorFeedback } = useAppFeatures();

  const query = useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEYS.daily(date), "with-cards"],
    queryFn: async () => {
      const dailyData = await attendanceApi.getDailyAttendance(date);
      
      // 야간 근무 및 카드 처리 로직은 컴포넌트에서 수행
      return dailyData;
    },
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchInterval: date === new Date().toISOString().split("T")[0] 
      ? 3 * 60 * 1000  // 오늘인 경우 3분마다
      : undefined,     // 다른 날짜는 수동 갱신만
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // 에러 처리
  if (query.error) {
    console.error(`${date} 일별 출근 현황 조회 실패:`, query.error);
    errorFeedback("데이터 로딩 실패", query.error.message);
  }

  return query;
};

/**
 * 주간 출근 현황 조회 훅 (향후 확장용)
 * Single Responsibility: 주간 출근 기록 조회
 */
export const useWeeklyAttendance = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEYS.all, "weekly", startDate, endDate],
    queryFn: async () => {
      // 현재는 일별 조회를 여러 번 호출하여 구현
      const dates: string[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }

      const results = await Promise.all(
        dates.map(date => attendanceApi.getDailyAttendance(date))
      );

      return {
        startDate,
        endDate,
        dates,
        dailyResults: results,
        totalAttendances: results.reduce((sum, daily) => sum + daily.totalCount, 0),
        totalCompleted: results.reduce((sum, daily) => sum + daily.completedCount, 0),
      };
    },
    enabled: !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 2,
  });
};

/**
 * 출근 기록 새로고침 훅
 * Single Responsibility: 수동 데이터 새로고침만 담당
 */
export const useRefreshAttendance = () => {
  const queryClient = useQueryClient();

  const refreshToday = () => {
    return queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.today(),
    });
  };

  const refreshActive = () => {
    return queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.active(),
    });
  };

  const refreshDaily = (date: string) => {
    return queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.daily(date),
    });
  };

  const refreshTodayDaily = () => {
    const today = new Date().toISOString().split("T")[0];
    return queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.daily(today),
    });
  };

  const refreshAll = () => {
    return queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.all,
    });
  };

  return {
    refreshToday,
    refreshActive,
    refreshDaily,
    refreshTodayDaily,
    refreshAll,
  };
};
