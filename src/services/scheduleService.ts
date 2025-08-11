/**
 * 스케줄 관련 API 서비스
 */

import { api } from './api';

// 스케줄 타입 정의
export interface WorkSchedule {
  id: string;
  employeeId: string;
  employeeName?: string;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  dayOfWeek: string; // MONDAY, TUESDAY, etc.
  isFlexible: boolean;
  isActive: boolean;
  workLocation?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 스케줄 생성/수정 요청 타입
export interface CreateScheduleRequest {
  employeeId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  isFlexible?: boolean;
  workLocation?: string;
  description?: string;
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  id: string;
}

// 스케줄 충돌 정보 타입
export interface ScheduleConflict {
  conflictingSchedule: WorkSchedule;
  conflictType: 'OVERLAP' | 'DUPLICATE' | 'ADJACENT';
  conflictStartTime: string;
  conflictEndTime: string;
  conflictDurationMinutes: number;
  message: string;
}

// 충돌 검사 응답 타입
export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: ScheduleConflict[];
  canProceed: boolean;
  recommendation?: string;
}

// 스케줄 조회 필터 타입
export interface ScheduleFilter {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: string;
  isActive?: boolean;
}

// 일괄 스케줄 생성 타입
export interface BulkScheduleRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  scheduleTemplate: {
    startTime: string;
    endTime: string;
    workDays: string[]; // ['MONDAY', 'TUESDAY', ...]
    isFlexible?: boolean;
    workLocation?: string;
    description?: string;
  };
}

class ScheduleService {
  private baseUrl = '/api/schedules';

