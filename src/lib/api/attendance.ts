import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../constants";
import type { AdditionalWorkFormData } from "@/app/attendance/components/AdditionalWork";

export interface AttendanceRecord {
  id: string;
  workplaceId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  isAdditionalWork: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyAttendanceResponse {
  records: AttendanceRecord[];
  totalHours: number;
  regularHours: number;
  additionalHours: number;
}

export interface CreateAdditionalWorkResponse {
  record: AttendanceRecord;
  message: string;
}

export const attendanceApi = {
  getDailyAttendance: async () => {
    const response = await axiosInstance.get<DailyAttendanceResponse>(
      API_ENDPOINTS.ATTENDANCE + "/daily"
    );
    return response.data;
  },

  clockIn: async (workplaceId: string) => {
    const response = await axiosInstance.post<{ record: AttendanceRecord }>(
      API_ENDPOINTS.ATTENDANCE + "/clock-in",
      { workplaceId }
    );
    return response.data;
  },

  clockOut: async (attendanceId: string) => {
    const response = await axiosInstance.post<{ record: AttendanceRecord }>(
      API_ENDPOINTS.ATTENDANCE + `/clock-out/${attendanceId}`
    );
    return response.data;
  },

  createAdditionalWork: async (data: AdditionalWorkFormData) => {
    const response = await axiosInstance.post<CreateAdditionalWorkResponse>(
      API_ENDPOINTS.ADDITIONAL_WORK,
      data
    );
    return response.data;
  },
};
