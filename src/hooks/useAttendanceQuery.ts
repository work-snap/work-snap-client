/**
 * 출석 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDailySchedules,
  checkIn,
  checkOut,
  CheckInRequest,
  CheckOutRequest,
} from "@/api/attendanceApi";
import { ScedulesProps } from "@/app/attendance/components/types";
import { formatErrorMessage, logError } from "@/utils/errorHandler";

// 쿼리 키 상수
export const ATTENDANCE_QUERY_KEYS = {
  dailySchedules: (date: string) =>
    ["attendance", "my-daily-schedules", date] as const,
  userSchedules: (userId: number) =>
    ["attendance", "user-schedules", userId] as const,
} as const;

/**
 * 일별 스케줄 조회 훅 (사용자의 모든 사업장)
 */
export const useDailySchedules = (date: string) => {
  return useQuery<ScedulesProps[], Error>({
    queryKey: ATTENDANCE_QUERY_KEYS.dailySchedules(date),
    queryFn: async () => {
      try {
        return await fetchDailySchedules(date);
      } catch (error) {
        logError(error, `Daily schedules fetch - date:${date}`);
        throw new Error(formatErrorMessage(error));
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: (failureCount, error) => {
      // 개발 환경에서는 재시도 안함 (서버 미실행 시)
      if (process.env.NODE_ENV === "development") {
        return false;
      }

      // 최대 3번 재시도
      if (failureCount >= 3) return false;

      // 네트워크 오류나 서버 오류인 경우에만 재시도
      const errorMessage = error?.message || "";
      const isRetryable =
        errorMessage.includes("네트워크") ||
        errorMessage.includes("서버") ||
        errorMessage.includes("시간 초과");

      return isRetryable;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 출근 처리 뮤테이션 훅
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CheckInRequest>({
    mutationFn: async (request: CheckInRequest) => {
      try {
        return await checkIn(request);
      } catch (error) {
        logError(error, `Check-in attempt - schedule:${request.scheduleId}`);
        throw new Error(formatErrorMessage(error));
      }
    },
    onSuccess: (data, variables) => {
      // 해당 스케줄의 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });

      console.log("출근 처리 성공:", data);
    },
    onError: (error) => {
      logError(error, "Check-in mutation failed");
    },
  });
};

/**
 * 퇴근 처리 뮤테이션 훅
 */
export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CheckOutRequest>({
    mutationFn: async (request: CheckOutRequest) => {
      try {
        return await checkOut(request);
      } catch (error) {
        logError(
          error,
          `Check-out attempt - record:${request.attendanceRecordId}`
        );
        throw new Error(formatErrorMessage(error));
      }
    },
    onSuccess: (data, variables) => {
      // 해당 스케줄의 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });

      console.log("퇴근 처리 성공:", data);
    },
    onError: (error) => {
      logError(error, "Check-out mutation failed");
    },
  });
};

/**
 * 전체 출석 데이터 다시 불러오기
 */
export const useRefreshAttendance = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ["attendance"],
    });
  };
};
