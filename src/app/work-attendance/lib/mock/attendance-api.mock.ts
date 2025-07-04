import {
  AttendanceRes,
  DailyAttendanceRes,
  ClockInReq,
  ClockOutReq,
  ApiResponse,
  AttendanceStatus,
  ClockInType,
  ClockOutType,
} from "../types";
import {
  mockAttendanceData,
  generateDateData,
  todayDailyAttendance,
} from "./attendance-data";

/**
 * 목업 API 서비스 클래스
 * 개발 환경에서 실제 서버 없이 테스트할 수 있도록 함
 */
class MockAttendanceApiService {
  private readonly baseUrl = "/api/v1/attendance";
  private mockData = { ...mockAttendanceData };

  // 응답 지연 시뮬레이션 (실제 API 호출과 유사하게)
  private delay(ms: number = 300 + Math.random() * 700): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 성공 응답 래퍼
  private successResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  // 에러 응답 래퍼
  private errorResponse(message: string, status: number = 400): never {
    const error = new Error(message) as any;
    error.response = {
      status,
      data: {
        success: false,
        message,
        timestamp: new Date().toISOString(),
      },
    };
    throw error;
  }

  /**
   * 오늘의 출근 기록 조회
   */
  async getTodayAttendance(): Promise<AttendanceRes | null> {
    await this.delay();

    const today = new Date().toISOString().split("T")[0];
    const dailyData = this.mockData.daily[today];

    if (!dailyData || dailyData.attendances.length === 0) {
      return null;
    }

    // 오늘의 첫 번째 출근 기록 반환 (기존 API 호환성)
    const mainAttendance = dailyData.attendances.find(a => !a.isAdditionalWork);
    return mainAttendance || dailyData.attendances[0];
  }

  /**
   * 출근 처리
   */
  async clockIn(
    attendanceId: number,
    request: ClockInReq
  ): Promise<AttendanceRes> {
    await this.delay();

    const attendance = this.mockData.attendances[attendanceId];
    if (!attendance) {
      this.errorResponse("출근 기록을 찾을 수 없습니다", 404);
    }

    if (attendance.status !== AttendanceStatus.SCHEDULED) {
      this.errorResponse("이미 출근 처리된 기록입니다", 409);
    }

    // 출근 처리 시뮬레이션
    const now = new Date();
    const clockInType = request.manualClockInType || ClockInType.NORMAL;
    
    const updatedAttendance: AttendanceRes = {
      ...attendance,
      actualStartTime: request.actualTime || now.toISOString(),
      clockInTypes: [clockInType],
      clockInTypesKorean: clockInType === ClockInType.EARLY_ARRIVAL ? "조기출근" : "정상출근",
      status: AttendanceStatus.IN_PROGRESS,
      statusKorean: "근무중",
      allAttendanceInfo: clockInType === ClockInType.EARLY_ARRIVAL ? "조기출근" : "정상출근",
      notes: request.notes || attendance.notes,
      updatedAt: now.toISOString(),
    };

    // 데이터 업데이트
    this.mockData.attendances[attendanceId] = updatedAttendance;
    this.updateDailyData(updatedAttendance);

    console.log(`✅ Mock API: 출근 처리 완료 (ID: ${attendanceId}, Type: ${clockInType})`);
    return updatedAttendance;
  }

  /**
   * 퇴근 처리
   */
  async clockOut(
    attendanceId: number,
    request: ClockOutReq
  ): Promise<AttendanceRes> {
    await this.delay();

    const attendance = this.mockData.attendances[attendanceId];
    if (!attendance) {
      this.errorResponse("출근 기록을 찾을 수 없습니다", 404);
    }

    if (attendance.status !== AttendanceStatus.IN_PROGRESS) {
      this.errorResponse("출근하지 않은 상태에서는 퇴근할 수 없습니다", 409);
    }

    // 퇴근 처리 시뮬레이션
    const now = new Date();
    const clockOutType = request.manualClockOutType || ClockOutType.NORMAL;
    
    // 근무 시간 계산
    const startTime = new Date(attendance.actualStartTime!);
    const endTime = new Date(request.actualTime || now.toISOString());
    const workingMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const clockOutTypeKorean = 
      clockOutType === ClockOutType.EARLY_DEPARTURE ? "조퇴" :
      clockOutType === ClockOutType.LATE_DEPARTURE ? "연장근무" : "정상퇴근";

    const updatedAttendance: AttendanceRes = {
      ...attendance,
      actualEndTime: request.actualTime || now.toISOString(),
      clockOutTypes: [clockOutType],
      clockOutTypesKorean: clockOutTypeKorean,
      status: AttendanceStatus.COMPLETED,
      statusKorean: "근무완료",
      actualWorkingMinutes: workingMinutes,
      allAttendanceInfo: `${attendance.clockInTypesKorean}, ${clockOutTypeKorean}`,
      notes: request.notes || attendance.notes,
      updatedAt: now.toISOString(),
    };

    // 데이터 업데이트
    this.mockData.attendances[attendanceId] = updatedAttendance;
    this.updateDailyData(updatedAttendance);

    console.log(`✅ Mock API: 퇴근 처리 완료 (ID: ${attendanceId}, Type: ${clockOutType}, 근무시간: ${workingMinutes}분)`);
    return updatedAttendance;
  }

