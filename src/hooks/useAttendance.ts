"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDailySchedules, checkIn, checkOut, CheckInRequest, CheckOutRequest } from "@/api/attendanceApi";
import { ScedulesProps } from "@/app/attendance/components/types";

// 쿼리 키 상수
export const ATTENDANCE_QUERY_KEYS = {
  dailySchedules: (workplaceId: number, date: string) => ["attendance", "daily-schedules", workplaceId, date] as const,
  userSchedules: (userId: number) => ["attendance", "user-schedules", userId] as const,
} as const;

/**
 * 일별 스케줄 조회 훅
 */
export const useDailySchedules = (workplaceId: number, date: string) => {
  return useQuery<ScedulesProps[], Error>({
    queryKey: ATTENDANCE_QUERY_KEYS.dailySchedules(workplaceId, date),
    queryFn: () => fetchDailySchedules(workplaceId, date),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 출근 처리 뮤테이션 훅
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CheckInRequest>({
    mutationFn: checkIn,
    onSuccess: (data, variables) => {
      // 해당 스케줄의 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });
      
      console.log("출근 처리 성공:", data);
    },
    onError: (error) => {
      console.error("출근 처리 실패:", error);
    },
  });
};

  // 출석 기록 목록 로드
  const loadRecords = useCallback(async (filter: AttendanceFilter = {}) => {
    try {
      setLoading(true);
      clearError();

      const records = await attendanceService.getAttendanceRecords(filter);
      
      setState(prev => ({
        ...prev,
        records,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('출석 기록 로드 실패:', error);
      setError('출석 기록을 불러오는데 실패했습니다.');
    }
  }, [setLoading, clearError, setError]);

  // 오늘 출석 기록 로드
  const loadTodayRecord = useCallback(async (employeeId: string) => {
    try {
      setLoading(true);
      clearError();

      const today = new Date().toISOString().split('T')[0];
      const record = await attendanceService.getAttendanceByDate(employeeId, today);
      
      setState(prev => ({
        ...prev,
        currentRecord: record,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('오늘 출석 기록 로드 실패:', error);
      setError('오늘 출석 기록을 불러오는데 실패했습니다.');
    }
  }, [setLoading, clearError, setError]);

  // 출석 통계 로드
  const loadStats = useCallback(async (employeeId: string, startDate: string, endDate: string) => {
    try {
      const stats = await attendanceService.getAttendanceStats(employeeId, startDate, endDate);
      
      setState(prev => ({
        ...prev,
        stats,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('출석 통계 로드 실패:', error);
      setError('출석 통계를 불러오는데 실패했습니다.');
    }
  }, [setError]);

  // 출근 처리
  const checkIn = useCallback(async (request: CheckInRequest): Promise<AttendanceRecord> => {
    try {
      setLoading(true);
      clearError();

      const record = await attendanceService.checkIn(request);
      
      setState(prev => ({
        ...prev,
        currentRecord: record,
        records: prev.records.some(r => r.id === record.id)
          ? prev.records.map(r => r.id === record.id ? record : r)
          : [...prev.records, record],
        loading: false,
        lastUpdated: Date.now(),
      }));

      return record;
    } catch (error) {
      console.error('출근 처리 실패:', error);
      setError('출근 처리에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 퇴근 처리
  const checkOut = useCallback(async (request: CheckOutRequest): Promise<AttendanceRecord> => {
    try {
      setLoading(true);
      clearError();

      const record = await attendanceService.checkOut(request);
      
      setState(prev => ({
        ...prev,
        currentRecord: record,
        records: prev.records.map(r => r.id === record.id ? record : r),
        loading: false,
        lastUpdated: Date.now(),
      }));

      return record;
    } catch (error) {
      console.error('퇴근 처리 실패:', error);
      setError('퇴근 처리에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 위치 기반 출근 처리
  const checkInWithLocation = useCallback(async (
    employeeId: string,
    location: LocationData,
    workplaceId?: string,
    notes?: string
  ): Promise<AttendanceRecord> => {
    try {
      setLoading(true);
      clearError();

      const record = await attendanceService.checkInWithLocation(employeeId, location, workplaceId, notes);
      
      setState(prev => ({
        ...prev,
        currentRecord: record,
        records: prev.records.some(r => r.id === record.id)
          ? prev.records.map(r => r.id === record.id ? record : r)
          : [...prev.records, record],
        loading: false,
        lastUpdated: Date.now(),
      }));

      return record;
    } catch (error) {
      console.error('위치 기반 출근 처리 실패:', error);
      setError('출근 처리에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 위치 기반 퇴근 처리
  const checkOutWithLocation = useCallback(async (
    attendanceId: string,
    location: LocationData,
    notes?: string
  ): Promise<AttendanceRecord> => {
    try {
      setLoading(true);
      clearError();

      const record = await attendanceService.checkOutWithLocation(attendanceId, location, notes);
      
      setState(prev => ({
        ...prev,
        currentRecord: record,
        records: prev.records.map(r => r.id === record.id ? record : r),
        loading: false,
        lastUpdated: Date.now(),
      }));

      return record;
    } catch (error) {
      console.error('위치 기반 퇴근 처리 실패:', error);
      setError('퇴근 처리에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 출석 기록 수정
  const updateRecord = useCallback(async (id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    try {
      setLoading(true);
      clearError();

      const record = await attendanceService.updateAttendance(id, updates);
      
      setState(prev => ({
        ...prev,
        records: prev.records.map(r => r.id === id ? record : r),
        currentRecord: prev.currentRecord?.id === id ? record : prev.currentRecord,
        loading: false,
        lastUpdated: Date.now(),
      }));

      return record;
    } catch (error) {
      console.error('출석 기록 수정 실패:', error);
      setError('출석 기록 수정에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 출석 기록 삭제
  const deleteRecord = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await attendanceService.deleteAttendance(id);
      
      setState(prev => ({
        ...prev,
        records: prev.records.filter(r => r.id !== id),
        currentRecord: prev.currentRecord?.id === id ? null : prev.currentRecord,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('출석 기록 삭제 실패:', error);
      setError('출석 기록 삭제에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 결근 처리
  const markAsAbsent = useCallback(async (employeeId: string, workDate: string, reason?: string): Promise<AttendanceRecord> => {
    try {
      setLoading(true);
      clearError();

      const record = await attendanceService.markAsAbsent(employeeId, workDate, reason);
      
      setState(prev => ({
        ...prev,
        records: prev.records.some(r => r.employeeId === employeeId && r.workDate === workDate)
          ? prev.records.map(r => r.employeeId === employeeId && r.workDate === workDate ? record : r)
          : [...prev.records, record],
        currentRecord: attendanceHelpers.isToday(record) ? record : prev.currentRecord,
        loading: false,
        lastUpdated: Date.now(),
      }));

      return record;
    } catch (error) {
      console.error('결근 처리 실패:', error);
      setError('결근 처리에 실패했습니다.');
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // 데이터 새로고침
  const refresh = useCallback(async () => {
    if (employeeId) {
      await Promise.all([
        loadTodayRecord(employeeId),
        loadRecords({ employeeId, limit: 30 }), // 최근 30일
      ]);
    }
  }, [employeeId, loadTodayRecord, loadRecords]);

  // 초기 데이터 로드
  useEffect(() => {
    if (autoLoad && employeeId) {
      refresh();
    }
  }, [autoLoad, employeeId, refresh]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh || !employeeId) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, employeeId, refreshInterval, refresh]);

  // 계산된 값들
  const computed = useMemo(() => {
    const { records, currentRecord } = state;

    return {
      // 오늘 관련
      hasCheckedInToday: currentRecord ? attendanceHelpers.hasCheckedIn(currentRecord) : false,
      hasCheckedOutToday: currentRecord ? attendanceHelpers.hasCheckedOut(currentRecord) : false,
      canCheckIn: !currentRecord || !attendanceHelpers.hasCheckedIn(currentRecord),
      canCheckOut: currentRecord ? attendanceHelpers.hasCheckedIn(currentRecord) && !attendanceHelpers.hasCheckedOut(currentRecord) : false,
      
      // 통계
      todayStatus: currentRecord?.status || null,
      todayWorkTime: currentRecord?.totalWorkMinutes ? attendanceHelpers.formatWorkTime(currentRecord.totalWorkMinutes) : null,
      
      // 최근 기록 분석
      recentRecords: attendanceHelpers.sortRecordsByDate(records.slice(0, 7)),
      workPattern: records.length > 0 ? attendanceHelpers.analyzeWorkPattern(records) : null,
      
      // 필터링된 기록들
      presentDays: records.filter(r => attendanceHelpers.hasCheckedIn(r)),
      absentDays: records.filter(r => r.status === "ABSENT"),
      lateDays: records.filter(r => r.status === "LATE"),
      overtimeDays: records.filter(r => attendanceHelpers.hasOvertime(r)),
      
      // 그룹화된 기록
      recordsByDate: attendanceHelpers.groupRecordsByDate(records),
    };
  }, [state]);

  return {
    // 상태
    ...state,
    
    // 액션
    loadRecords,
    loadTodayRecord,
    loadStats,
    checkIn,
    checkOut,
    checkInWithLocation,
    checkOutWithLocation,
    updateRecord,
    deleteRecord,
    markAsAbsent,
    refresh,
    clearError,
    
    // 계산된 값
    ...computed,
    
    // 헬퍼
    helpers: attendanceHelpers,
  };
};

/**
 * 특정 직원의 출석 현황을 관리하는 훅
 */
export const useEmployeeAttendance = (employeeId: string) => {
  return useAttendance({
    employeeId,
    autoLoad: true,
    autoRefresh: true,
    refreshInterval: 30000,
  });
};

/**
 * 출석 통계만 관리하는 경량 훅
 */
export const useAttendanceStats = (employeeId: string, startDate: string, endDate: string) => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!employeeId || !startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await attendanceService.getAttendanceStats(employeeId, startDate, endDate);
      setStats(result);
    } catch (error) {
      console.error('출석 통계 로드 실패:', error);
      setError('출석 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [employeeId, startDate, endDate]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
};

/**
 * 오늘 출석 기록만 관리하는 간단한 훅
 */
export const useTodayAttendance = (employeeId: string) => {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayRecord = useCallback(async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      const result = await attendanceService.getAttendanceByDate(employeeId, today);
      setRecord(result);
    } catch (error) {
      console.error('오늘 출석 기록 로드 실패:', error);
      setError('오늘 출석 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadTodayRecord();
  }, [loadTodayRecord]);

  const computed = useMemo(() => {
    if (!record) {
      return {
        hasCheckedIn: false,
        hasCheckedOut: false,
        canCheckIn: true,
        canCheckOut: false,
        status: null,
        workTime: null,
      };
    }

    return {
      hasCheckedIn: attendanceHelpers.hasCheckedIn(record),
      hasCheckedOut: attendanceHelpers.hasCheckedOut(record),
      canCheckIn: !attendanceHelpers.hasCheckedIn(record),
      canCheckOut: attendanceHelpers.hasCheckedIn(record) && !attendanceHelpers.hasCheckedOut(record),
      status: record.status,
      workTime: record.totalWorkMinutes ? attendanceHelpers.formatWorkTime(record.totalWorkMinutes) : null,
    };
  }, [record]);

  return {
    record,
    loading,
    error,
    refresh: loadTodayRecord,
    ...computed,
  };
};