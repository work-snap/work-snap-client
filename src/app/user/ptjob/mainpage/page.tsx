"use client";

import Link from "next/link";
import Navigation from "../../../components/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/src/lib/queries/useUser";

export default function PtjobMainPage() {
  const { data: user } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workStatus, setWorkStatus] = useState("before"); // before, early, working, done
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
  // 날짜 포맷
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 시간 포맷을 초 단위까지 포함하여 실시간 갱신
  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [currentTime, setCurrentTime] = useState(getFormattedTime());

  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  // 현재 시각 실시간 갱신 (1분마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEarlyStart = () => {
    if (workStatus === "working") {
      // 조퇴하기 버튼 누르면 isEarlyLeave 토글
      setIsEarlyLeave((prev) => !prev);
    } else if (workStatus === "early") {
      setWorkStatus("before");
      setIsEarlyStart(false);
    } else {
      setWorkStatus("early");
      setIsEarlyStart(true);
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

  const handleStart = () => {
    const now = getFormattedTime();
    setStartTime(now);
    setWorkStatus("working");
    setIsEarlyStart(workStatus === "early");
  };

  const handleEnd = () => {
    const now = getFormattedTime();
    if (isEarlyLeave || workStatus === "working") {
      setEndTime(now);
      setWorkStatus("done");

    }
  }, [isLoading, location, getCurrentPosition, currentEmployeeId, currentWorkplaceId, isEarlyStart]);


  const getStatusButton = (status: string) => {
    if (status === "working") {
      if (isEarlyLeave) {
        return (
          <span className="text-sub3 text-xs font-medium bg-white rounded-full px-4 py-2">
            정시퇴근
          </span>
        );
      } else {
        return (
          <span className="text-sub3 text-xs font-medium bg-white rounded-full px-4 py-2">
            조퇴하기
          </span>
        );
      }
    }

    switch (status) {
      case "before":
        return (
          <span className="text-white text-xs font-medium bg-main rounded-full px-4 py-2">
            조기출근
          </span>
        );
      case "early":
        return (
          <span className="text-white text-xs font-medium bg-main rounded-full px-4 py-2">
            정시출근
          </span>
        );
      case "done":
        return null;
      default:
        return (
          <span className="text-white text-xs font-medium bg-main rounded-full px-4 py-2">
            조기출근
          </span>
        );
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
          <span className="text-[18px] font-bold text-gray5">
            {user?.nickname}
          </span>
          <span className="bg-main2 text-gray1 text-xs font-semibold rounded-full px-2 py-1">
            알바님
          </span>
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-main text-xl text-center font-extrabold whitespace-pre-line bg-gray1 rounded-3xl px-20 py-10 mb-4">
            {"사장님께서 알바님\n인증번호를 등록할 때까지\n잠시 기다려주세요."}
          </div>
          <button
            onClick={() => setIsAuthenticated(true)}
            className="mt-4 px-6 py-2 bg-main text-white rounded-lg font-medium"
          >
            인증하기
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-4 bg-main rounded-xl mb-5 mx-4">
            <button className="text-white" onClick={goToPreviousDay}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
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
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* 근무 시간표 */}
          <div className="flex-1 px-4 space-y-3">
            <div className="bg-white rounded-xl border border-gray2">
              <div
                className={`flex items-center justify-between mb-4 ${
                  workStatus === "working"
                    ? "bg-sub3"
                    : workStatus === "done"
                    ? "bg-main"
                    : "bg-gray1"
                } p-3 rounded-t-xl`}
              >
                <span
                  className={`font-bold ${
                    workStatus === "working" || workStatus === "done"
                      ? "text-white"
                      : "text-main"
                  }`}
                >
                  스타벅스 해운대점
                </span>
                <div
                  onClick={handleEarlyStart}
                  className="cursor-pointer select-none"
                >
                  {getStatusButton(workStatus)}
                </div>
              </div>

              {/* 상태 메시지 */}
              <div
                className={`flex items-center text-xs mb-3 px-6 ${
                  workStatus === "working"
                    ? "text-sub3"
                    : workStatus === "done"
                    ? "text-main"
                    : "text-gray3"
                }`}
              >
                {workStatus === "done" ? (
                  <svg
                    className="w-4 h-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (

                  <svg
                    className="w-4 h-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"

                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>

                )}
                {workStatus === "working"
                  ? "열심히 일하고 있어요"
                  : workStatus === "done"
                  ? "오늘 업무 완료"
                  : `아직 출근 전입니다.`}
              </div>

              {/* 시간 영역 */}
              <div className="flex flex-col gap-1 mb-3 px-2">
                <div className="flex justify-around text-xs text-gray3">
                  <span
                    className={`border rounded-full px-2 py-1 ${
                      workStatus === "working"
                        ? "border-sub3 text-sub3"
                        : workStatus === "done"
                        ? "border-main text-main"
                        : "border-gray3"
                    }`}
                  >
                    {currentDate}
                  </span>
                  <span
                    className={`border rounded-full px-2 py-1 ${
                      workStatus === "working"
                        ? "border-sub3 text-sub3"
                        : workStatus === "done"
                        ? "border-main text-main"
                        : "border-gray3"
                    }`}
                  >
                    {currentDate}
                  </span>
                </div>
                <div className="flex justify-around px-5">
                  {/* 출근 시간 */}
                  <div className="flex flex-col">
                    <div
                      className={`text-4xl font-bold ${
                        workStatus === "working"
                          ? "text-sub3"
                          : workStatus === "done"
                          ? "text-main"
                          : ""
                      }`}
                    >
                      09:00
                    </div>
                    <div
                      className={`text-md ${
                        workStatus === "working"
                          ? "text-sub3"
                          : workStatus === "done"
                          ? "text-main"
                          : "text-gray3"
                      }`}
                    >
                      {workStatus === "working" || workStatus === "done"
                        ? isEarlyStart
                          ? `조기출근 ${startTime}`
                          : `출근 ${startTime}`
                        : `현재시각 ${currentTime}`}
                    </div>
                  </div>

                  <div
                    className={`text-2xl font-bold ${
                      workStatus === "working"
                        ? "text-sub3"
                        : workStatus === "done"
                        ? "text-main"
                        : "text-gray3"
                    } self-start -mt-2`}
                  >
                    . . .
                  </div>

                  {/* 퇴근 시간 */}
                  <div className="flex flex-col">
                    <div
                      className={`text-4xl font-bold ${
                        workStatus === "working"
                          ? "text-sub3"
                          : workStatus === "done"
                          ? "text-main"
                          : ""
                      }`}
                    >
                      15:00
                    </div>
                    <div
                      className={`text-md ${
                        workStatus === "working"
                          ? "text-gray3"
                          : workStatus === "done"
                          ? "text-main"
                          : "text-gray1"
                      }`}
                    >
                      {workStatus === "working"
                        ? `현재시각 ${currentTime}`
                        : workStatus === "done"
                        ? isEarlyLeave
                          ? `조퇴 ${endTime}`
                          : `퇴근 ${endTime}`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>

              {getActionButton(workStatus)}
            </div>
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
