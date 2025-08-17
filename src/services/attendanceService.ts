/**
 * 출석 관련 API 서비스
 */

import api from '@/lib/api';
import { LocationData } from '@/hooks/useGeolocation';

// 출석 상태 enum
export type AttendanceStatus = 
  | "NORMAL"           // 정상 출근
  | "LATE"             // 지각
  | "EARLY_ARRIVAL"    // 조기 출근
  | "OVERTIME"         // 연장 근무
  | "ABSENT"           // 결근
  | "LEAVE"            // 휴가
  | "SICK_LEAVE"       // 병가
  | "HALF_DAY"         // 반차
  | "REMOTE_WORK"      // 재택근무
  | "BUSINESS_TRIP";   // 출장

// 출석 기록 타입
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  workDate: string; // YYYY-MM-DD
  scheduledStartTime?: string; // HH:mm
  scheduledEndTime?: string; // HH:mm
  actualStartTime?: string; // HH:mm:ss
  actualEndTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  workLocation?: string;
  workplaceId?: string;
  workplaceName?: string;
  
  // 위치 정보
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInAccuracy?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAccuracy?: number;
  
  // 근무 시간 정보
  totalWorkMinutes?: number;
  breakMinutes?: number;
  overtimeMinutes?: number;
  
  // 기타 정보
  notes?: string;
  isFlexible?: boolean;
  isRemoteWork?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 출근 요청 타입
export interface CheckInRequest {
  employeeId: string;
  workDate?: string;
  workplaceId?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  notes?: string;
}

// 퇴근 요청 타입
export interface CheckOutRequest {
  attendanceId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  notes?: string;
}

// 출석 기록 생성 요청 타입
export interface CreateAttendanceRequest {
  employeeId: string;
  workDate: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: AttendanceStatus;
  workplaceId?: string;
  notes?: string;
}

// 출석 통계 타입
export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeDays: number;
  earlyArrivalDays: number;
  averageWorkHours: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
}

// 출석 요약 타입
export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  stats: AttendanceStats;
  recentRecords: AttendanceRecord[];
}

// 출석 필터 타입
export interface AttendanceFilter {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  workplaceId?: string;
  limit?: number;
  offset?: number;
}

class AttendanceService {
  private baseUrl = '/api/attendance';