  /**
   * 스케줄 목록 조회
   */
  async getSchedules(filter: ScheduleFilter = {}): Promise<WorkSchedule[]> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('스케줄 조회 실패:', error);
      throw new Error('스케줄을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 날짜의 스케줄 조회
   */
  async getSchedulesByDate(date: string, employeeId?: string): Promise<WorkSchedule[]> {
    try {
      const filter: ScheduleFilter = { 
        startDate: date, 
        endDate: date,
        isActive: true 
      };
      
      if (employeeId) {
        filter.employeeId = employeeId;
      }

      return await this.getSchedules(filter);
    } catch (error) {
      console.error('날짜별 스케줄 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 직원의 주간 스케줄 조회
   */
  async getWeeklySchedules(employeeId: string, startDate: string): Promise<WorkSchedule[]> {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      return await this.getSchedules({
        employeeId,
        startDate,
        endDate: endDate.toISOString().split('T')[0],
        isActive: true,
      });
    } catch (error) {
      console.error('주간 스케줄 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 스케줄 상세 조회
   */
  async getScheduleById(id: string): Promise<WorkSchedule> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('스케줄 상세 조회 실패:', error);
      throw new Error('스케줄 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 스케줄 충돌 검사
   */
  async checkScheduleConflict(
    scheduleData: CreateScheduleRequest,
    excludeId?: string
  ): Promise<ConflictCheckResponse> {
    try {
      const payload = {
        ...scheduleData,
        excludeId,
      };

      const response = await api.post(`${this.baseUrl}/check-conflict`, payload);
      return response.data;
    } catch (error) {
      console.error('스케줄 충돌 검사 실패:', error);
      throw new Error('스케줄 충돌 검사에 실패했습니다.');
    }
  }

  /**
   * 스케줄 생성
   */
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<WorkSchedule> {
    try {
      // 먼저 충돌 검사 수행
      const conflictCheck = await this.checkScheduleConflict(scheduleData);
      
      if (conflictCheck.hasConflict && !conflictCheck.canProceed) {
        throw new Error(`스케줄 충돌이 발생했습니다: ${conflictCheck.conflicts[0]?.message}`);
      }

      const response = await api.post(this.baseUrl, scheduleData);
      return response.data;
    } catch (error) {
      console.error('스케줄 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 스케줄 수정
   */
  async updateSchedule(scheduleData: UpdateScheduleRequest): Promise<WorkSchedule> {
    try {
      const { id, ...updateData } = scheduleData;
      
      // 수정 시에도 충돌 검사 수행 (자기 자신 제외)
      if (updateData.startTime || updateData.endTime || updateData.workDate) {
        const conflictCheck = await this.checkScheduleConflict(
          updateData as CreateScheduleRequest,
          id
        );
        
        if (conflictCheck.hasConflict && !conflictCheck.canProceed) {
          throw new Error(`스케줄 충돌이 발생했습니다: ${conflictCheck.conflicts[0]?.message}`);
        }
      }

      const response = await api.put(`${this.baseUrl}/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 스케줄 삭제
   */
  async deleteSchedule(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      throw new Error('스케줄 삭제에 실패했습니다.');
    }
  }

  /**
   * 스케줄 활성화/비활성화
   */
  async toggleScheduleStatus(id: string, isActive: boolean): Promise<WorkSchedule> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('스케줄 상태 변경 실패:', error);
      throw new Error('스케줄 상태 변경에 실패했습니다.');
    }
  }

  /**
   * 일괄 스케줄 생성
   */
  async createBulkSchedules(bulkData: BulkScheduleRequest): Promise<WorkSchedule[]> {
    try {
      const response = await api.post(`${this.baseUrl}/bulk`, bulkData);
      return response.data;
    } catch (error) {
      console.error('일괄 스케줄 생성 실패:', error);
      throw new Error('일괄 스케줄 생성에 실패했습니다.');
    }
  }

  /**
   * 스케줄 복제
   */
  async duplicateSchedule(id: string, newDate: string): Promise<WorkSchedule> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`, { newDate });
      return response.data;
    } catch (error) {
      console.error('스케줄 복제 실패:', error);
      throw new Error('스케줄 복제에 실패했습니다.');
    }
  }

  /**
   * 스케줄 템플릿 적용
   */
  async applyScheduleTemplate(
    employeeId: string,
    templateId: string,
    startDate: string,
    endDate: string
  ): Promise<WorkSchedule[]> {
    try {
      const payload = {
        employeeId,
        templateId,
        startDate,
        endDate,
      };

      const response = await api.post(`${this.baseUrl}/apply-template`, payload);
      return response.data;
    } catch (error) {
      console.error('스케줄 템플릿 적용 실패:', error);
      throw new Error('스케줄 템플릿 적용에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const scheduleService = new ScheduleService();

// 헬퍼 함수들
export const scheduleHelpers = {
  /**
   * 스케줄 시간이 유효한지 검사
   */
  isValidScheduleTime(startTime: string, endTime: string): boolean {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return start < end;
  },

  /**
   * 스케줄 지속 시간 계산 (분)
   */
  calculateDurationMinutes(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  },

  /**
   * 스케줄 시간 포맷팅
   */
  formatScheduleTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  },

  /**
   * 요일 문자열을 한국어로 변환
   */
  dayOfWeekToKorean(dayOfWeek: string): string {
    const dayMap: Record<string, string> = {
      MONDAY: '월요일',
      TUESDAY: '화요일',
      WEDNESDAY: '수요일',
      THURSDAY: '목요일',
      FRIDAY: '금요일',
      SATURDAY: '토요일',
      SUNDAY: '일요일',
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  },

  /**
   * 스케줄 상태 텍스트 반환
   */
  getScheduleStatusText(schedule: WorkSchedule): string {
    if (!schedule.isActive) return '비활성';
    if (schedule.isFlexible) return '유연근무';
    return '정규근무';
  },

  /**
   * 충돌 타입별 메시지 생성
   */
  getConflictMessage(conflict: ScheduleConflict): string {
    const { conflictType, conflictStartTime, conflictEndTime, conflictDurationMinutes } = conflict;
    
    switch (conflictType) {
      case 'OVERLAP':
        return `기존 스케줄과 ${conflictDurationMinutes}분 겹칩니다 (${conflictStartTime}-${conflictEndTime})`;
      case 'DUPLICATE':
        return '동일한 시간대의 스케줄이 이미 존재합니다';
      case 'ADJACENT':
        return '연속된 스케줄로 휴게시간이 부족할 수 있습니다';
      default:
        return '스케줄 충돌이 발생했습니다';
    }
  },

  /**
   * 스케줄을 날짜별로 그룹화
   */
  groupSchedulesByDate(schedules: WorkSchedule[]): Record<string, WorkSchedule[]> {
    return schedules.reduce((groups, schedule) => {
      const date = schedule.workDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(schedule);
      return groups;
    }, {} as Record<string, WorkSchedule[]>);
  },

  /**
   * 스케줄을 시간순으로 정렬
   */
  sortSchedulesByTime(schedules: WorkSchedule[]): WorkSchedule[] {
    return [...schedules].sort((a, b) => {
      const timeA = a.startTime.replace(':', '');
      const timeB = b.startTime.replace(':', '');
      return timeA.localeCompare(timeB);
    });
  },
};