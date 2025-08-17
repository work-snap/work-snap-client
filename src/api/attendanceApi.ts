/**
 * 출석 관련 API 함수들
 */

import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { ScedulesProps } from "@/app/attendance/components/types";

// 출근 요청 타입
export interface CheckInRequest {
  scheduleId: number;
  latitude: number;
  longitude: number;
  address?: string;
  isEarlyCheckIn?: boolean;
  isLateCheckIn?: boolean;
}

// 퇴근 요청 타입
export interface CheckOutRequest {
  attendanceRecordId: number;
  latitude: number;
  longitude: number;
}

// 위치 정보 타입
export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * 사용자의 일별 모든 스케줄 조회 (모든 사업장)
 */
interface ScheduleLocationRes {
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface ScheduleItemRes {
  id: number;
  workplaceId: number;
  workplaceName: string;
  userId: number;
  dayOfWeek?: string;
  dayOfWeekKorean?: string;
  startTime: string;
  endTime: string;
  plannedHours?: number;
  scheduleId?: number;
  attendanceId?: number | null;
  type?: string;
  attendanceStatus?: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  overtimeHours?: number | null;
  actualHours?: number | null;
  location?: ScheduleLocationRes | null;
  status?: string;
}

interface WorkplaceSchedulesGroupRes {
  workplaceId: number;
  workplaceName: string;
  schedules?: ScheduleItemRes[];
}

interface UserDailySchedulesRes {
  schedulesByWorkplace?: WorkplaceSchedulesGroupRes[];
}

export const fetchDailySchedules = async (
  date: string
): Promise<ScedulesProps[]> => {
  try {
    const response = await api.get<ApiResponse<UserDailySchedulesRes>>(
      "/api/v1/attendance/my-daily-schedules",
      { params: { date } }
    );

    if (response.data.success && response.data.data) {
      // UserDailySchedulesRes 구조에서 스케줄들을 평면화
      const userDailySchedules = response.data.data;
      const allSchedules: ScedulesProps[] = [];

      // 모든 사업장의 스케줄을 하나의 배열로 합치기
      userDailySchedules.schedulesByWorkplace?.forEach(
        (workplace: WorkplaceSchedulesGroupRes) => {
          workplace.schedules?.forEach((schedule: ScheduleItemRes) => {
            // ScheduleWithStatusRes -> ScedulesProps 매핑
            const mappedSchedule: ScedulesProps = {
              id: schedule.id,
              workplaceId: schedule.workplaceId,
              workplaceName: schedule.workplaceName,
              userId: schedule.userId,
              dayOfWeek: schedule.dayOfWeek || "",
              dayOfWeekKorean: schedule.dayOfWeekKorean || "",
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              // 스케줄의 예정 시간 (실제 출근/퇴근 시간이 아님)
              scheduledStartDate: `${date}T${schedule.startTime}:00`,
              scheduledEndDate: `${date}T${schedule.endTime}:00`,
              workingHours: schedule.plannedHours,
              isActive: true,
              attendanceRecord: schedule.attendanceId
                ? {
                    id: schedule.attendanceId,
                    userId: schedule.userId,
                    scheduleId: schedule.scheduleId || schedule.id,
                    workplaceId: schedule.workplaceId,
                    workplaceName: schedule.workplaceName,
                    attendanceType: schedule.type || "REGULAR",
                    attendanceStatus: schedule.attendanceStatus || "NORMAL",
                    // 실제 출근/퇴근 시간 (날짜와 함께 조합)
                    checkInTime: schedule.actualStartTime
                      ? `${date}T${schedule.actualStartTime}`
                      : null,
                    checkOutTime: schedule.actualEndTime
                      ? `${date}T${schedule.actualEndTime}`
                      : null,
                    workDurationMinutes: schedule.actualHours
                      ? Math.round(schedule.actualHours * 60)
                      : undefined,
                    overtimeDurationMinutes: schedule.overtimeHours
                      ? Math.round(schedule.overtimeHours * 60)
                      : undefined,
                    workingHours: schedule.actualHours,
                    overtimeHours: schedule.overtimeHours,
                    totalWorkingHours:
                      (schedule.actualHours || 0) +
                      (schedule.overtimeHours || 0),
                    locationLatitude: schedule.location?.latitude,
                    locationLongitude: schedule.location?.longitude,
                    locationAddress: schedule.location?.address,
                    isCheckedIn: !!schedule.actualStartTime,
                    isCheckedOut: !!schedule.actualEndTime,
                    isWorkCompleted: schedule.status === "COMPLETED",
                    createdAt: schedule.actualStartTime
                      ? `${date}T${schedule.actualStartTime}`
                      : "",
                    updatedAt: schedule.actualEndTime
                      ? `${date}T${schedule.actualEndTime}`
                      : schedule.actualStartTime
                      ? `${date}T${schedule.actualStartTime}`
                      : "",
                  }
                : null,
              currentStatus: mapScheduleStatus(schedule.status),
              type: schedule.type,
            };

            allSchedules.push(mappedSchedule);
          });
        }
      );
      // 이미 클라이언트 타입으로 매핑 완료된 배열을 그대로 반환
      return allSchedules;
    } else {
      throw new Error(response.data.message || "스케줄 조회에 실패했습니다.");
    }
  } catch (error) {
    console.error("스케줄 조회 실패:", error);
    throw error;
  }
};

/**
 * 서버의 ScheduleStatus를 클라이언트의 currentStatus로 매핑
 */
function mapScheduleStatus(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "NOT_STARTED";
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "ADDITIONAL":
      return "ADDITIONAL";
    default:
      return "NOT_STARTED";
  }
}

/**
 * 출근 처리
 */
export const checkIn = async (request: CheckInRequest): Promise<unknown> => {
  try {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/attendance/check-in",
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data as unknown;
    } else {
      throw new Error(response.data.message || "출근 처리에 실패했습니다.");
    }
  } catch (error) {
    console.error("출근 처리 실패:", error);
    throw error;
  }
};

/**
 * 퇴근 처리
 */
export const checkOut = async (request: CheckOutRequest): Promise<unknown> => {
  try {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/attendance/check-out",
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data as unknown;
    } else {
      throw new Error(response.data.message || "퇴근 처리에 실패했습니다.");
    }
  } catch (error) {
    console.error("퇴근 처리 실패:", error);
    throw error;
  }
};

// 추가 근무 생성 요청 타입
export interface AdditionalWorkCreateRequest {
  workplaceId: number;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
}

/**
 * 추가 근무 생성
 */
export const createAdditionalWork = async (
  request: AdditionalWorkCreateRequest
): Promise<unknown> => {
  try {
    const response = await api.post<ApiResponse<unknown>>(
      "/api/v1/attendance/additional-work",
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data as unknown;
    } else {
      throw new Error(
        response.data.message || "추가 근무 생성에 실패했습니다."
      );
    }
  } catch (error) {
    console.error("추가 근무 생성 실패:", error);
    throw error;
  }
};

/**
 * 현재 위치 정보 가져오기
 */
export const getCurrentLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("위치 정보 가져오기 실패:", error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

/**
 * 주소 정보 가져오기 (역지오코딩)
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // 실제 구현에서는 Google Maps API 또는 Kakao Map API 등을 사용
    // 현재는 더미 주소 반환
    return `위도: ${latitude.toFixed(4)}, 경도: ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error("주소 정보 가져오기 실패:", error);
    return "주소 정보 없음";
  }
};

/**
 * 위치 권한 확인
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    if (!navigator.permissions) {
      return false;
    }

    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state === "granted";
  } catch (error) {
    console.error("위치 권한 확인 실패:", error);
    return false;
  }
};