  /**
   * 출석 기록 목록 조회
   */
  async getAttendanceRecords(filter: AttendanceFilter = {}): Promise<AttendanceRecord[]> {
    try {
      const response = await api.get(this.baseUrl, { params: filter });
      return response.data;
    } catch (error) {
      console.error('출석 기록 조회 실패:', error);
      throw new Error('출석 기록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 날짜의 출석 기록 조회
   */
  async getAttendanceByDate(employeeId: string, workDate: string): Promise<AttendanceRecord | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${employeeId}/${workDate}`);
      return response.data;
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null; // 해당 날짜 기록 없음
      }
      console.error('날짜별 출석 기록 조회 실패:', error);
      throw new Error('출석 기록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 출석 기록 상세 조회
   */
  async getAttendanceRecord(id: string): Promise<AttendanceRecord> {
    try {
      const response = await api.get(`${this.baseUrl}/records/${id}`);
      return response.data;
    } catch (error) {
      console.error('출석 기록 상세 조회 실패:', error);
      throw new Error('출석 기록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 출근 처리
   */
  async checkIn(request: CheckInRequest): Promise<AttendanceRecord> {
    try {
      const payload = {
        ...request,
        workDate: request.workDate || new Date().toISOString().split('T')[0],
      };

      const response = await api.post(`${this.baseUrl}/check-in`, payload);
      return response.data;
    } catch (error) {
      console.error('출근 처리 실패:', error);
      throw new Error('출근 처리에 실패했습니다.');
    }
  }

  /**
   * 퇴근 처리
   */
  async checkOut(request: CheckOutRequest): Promise<AttendanceRecord> {
    try {
      const response = await api.post(`${this.baseUrl}/check-out`, request);
      return response.data;
    } catch (error) {
      console.error('퇴근 처리 실패:', error);
      throw new Error('퇴근 처리에 실패했습니다.');
    }
  }

  /**
   * 위치 기반 출근 처리
   */
  async checkInWithLocation(
    employeeId: string,
    locationData: LocationData,
    workplaceId?: string,
    notes?: string
  ): Promise<AttendanceRecord> {
    try {
      const request: CheckInRequest = {
        employeeId,
        workplaceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        notes,
      };

      return await this.checkIn(request);
    } catch (error) {
      console.error('위치 기반 출근 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 위치 기반 퇴근 처리
   */
  async checkOutWithLocation(
    attendanceId: string,
    locationData: LocationData,
    notes?: string
  ): Promise<AttendanceRecord> {
    try {
      const request: CheckOutRequest = {
        attendanceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        notes,
      };

      return await this.checkOut(request);
    } catch (error) {
      console.error('위치 기반 퇴근 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 출석 기록 수정
   */
  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    try {
      const response = await api.put(`${this.baseUrl}/records/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('출석 기록 수정 실패:', error);
      throw new Error('출석 기록 수정에 실패했습니다.');
    }
  }

  /**
   * 출석 기록 삭제
   */
  async deleteAttendance(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/records/${id}`);
    } catch (error) {
      console.error('출석 기록 삭제 실패:', error);
      throw new Error('출석 기록 삭제에 실패했습니다.');
    }
  }

  /**
   * 수동 출석 기록 생성
   */
  async createAttendance(request: CreateAttendanceRequest): Promise<AttendanceRecord> {
    try {
      const response = await api.post(`${this.baseUrl}/records`, request);
      return response.data;
    } catch (error) {
      console.error('출석 기록 생성 실패:', error);
      throw new Error('출석 기록 생성에 실패했습니다.');
    }
  }

  /**
   * 직원별 출석 통계 조회
   */
  async getAttendanceStats(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceStats> {
    try {
      const params = { employeeId, startDate, endDate };
      const response = await api.get(`${this.baseUrl}/stats`, params);
      return response.data;
    } catch (error) {
      console.error('출석 통계 조회 실패:', error);
      throw new Error('출석 통계를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 출석 요약 정보 조회
   */
  async getAttendanceSummary(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceSummary> {
    try {
      const params = { employeeId, startDate, endDate };
      const response = await api.get(`${this.baseUrl}/summary`, params);
      return response.data;
    } catch (error) {
      console.error('출석 요약 조회 실패:', error);
      throw new Error('출석 요약을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 주간 출석 현황 조회
   */
  async getWeeklyAttendance(employeeId: string, weekStartDate: string): Promise<AttendanceRecord[]> {
    try {
      const params = { employeeId, weekStartDate };
      const response = await api.get(`${this.baseUrl}/weekly`, params);
      return response.data;
    } catch (error) {
      console.error('주간 출석 현황 조회 실패:', error);
      throw new Error('주간 출석 현황을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 월간 출석 현황 조회
   */
  async getMonthlyAttendance(employeeId: string, year: number, month: number): Promise<AttendanceRecord[]> {
    try {
      const params = { employeeId, year: year.toString(), month: month.toString() };
      const response = await api.get(`${this.baseUrl}/monthly`, params);
      return response.data;
    } catch (error) {
      console.error('월간 출석 현황 조회 실패:', error);
      throw new Error('월간 출석 현황을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 팀별 출석 현황 조회
   */
  async getTeamAttendance(
    teamId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecord[]> {
    try {
      const params = { teamId, startDate, endDate };
      const response = await api.get(`${this.baseUrl}/team`, params);
      return response.data;
    } catch (error) {
      console.error('팀별 출석 현황 조회 실패:', error);
      throw new Error('팀별 출석 현황을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 결근 처리
   */
  async markAsAbsent(employeeId: string, workDate: string, reason?: string): Promise<AttendanceRecord> {
    try {
      const payload = { employeeId, workDate, reason };
      const response = await api.post(`${this.baseUrl}/absent`, payload);
      return response.data;
    } catch (error) {
      console.error('결근 처리 실패:', error);
      throw new Error('결근 처리에 실패했습니다.');
    }
  }

  /**
   * 휴가 처리
   */
  async markAsLeave(
    employeeId: string,
    workDate: string,
    leaveType: 'LEAVE' | 'SICK_LEAVE' | 'HALF_DAY',
    reason?: string
  ): Promise<AttendanceRecord> {
    try {
      const payload = { employeeId, workDate, leaveType, reason };
      const response = await api.post(`${this.baseUrl}/leave`, payload);
      return response.data;
    } catch (error) {
      console.error('휴가 처리 실패:', error);
      throw new Error('휴가 처리에 실패했습니다.');
    }
  }

  /**
   * 출석 기록 벌크 수정
   */
  async bulkUpdateAttendance(
    records: Array<{ id: string; updates: Partial<AttendanceRecord> }>
  ): Promise<AttendanceRecord[]> {
    try {
      const response = await api.put(`${this.baseUrl}/bulk-update`, { records });
      return response.data;
    } catch (error) {
      console.error('출석 기록 벌크 수정 실패:', error);
      throw new Error('출석 기록 일괄 수정에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const attendanceService = new AttendanceService();

// 출석 관련 헬퍼 함수들
export const attendanceHelpers = {
  /**
   * 출석 상태를 한글로 변환
   */
  getStatusLabel(status: AttendanceStatus): string {
    const statusMap: Record<AttendanceStatus, string> = {
      NORMAL: "정상",
      LATE: "지각",
      EARLY_ARRIVAL: "조기출근",
      OVERTIME: "연장근무",
      ABSENT: "결근",
      LEAVE: "휴가",
      SICK_LEAVE: "병가",
      HALF_DAY: "반차",
      REMOTE_WORK: "재택근무",
      BUSINESS_TRIP: "출장",
    };
    return statusMap[status] || status;
  },

  /**
   * 출석 상태별 색상 반환
   */
  getStatusColor(status: AttendanceStatus): string {
    const colorMap: Record<AttendanceStatus, string> = {
      NORMAL: "text-green-600 bg-green-50 border-green-200",
      LATE: "text-orange-600 bg-orange-50 border-orange-200",
      EARLY_ARRIVAL: "text-blue-600 bg-blue-50 border-blue-200",
      OVERTIME: "text-purple-600 bg-purple-50 border-purple-200",
      ABSENT: "text-red-600 bg-red-50 border-red-200",
      LEAVE: "text-gray-600 bg-gray-50 border-gray-200",
      SICK_LEAVE: "text-red-500 bg-red-50 border-red-200",
      HALF_DAY: "text-yellow-600 bg-yellow-50 border-yellow-200",
      REMOTE_WORK: "text-green-500 bg-green-50 border-green-200",
      BUSINESS_TRIP: "text-indigo-600 bg-indigo-50 border-indigo-200",
    };
    return colorMap[status] || "text-gray-600 bg-gray-50 border-gray-200";
  },

  /**
   * 근무 시간 계산 (분 단위)
   */
  calculateWorkMinutes(startTime: string, endTime: string, breakMinutes = 60): number {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return Math.max(0, diffMinutes - breakMinutes);
  },

  /**
   * 시간을 읽기 쉬운 형태로 포맷팅
   */
  formatWorkTime(minutes: number): string {
    if (minutes <= 0) return "0시간";
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}시간`;
    }
    return `${hours}시간 ${remainingMinutes}분`;
  },

