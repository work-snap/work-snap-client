import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetchDailyAttendance, createAdditionalWork } from "./api";
import { CreateAdditionalWorkRequest } from "./types";
import { ApiError } from "@/lib/types/api";

// Query key factory
export const attendanceKeys = {
  all: ["attendance"] as const,
  daily: (date: string) => [...attendanceKeys.all, "daily", date] as const,
};

// 일일 근무 기록 조회
export function useDailyAttendance(date: Date) {
  return useQuery({
    queryKey: attendanceKeys.daily(format(date, "yyyy-MM-dd")),
    queryFn: () => fetchDailyAttendance(format(date, "yyyy-MM-dd")),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 추가 근무 생성
export function useCreateAdditionalWork(options?: {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdditionalWorkRequest) =>
      createAdditionalWork(data),
    onSuccess: (_, variables) => {
      // 해당 일자의 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.daily(variables.workDate),
      });
      options?.onSuccess?.();
    },
    onError: (error: ApiError) => {
      options?.onError?.(error);
    },
  });
}
