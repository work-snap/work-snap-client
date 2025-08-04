"use client";

import Link from "next/link";
import Navigation from "../../../components/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useDateNavigation, DateNavigationProvider } from "@/context/DateContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { attendanceService, AttendanceRecord } from "@/services/attendanceService";
import { locationService } from "@/services/locationService";
import { scheduleService, WorkSchedule } from "@/services/scheduleService";
import { WorkCard, WorkInfo, createWorkInfo } from "@/components/WorkCard";
import { AttendanceStatus } from "@/components/StatusChip";
import { formatDate } from "@/utils/dateUtils";
import { usePushNotification } from "@/services/pushNotificationService";
import { NotificationSettings } from "@/components/NotificationSettings";
import { ToastContainer, useToast } from "@/components/Toast";

// 메인 컴포넌트
function PtjobMainPageContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEarlyStart, setIsEarlyStart] = useState(false);
  const [isEarlyLeave, setIsEarlyLeave] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  // 실시간 시간 관리
  const { currentTime, formattedTime } = useCurrentTime({
    updateInterval: 1000, // 1초마다 업데이트
    enableServerSync: true
  });
  
  // 푸시 알림 관리
  const pushNotification = usePushNotification();
  
  // 토스트 관리
  const { toasts, removeToast } = useToast();
  
  // 날짜 네비게이션
  const { currentDate, goToPreviousDay, goToNextDay, goToToday } = useDateNavigation();
  
  // GPS 위치 정보
  const {
    location,
    getCurrentPosition,
    loading: locationLoading,
    error: locationError,
    hasPermission,
    needsPermission
  } = useGeolocation({ autoRequest: false });

  // 임시 직원 및 사업장 ID
  const currentEmployeeId = "temp-employee-001"; // 임시 직원 ID
  const currentWorkplaceId = "temp-workplace-001"; // 임시 사업장 ID
  
  // 오늘 출석 기록 불러오기
  useEffect(() => {
    const loadTodayAttendance = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const record = await attendanceService.getAttendanceByDate(currentEmployeeId, today);
        setTodayAttendance(record);
      } catch (error) {
        console.error('오늘 출석 기록 로드 실패:', error);
      }
    };

    if (isAuthenticated) {
      loadTodayAttendance();
    }
  }, [isAuthenticated, currentEmployeeId]);

  // 선택된 날짜의 스케줄 불러오기
  useEffect(() => {
    const loadSchedules = async () => {
      if (!isAuthenticated) return;

      try {
        setSchedulesLoading(true);
        const selectedDateStr = currentDate.toISOString().split('T')[0];
        const scheduleData = await scheduleService.getSchedulesByDate(selectedDateStr, currentEmployeeId);
        setSchedules(scheduleData);
        
        // 오늘 날짜의 스케줄에 대해 알림 등록
        const today = new Date().toISOString().split('T')[0];
        if (selectedDateStr === today) {
          scheduleAlarmRegistration(scheduleData);
        }
      } catch (error) {
        console.error('스케줄 로드 실패:', error);
        setSchedules([]); // 에러 시 빈 배열로 설정
      } finally {
        setSchedulesLoading(false);
      }
    };

    loadSchedules();
  }, [isAuthenticated, currentDate, currentEmployeeId]);

  // 스케줄 알림 등록 함수
  const scheduleAlarmRegistration = useCallback(async (scheduleData: WorkSchedule[]) => {
    try {
      // 알림 권한 확인
      const permissionState = pushNotification.getPermissionState();
      if (permissionState.permission !== 'granted') {
        console.log('알림 권한이 없어서 알림 등록을 건너뜁니다.');
        return;
      }

      // 서비스 워커 등록
      await pushNotification.service.registerServiceWorker();

      // 오늘 날짜의 활성 스케줄만 필터링
      const today = new Date().toISOString().split('T')[0];
      const activeSchedules = scheduleData.filter(schedule => 
        schedule.workDate === today && 
        schedule.isActive
      );

      // 각 스케줄에 대해 10분 전 알림 등록
      for (const schedule of activeSchedules) {
        const workStartTime = new Date(`${schedule.workDate}T${schedule.startTime}:00`);
        const workplaceName = schedule.workLocation || '직장';
        
        // 현재 시간보다 미래인 경우만 알림 등록
        if (workStartTime > new Date()) {
          const notificationId = pushNotification.scheduleWorkReminder(
            workStartTime,
            workplaceName,
            schedule.id
          );
          
          if (notificationId) {
            console.log(`알림 등록 완료: ${schedule.id} - ${workStartTime.toLocaleTimeString()}`);
          }
        }
      }
    } catch (error) {
      console.error('알림 등록 실패:', error);
    }
  }, [pushNotification]);

  // 컴포넌트 마운트 시 알림 권한 요청 및 FCM 초기화
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const permissionState = pushNotification.getPermissionState();
        if (permissionState.supported && permissionState.permission === 'granted') {
          // 권한이 허용된 경우 FCM 초기화
          await pushNotification.service.initializeFCM();
        } else if (permissionState.supported && permissionState.permission === 'default') {
          // 자동으로 권한 요청하지 않고 사용자 동작에 따라 요청
          console.log('알림 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
        }
      } catch (error) {
        console.error('알림 초기화 실패:', error);
      }
    };

    initializeNotifications();
  }, [pushNotification]);

  const handleStart = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // GPS 위치 정보 요청
      if (!location) {
        await getCurrentPosition();
        return;
      }
      
      // 위치 인증
      const authResult = await locationService.authenticateCheckIn(
        currentEmployeeId,
        location,
        currentWorkplaceId
      );
      
      if (!authResult.isAuthenticated) {
        setError(authResult.message || '위치 인증에 실패했습니다.');
        return;
      }
      
      // 출근 처리
      const attendanceRecord = await attendanceService.checkInWithLocation(
        currentEmployeeId,
        location,
        currentWorkplaceId,
        isEarlyStart ? "조기 출근" : undefined
      );
      
      setTodayAttendance(attendanceRecord);
      console.log('출근 완료:', attendanceRecord);
      
    } catch (error: any) {
      setError(error.message || '출근 처리에 실패했습니다.');
      console.error('출근 처리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location, getCurrentPosition, currentEmployeeId, currentWorkplaceId, isEarlyStart]);

  const handleEnd = useCallback(async () => {
    if (isLoading || !todayAttendance) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // GPS 위치 정보 요청
      if (!location) {
        await getCurrentPosition();
        return;
      }
      
      // 위치 인증
      const authResult = await locationService.authenticateCheckOut(
        currentEmployeeId,
        location,
        currentWorkplaceId
      );
      
      if (!authResult.isAuthenticated) {
        setError(authResult.message || '위치 인증에 실패했습니다.');
        return;
      }
      
      // 퇴근 처리
      const updatedRecord = await attendanceService.checkOutWithLocation(
        todayAttendance.id,
        location,
        isEarlyLeave ? "조기 퇴근" : undefined
      );
      
      setTodayAttendance(updatedRecord);
      console.log('퇴근 완료:', updatedRecord);
      
    } catch (error: any) {
      setError(error.message || '퇴근 처리에 실패했습니다.');
      console.error('퇴근 처리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location, getCurrentPosition, currentEmployeeId, currentWorkplaceId, todayAttendance, isEarlyLeave]);


  // WorkSchedule을 WorkInfo로 변환하는 함수
  const transformScheduleToWorkInfo = useCallback((schedule: WorkSchedule, attendanceRecord?: AttendanceRecord | null): WorkInfo => {
    // 스케줄에 맞는 출석 기록 찾기
    const scheduleAttendance = attendanceRecord && 
      attendanceRecord.workDate === schedule.workDate &&
      attendanceRecord.workplaceId === schedule.id ? attendanceRecord : null;

    // 출석 상태 계산
    const getAttendanceStatus = (): AttendanceStatus => {
      if (scheduleAttendance) {
        const hasCheckedIn = !!scheduleAttendance.actualStartTime;
        const hasCheckedOut = !!scheduleAttendance.actualEndTime;
        
        if (hasCheckedIn && hasCheckedOut) {
          return "NORMAL"; // 정상 완료
        } else if (hasCheckedIn) {
          return "NORMAL"; // 근무 중
        }
      }
      
      // 현재 시간 기반 상태 계산
      const now = currentTime;
      const today = now.toDateString();
      const selectedDay = currentDate.toDateString();
      
      if (today !== selectedDay) {
        return "NORMAL"; // 다른 날짜는 정상으로 표시
      }
      
      const currentTimeStr = now.toTimeString().slice(0, 5);
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const currentMinutes = timeToMinutes(currentTimeStr);
      const startMinutes = timeToMinutes(schedule.startTime);
      
      if (currentMinutes < startMinutes - 30) {
        return "NORMAL"; // 시작 전
      } else if (currentMinutes < startMinutes) {
        return "EARLY_ARRIVAL"; // 조기 출근 가능
      } else {
        return "NORMAL"; // 근무 시간
      }
    };

    return createWorkInfo({
      id: schedule.id,
      employeeId: schedule.employeeId,
      employeeName: schedule.employeeName || "직원",
      workDate: new Date(schedule.workDate),
      scheduledStartTime: schedule.startTime,
      scheduledEndTime: schedule.endTime,
      actualStartTime: scheduleAttendance?.actualStartTime,
      actualEndTime: scheduleAttendance?.actualEndTime,
      status: getAttendanceStatus(),
      workLocation: schedule.workLocation || `근무지`,
      isFlexTime: schedule.isFlexible,
      notes: schedule.description,
    });
  }, [currentTime, currentDate]);

  // WorkCard의 체크인 핸들러
  const handleWorkCardCheckIn = useCallback(async (workInfo: WorkInfo) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // GPS 위치 정보 요청
      if (!location) {
        await getCurrentPosition();
        return;
      }
      
      // 위치 인증
      const authResult = await locationService.authenticateCheckIn(
        workInfo.employeeId,
        location,
        workInfo.id // workInfo.id가 workplaceId 역할
      );
      
      if (!authResult.isAuthenticated) {
        setError(authResult.message || '위치 인증에 실패했습니다.');
        return;
      }
      
      // 출근 처리
      const attendanceRecord = await attendanceService.checkInWithLocation(
        workInfo.employeeId,
        location,
        workInfo.id,
        workInfo.status === "EARLY_ARRIVAL" ? "조기 출근" : undefined
      );
      
      setTodayAttendance(attendanceRecord);
      console.log('출근 완료:', attendanceRecord);
      
    } catch (error: any) {
      setError(error.message || '출근 처리에 실패했습니다.');
      console.error('출근 처리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location, getCurrentPosition]);

  // WorkCard의 체크아웃 핸들러
  const handleWorkCardCheckOut = useCallback(async (workInfo: WorkInfo) => {
    if (isLoading || !todayAttendance) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // GPS 위치 정보 요청
      if (!location) {
        await getCurrentPosition();
        return;
      }
      
      // 위치 인증
      const authResult = await locationService.authenticateCheckOut(
        workInfo.employeeId,
        location,
        workInfo.id
      );
      
      if (!authResult.isAuthenticated) {
        setError(authResult.message || '위치 인증에 실패했습니다.');
        return;
      }
      
      // 퇴근 처리
      const updatedRecord = await attendanceService.checkOutWithLocation(
        todayAttendance.id,
        location,
        isEarlyLeave ? "조기 퇴근" : undefined
      );
      
      setTodayAttendance(updatedRecord);
      console.log('퇴근 완료:', updatedRecord);
      
    } catch (error: any) {
      setError(error.message || '퇴근 처리에 실패했습니다.');
      console.error('퇴근 처리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location, getCurrentPosition, todayAttendance, isEarlyLeave]);

  // 스케줄을 WorkCard로 렌더링하는 함수
  const renderScheduleCard = useCallback((schedule: WorkSchedule, index: number) => {
    // WorkSchedule을 WorkInfo로 변환
    const workInfo = transformScheduleToWorkInfo(schedule, todayAttendance);
    
    return (
      <WorkCard
        key={schedule.id}
        workInfo={workInfo}
        size="md"
        variant="default"
        showActions={true}
        onCheckIn={handleWorkCardCheckIn}
        onCheckOut={handleWorkCardCheckOut}
      />
    );
  }, [transformScheduleToWorkInfo, todayAttendance, handleWorkCardCheckIn, handleWorkCardCheckOut]);

  return (
    <div className="min-h-screen flex flex-col max-w-[430px] w-full mx-auto relative pb-[80px]">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-main text-[26px] font-extrabold tracking-tight">
          Work Snap
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotificationSettings(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="알림 설정"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <span className="text-[18px] font-bold text-gray5">SOO</span>
          <span className="bg-main2 text-gray1 text-xs font-semibold rounded-full px-2 py-1">
            알바님
          </span>
        </div>
      </header>

      {!isAuthenticated ? (
        // 인증 전 화면
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-main text-xl text-center font-extrabold whitespace-pre-line bg-gray1 rounded-3xl px-20 py-10 mb-4">
            {"사장님께서 알바님\n인증번호를 등록할 때까지\n잠시 기다려주세요."}
          </div>
          {/* 테스트용 인증 버튼 */}
          <button
            onClick={() => setIsAuthenticated(true)}
            className="mt-4 px-6 py-2 bg-main text-white rounded-lg font-medium"
          >
            인증하기
          </button>
        </div>
      ) : (
        // 인증 후 화면
        <>
          {/* 날짜 선택 */}
          <div className="flex items-center justify-between px-3 py-4 bg-main rounded-xl mb-5 mx-4">
            <button className="text-white" onClick={goToPreviousDay}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span className="text-lg font-bold text-white">
              {formatDate(currentDate, { showYear: true, locale: 'ko-KR' })}
            </span>
            <button 
              className="text-white text-xs bg-white bg-opacity-20 rounded px-2 py-1"
              onClick={goToToday}
              title="오늘로 이동"
            >
              오늘
            </button>
            <button className="text-white" onClick={goToNextDay}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* 근무 시간표 - WorkCard 컴포넌트 적용 */}
          <div className="flex-1 px-4">
            {schedulesLoading ? (
              <div className="bg-white rounded-xl border border-gray2 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main mx-auto mb-4"></div>
                <p className="text-gray-500">스케줄을 불러오는 중...</p>
              </div>
            ) : schedules.length > 0 ? (
              <div className="space-y-3">
                {schedules.map((schedule, index) => renderScheduleCard(schedule, index))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray2 p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 21 9v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008ZM15 15h.008v.008H15V15Zm0 2.25h.008v.008H15v-.008ZM16.5 15h.008v.008H16.5V15Zm0 2.25h.008v.008H16.5v-.008Z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  스케줄이 없습니다
                </h3>
                <p className="text-gray-500 mb-4">
                  {formatDate(currentDate, { showYear: false, locale: 'ko-KR' })}에 등록된 근무 일정이 없습니다.
                </p>
                <Link
                  href="/user/ptjob/add-work"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-main bg-main/10 hover:bg-main/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  근무 추가하기
                </Link>
              </div>
            )}
          </div>

          {/* 추가 버튼 */}
          <div className="px-4 py-10">
            <div className="w-full py-5 bg-gray2 rounded-xl text-gray5 font-bold flex items-center justify-center">
              <Link href="/user/ptjob/add-work">추가근무 +</Link>
            </div>
          </div>
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 text-sm underline"
              >
                닫기
              </button>
            </div>
          )}
          
          {/* 위치 권한 요청 메시지 */}
          {needsPermission && (
            <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 text-sm font-medium">
                  출석을 위해 위치 권한이 필요합니다.
                </span>
              </div>
              <button
                onClick={getCurrentPosition}
                className="mt-2 text-yellow-600 text-sm underline"
              >
                위치 권한 허용하기
              </button>
            </div>
          )}
          
          {/* 위치 에러 메시지 */}
          {locationError && (
            <div className="mx-4 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <span className="text-orange-800 text-sm font-medium block">
                    {locationError.message}
                  </span>
                  <span className="text-orange-600 text-xs">
                    GPS를 켜거나 실외로 이동해 주세요.
                  </span>
                </div>
              </div>
              <button
                onClick={getCurrentPosition}
                className="mt-2 text-orange-600 text-sm underline"
              >
                다시 시도
              </button>
            </div>
          )}
        </>
      )}

      {/* 알림 설정 모달 */}
      {showNotificationSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">알림 설정</h2>
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <NotificationSettings
                onSettingsChange={(settings) => {
                  console.log('알림 설정 변경:', settings);
                  // 설정 변경 시 스케줄 알림 재등록
                  if (settings.workReminderEnabled) {
                    scheduleAlarmRegistration(schedules);
                  } else {
                    pushNotification.cancelAllScheduledNotifications();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <Navigation />
      
      {/* 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// DateNavigationProvider로 감싸진 메인 컴포넌트
export default function PtjobMainPage() {
  return (
    <DateNavigationProvider>
      <PtjobMainPageContent />
    </DateNavigationProvider>
  );
}