  /**
   * 출석 상태 우선순위 (정렬용)
   */
  getStatusPriority(status: AttendanceStatus): number {
    const priorityMap: Record<AttendanceStatus, number> = {
      ABSENT: 1,
      LATE: 2,
      OVERTIME: 3,
      EARLY_ARRIVAL: 4,
      NORMAL: 5,
      HALF_DAY: 6,
      SICK_LEAVE: 7,
      LEAVE: 8,
      REMOTE_WORK: 9,
      BUSINESS_TRIP: 10,
    };
    return priorityMap[status] || 99;
  },

  /**
   * 출석 기록이 오늘 것인지 확인
   */
  isToday(record: AttendanceRecord): boolean {
    const today = new Date().toISOString().split('T')[0];
    return record.workDate === today;
  },

  /**
   * 출근 여부 확인
   */
  hasCheckedIn(record: AttendanceRecord): boolean {
    return !!record.actualStartTime && record.status !== "ABSENT";
  },

  /**
   * 퇴근 여부 확인
   */
  hasCheckedOut(record: AttendanceRecord): boolean {
    return !!record.actualEndTime;
  },

  /**
   * 근무 완료 여부 확인
   */
  isWorkCompleted(record: AttendanceRecord): boolean {
    return this.hasCheckedIn(record) && this.hasCheckedOut(record);
  },

