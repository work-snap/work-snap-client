// src/lib/api/getDailyTimeLine.ts
import api from "../api";

export interface DailyTimelineItem {
  time: string; // "09:13"
  action: string; // "CHECK_IN" | "CHECK_OUT" | "OVERTIME" | "ABSENT"
  badges: string[]; // ["지각", "조기출근", "조퇴", "연장근무"] 같은 표시
}

export interface DailyTimelineEmployee {
  userId: number;
  employeeName: string;
  items: DailyTimelineItem[];
}

export interface DailyTimelineResponse {
  success: boolean;
  message: string;
  data: {
    workplaceId: number;
    workplaceName: string;
    date: string; // yyyy-MM-dd
    employees: DailyTimelineEmployee[];
  };
}

// 사업장 일별 타임라인 조회
export const getWorkplaceDailyTimeline = async (
  workplaceId: number,
  date: string
): Promise<DailyTimelineResponse> => {
  const res = await api.get(
    "/api/business/attendance/workplace/daily-timeline",
    {
      params: { workplaceId, date },
    }
  );
  console.log("📅 일별 타임라인 응답:", res.data);
  return res.data;
};