  /**
   * 일별 출근 현황 조회
   */
  async getDailyAttendance(date: string): Promise<DailyAttendanceRes> {
    await this.delay();

    let dailyData = this.mockData.daily[date];
    
    // 해당 날짜 데이터가 없으면 생성
    if (!dailyData) {
      dailyData = generateDateData(date);
      this.mockData.daily[date] = dailyData;
    }

    console.log(`📅 Mock API: ${date} 일별 현황 조회 (총 ${dailyData.totalCount}개)`);
    return dailyData;
  }

  /**
   * 진행 중인 출근 기록 조회
   */
  async getActiveAttendance(): Promise<AttendanceRes[]> {
    await this.delay();

    const activeAttendances = Object.values(this.mockData.attendances)
      .filter(attendance => attendance.status === AttendanceStatus.IN_PROGRESS);

    console.log(`🔄 Mock API: 진행 중인 출근 기록 ${activeAttendances.length}개 조회`);
    return activeAttendances;
  }

  /**
   * 특정 출근 기록 조회
   */
  async getAttendanceById(attendanceId: number): Promise<AttendanceRes> {
    await this.delay();

    const attendance = this.mockData.attendances[attendanceId];
    if (!attendance) {
      this.errorResponse("출근 기록을 찾을 수 없습니다", 404);
    }

    return attendance;
  }

  /**
   * 추가 근무 등록
   */
  async createAdditionalWork(request: {
    workDate: string;
    workplaceId: number;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<AttendanceRes> {
    await this.delay();

    const newId = Math.max(...Object.keys(this.mockData.attendances).map(Number)) + 1;
    const now = new Date();

    const newAttendance: AttendanceRes = {
      id: newId,
      workScheduleId: undefined,
      userId: 1,
      workplaceId: request.workplaceId,
      workDate: request.workDate,
      scheduledStartTime: request.startTime,
      scheduledEndTime: request.endTime,
      actualStartTime: undefined,
      actualEndTime: undefined,
      clockInTypes: [],
      clockInTypesKorean: "",
      clockOutTypes: [],
      clockOutTypesKorean: "",
      status: AttendanceStatus.SCHEDULED,
      statusKorean: "예정",
      isAdditionalWork: true,
      actualWorkingMinutes: undefined,
      allAttendanceInfo: "추가근무",
      notes: request.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 데이터 추가
    this.mockData.attendances[newId] = newAttendance;
    this.updateDailyData(newAttendance);

    console.log(`✨ Mock API: 추가 근무 등록 완료 (ID: ${newId}, ${request.workDate} ${request.startTime}-${request.endTime})`);
    return newAttendance;
  }

  /**
   * 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    await this.delay(100);
    console.log("🔗 Mock API: 연결 상태 확인 - 정상");
    return true;
  }

  /**
   * 일별 데이터 업데이트 헬퍼
   */
  private updateDailyData(attendance: AttendanceRes): void {
    const date = attendance.workDate;
    let dailyData = this.mockData.daily[date];

    if (!dailyData) {
      dailyData = {
        date,
        attendances: [],
        totalCount: 0,
        completedCount: 0,
        inProgressCount: 0,
        additionalWorkCount: 0,
      };
      this.mockData.daily[date] = dailyData;
    }

    // 기존 데이터 찾아서 업데이트 또는 추가
    const existingIndex = dailyData.attendances.findIndex(a => a.id === attendance.id);
    if (existingIndex >= 0) {
      dailyData.attendances[existingIndex] = attendance;
    } else {
      dailyData.attendances.push(attendance);
    }

    // 통계 재계산
    dailyData.totalCount = dailyData.attendances.length;
    dailyData.completedCount = dailyData.attendances.filter(a => a.status === AttendanceStatus.COMPLETED).length;
    dailyData.inProgressCount = dailyData.attendances.filter(a => a.status === AttendanceStatus.IN_PROGRESS).length;
    dailyData.additionalWorkCount = dailyData.attendances.filter(a => a.isAdditionalWork).length;
  }

  /**
   * 목업 데이터 초기화 (테스트용)
   */
  public resetMockData(): void {
    this.mockData = { ...mockAttendanceData };
    console.log("🔄 Mock API: 데이터 초기화 완료");
  }

  /**
   * 현재 목업 데이터 상태 조회 (디버깅용)
   */
  public getMockDataState(): typeof mockAttendanceData {
    return this.mockData;
  }

  /**
   * 특정 출근 기록 상태 강제 변경 (테스트용)
   */
  public forceUpdateAttendanceStatus(
    attendanceId: number, 
    status: AttendanceStatus,
    additionalData?: Partial<AttendanceRes>
  ): AttendanceRes | null {
    const attendance = this.mockData.attendances[attendanceId];
    if (!attendance) return null;

    const updatedAttendance = {
      ...attendance,
      status,
      statusKorean: status === AttendanceStatus.SCHEDULED ? "예정" :
                   status === AttendanceStatus.IN_PROGRESS ? "근무중" :
                   status === AttendanceStatus.COMPLETED ? "근무완료" : "결근",
      updatedAt: new Date().toISOString(),
      ...additionalData,
    };

    this.mockData.attendances[attendanceId] = updatedAttendance;
    this.updateDailyData(updatedAttendance);

    console.log(`🔧 Mock API: 출근 기록 강제 업데이트 (ID: ${attendanceId}, Status: ${status})`);
    return updatedAttendance;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const mockAttendanceApi = new MockAttendanceApiService();

// 디버깅을 위한 전역 변수 설정 (개발 환경에서만)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).mockAttendanceApi = mockAttendanceApi;
  console.log("🧪 Mock API가 전역 변수로 설정되었습니다. 콘솔에서 'mockAttendanceApi'로 접근 가능합니다.");
}