  /**
   * 지각 여부 확인
   */
  isLate(record: AttendanceRecord): boolean {
    return record.status === "LATE";
  },

  /**
   * 연장근무 여부 확인
   */
  hasOvertime(record: AttendanceRecord): boolean {
    return record.status === "OVERTIME" || (record.overtimeMinutes && record.overtimeMinutes > 0);
  },

  /**
   * 출석 기록 요약 생성
   */
  generateRecordSummary(record: AttendanceRecord): string {
    const status = this.getStatusLabel(record.status);
    const workTime = record.totalWorkMinutes 
      ? this.formatWorkTime(record.totalWorkMinutes) 
      : "미계산";
    
    if (!this.hasCheckedIn(record)) {
      return `${status} - 미출근`;
    }
    
    if (!this.hasCheckedOut(record)) {
      return `${status} - 근무 중 (${record.actualStartTime}부터)`;
    }
    
    return `${status} - ${workTime} (${record.actualStartTime}~${record.actualEndTime})`;
  },

  /**
   * 날짜별 출석 기록 그룹화
   */
  groupRecordsByDate(records: AttendanceRecord[]): Record<string, AttendanceRecord[]> {
    return records.reduce((groups, record) => {
      const date = record.workDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    }, {} as Record<string, AttendanceRecord[]>);
  },

  /**
   * 출석 기록 정렬 (최신순)
   */
  sortRecordsByDate(records: AttendanceRecord[], desc = true): AttendanceRecord[] {
    return [...records].sort((a, b) => {
      const comparison = a.workDate.localeCompare(b.workDate);
      return desc ? -comparison : comparison;
    });
  },

  /**
   * 근무 패턴 분석
   */
  analyzeWorkPattern(records: AttendanceRecord[]): {
    averageStartTime: string;
    averageEndTime: string;
    mostCommonStatus: AttendanceStatus;
    attendanceRate: number;
  } {
    const validRecords = records.filter(r => this.hasCheckedIn(r));
    
    if (validRecords.length === 0) {
      return {
        averageStartTime: "00:00",
        averageEndTime: "00:00",
        mostCommonStatus: "ABSENT",
        attendanceRate: 0,
      };
    }

    // 평균 출근 시간 계산
    const startTimes = validRecords
      .filter(r => r.actualStartTime)
      .map(r => r.actualStartTime!)
      .map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      });
    
    const avgStartMinutes = startTimes.reduce((sum, min) => sum + min, 0) / startTimes.length;
    const avgStartHours = Math.floor(avgStartMinutes / 60);
    const avgStartMins = Math.round(avgStartMinutes % 60);
    
    // 평균 퇴근 시간 계산
    const endTimes = validRecords
      .filter(r => r.actualEndTime)
      .map(r => r.actualEndTime!)
      .map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      });
    
    const avgEndMinutes = endTimes.reduce((sum, min) => sum + min, 0) / endTimes.length;
    const avgEndHours = Math.floor(avgEndMinutes / 60);
    const avgEndMins = Math.round(avgEndMinutes % 60);

    // 가장 일반적인 상태
    const statusCounts = records.reduce((counts, record) => {
      counts[record.status] = (counts[record.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const mostCommonStatus = Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as AttendanceStatus || "NORMAL";

    // 출석률
    const presentDays = records.filter(r => this.hasCheckedIn(r)).length;
    const attendanceRate = Math.round((presentDays / records.length) * 100);

    return {
      averageStartTime: `${String(avgStartHours).padStart(2, '0')}:${String(avgStartMins).padStart(2, '0')}`,
      averageEndTime: `${String(avgEndHours).padStart(2, '0')}:${String(avgEndMins).padStart(2, '0')}`,
      mostCommonStatus,
      attendanceRate,
    };
  },
};