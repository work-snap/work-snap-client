import { axiosInstance } from "@/lib/axios";
import { CreateAdditionalWorkRequest, DailyAttendanceResponse } from "./types";

export const fetchDailyAttendance = async (
  date: string
): Promise<DailyAttendanceResponse> => {
  const response = await axiosInstance.get("/api/v1/attendance/daily", {
    params: { date },
  });
  return response.data;
};

export const clockIn = async (workplaceId: number) => {
  const response = await axiosInstance.post("/api/v1/attendance/clock-in", {
    workplaceId,
  });
  return response.data;
};

export const clockOut = async (attendanceId: number) => {
  const response = await axiosInstance.post(
    `/api/v1/attendance/clock-out/${attendanceId}`
  );
  return response.data;
};

export async function createAdditionalWork(data: CreateAdditionalWorkRequest) {
  const response = await axiosInstance.post("/api/attendance/additional", data);
  return response.data;
}

// Legacy compatibility functions (no-op implementations)
export const getAttendanceRecords = async (_date: string) => {
  console.warn(
    "getAttendanceRecords is deprecated. Use useDailyAttendance hook instead."
  );
  return [];
};

export const createTodayAttendance = async () => {
  console.warn("createTodayAttendance is deprecated.");
  return [];
};
