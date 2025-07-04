import { AttendanceRes, DailyAttendanceRes, AttendanceStatus } from "../types";

/**
 * 테스트용 출근 기록 데이터
 */

// 오늘 날짜 계산
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

/**
 * 기본 출근 기록 템플릿
 */
const createBaseAttendance = (id: number, overrides: Partial<AttendanceRes> = {}): AttendanceRes => ({
  id,
  workScheduleId: 100 + id,
  userId: 1,
  workplaceId: 1,
  workDate: todayStr,
  scheduledStartTime: "09:00",
  scheduledEndTime: "18:00",
  actualStartTime: undefined,
  actualEndTime: undefined,
  clockInTypes: [],
  clockInTypesKorean: "",
  clockOutTypes: [],
  clockOutTypesKorean: "",
  status: AttendanceStatus.SCHEDULED,
  statusKorean: "예정",
  isAdditionalWork: false,
  actualWorkingMinutes: undefined,
  allAttendanceInfo: "",
  notes: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * 시나리오별 테스트 데이터
 */

// 1. 정규 근무 - 예정 상태 (오늘)
export const normalScheduled: AttendanceRes = createBaseAttendance(1, {
  workDate: todayStr,
  scheduledStartTime: "09:00",
  scheduledEndTime: "18:00",
  status: AttendanceStatus.SCHEDULED,
  statusKorean: "예정",
});

// 2. 정규 근무 - 진행 중 상태 (출근 완료)
export const normalInProgress: AttendanceRes = createBaseAttendance(2, {
  workDate: todayStr,
  scheduledStartTime: "09:00",
  scheduledEndTime: "18:00",
  actualStartTime: "2024-12-01T09:15:00",
  clockInTypes: ["NORMAL"],
  clockInTypesKorean: "정상출근",
  status: AttendanceStatus.IN_PROGRESS,
  statusKorean: "근무중",
  allAttendanceInfo: "정상출근",
});

// 3. 정규 근무 - 완료 상태
export const normalCompleted: AttendanceRes = createBaseAttendance(3, {
  workDate: yesterdayStr,
  scheduledStartTime: "09:00",
  scheduledEndTime: "18:00",
  actualStartTime: "2024-11-30T09:00:00",
  actualEndTime: "2024-11-30T18:00:00",
  clockInTypes: ["NORMAL"],
  clockInTypesKorean: "정상출근",
  clockOutTypes: ["NORMAL"],
  clockOutTypesKorean: "정상퇴근",
  status: AttendanceStatus.COMPLETED,
  statusKorean: "근무완료",
  actualWorkingMinutes: 480, // 8시간
  allAttendanceInfo: "정상출근, 정상퇴근",
});

// 4. 조기 출근 진행 중
export const earlyArrivalInProgress: AttendanceRes = createBaseAttendance(4, {
  workDate: todayStr,
  scheduledStartTime: "09:00",
  scheduledEndTime: "18:00",
  actualStartTime: "2024-12-01T08:30:00",
  clockInTypes: ["EARLY_ARRIVAL"],
  clockInTypesKorean: "조기출근",
  status: AttendanceStatus.IN_PROGRESS,
  statusKorean: "근무중",
  allAttendanceInfo: "조기출근",
  notes: "미팅 준비를 위해 일찍 출근",
});

// 5. 야간 근무 - 시작 (23:00-07:00)
export const overnightWorkStart: AttendanceRes = createBaseAttendance(5, {
  workDate: todayStr,
  scheduledStartTime: "23:00",
  scheduledEndTime: "07:00",
  status: AttendanceStatus.SCHEDULED,
  statusKorean: "예정",
  allAttendanceInfo: "야간근무",
});

// 6. 야간 근무 - 진행 중 (출근 완료)
export const overnightWorkInProgress: AttendanceRes = createBaseAttendance(6, {
  workDate: todayStr,
  scheduledStartTime: "23:00",
  scheduledEndTime: "07:00",
  actualStartTime: "2024-12-01T23:00:00",
  clockInTypes: ["NORMAL"],
  clockInTypesKorean: "정상출근",
  status: AttendanceStatus.IN_PROGRESS,
  statusKorean: "근무중",
  allAttendanceInfo: "정상출근",
});

// 7. 추가 근무 - 예정
export const additionalWorkScheduled: AttendanceRes = createBaseAttendance(7, {
  workScheduleId: undefined, // 추가 근무는 일정 ID가 없을 수 있음
  workDate: todayStr,
  scheduledStartTime: "19:00",
  scheduledEndTime: "22:00",
  status: AttendanceStatus.SCHEDULED,
  statusKorean: "예정",
  isAdditionalWork: true,
  allAttendanceInfo: "추가근무",
  notes: "프로젝트 마감을 위한 추가 근무",
});

// 8. 추가 근무 - 진행 중
export const additionalWorkInProgress: AttendanceRes = createBaseAttendance(8, {
  workScheduleId: undefined,
  workDate: todayStr,
  scheduledStartTime: "19:00",
  scheduledEndTime: "22:00",
  actualStartTime: "2024-12-01T19:15:00",
  clockInTypes: ["NORMAL"],
  clockInTypesKorean: "정상출근",
  status: AttendanceStatus.IN_PROGRESS,
  statusKorean: "근무중",
  isAdditionalWork: true,
  allAttendanceInfo: "정상출근",
  notes: "긴급 업무 처리",
});

// 9. 추가 근무 - 완료
export const additionalWorkCompleted: AttendanceRes = createBaseAttendance(9, {
  workScheduleId: undefined,
  workDate: yesterdayStr,
  scheduledStartTime: "19:00",
  scheduledEndTime: "22:00",
  actualStartTime: "2024-11-30T19:00:00",
  actualEndTime: "2024-11-30T22:30:00",
  clockInTypes: ["NORMAL"],
  clockInTypesKorean: "정상출근",
  clockOutTypes: ["LATE_DEPARTURE"],
  clockOutTypesKorean: "연장근무",
  status: AttendanceStatus.COMPLETED,
  statusKorean: "근무완료",
  isAdditionalWork: true,
  actualWorkingMinutes: 210, // 3.5시간
  allAttendanceInfo: "정상출근, 연장근무",
  notes: "서버 점검 작업 완료",
});

// 10. 조퇴 완료
export const earlyDepartureCompleted: AttendanceRes = createBaseAttendance(10, {
  workDate: yesterdayStr,
  scheduledStartTime: "09:00",
  scheduledEndTime: "18:00",
  actualStartTime: "2024-11-30T09:00:00",
  actualEndTime: "2024-11-30T15:00:00",
  clockInTypes: ["NORMAL"],
  clockInTypesKorean: "정상출근",
  clockOutTypes: ["EARLY_DEPARTURE"],
  clockOutTypesKorean: "조퇴",
  status: AttendanceStatus.COMPLETED,
  statusKorean: "근무완료",
  actualWorkingMinutes: 300, // 5시간 (점심시간 제외)
  allAttendanceInfo: "정상출근, 조퇴",
  notes: "개인 사정으로 인한 조퇴",
});

/**
 * 일별 출근 현황 데이터
 */

// 오늘의 출근 현황 (여러 일정)
export const todayDailyAttendance: DailyAttendanceRes = {
  date: todayStr,
  attendances: [
    normalScheduled,
    normalInProgress,
    overnightWorkStart,
    overnightWorkInProgress,
    additionalWorkScheduled,
    additionalWorkInProgress,
  ],
  totalCount: 6,
  completedCount: 0,
  inProgressCount: 2,
  additionalWorkCount: 2,
};

// 어제의 출근 현황 (완료된 일정들)
export const yesterdayDailyAttendance: DailyAttendanceRes = {
  date: yesterdayStr,
  attendances: [
    normalCompleted,
    additionalWorkCompleted,
    earlyDepartureCompleted,
  ],
  totalCount: 3,
  completedCount: 3,
  inProgressCount: 0,
  additionalWorkCount: 1,
};

// 내일의 출근 현황 (예정된 일정들)
export const tomorrowDailyAttendance: DailyAttendanceRes = {
  date: tomorrowStr,
  attendances: [
    createBaseAttendance(11, {
      workDate: tomorrowStr,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      status: AttendanceStatus.SCHEDULED,
      statusKorean: "예정",
    }),
    createBaseAttendance(12, {
      workScheduleId: undefined,
      workDate: tomorrowStr,
      scheduledStartTime: "20:00",
      scheduledEndTime: "23:00",
      status: AttendanceStatus.SCHEDULED,
      statusKorean: "예정",
      isAdditionalWork: true,
      notes: "주간 보고서 작성",
    }),
  ],
  totalCount: 2,
  completedCount: 0,
  inProgressCount: 0,
  additionalWorkCount: 1,
};

/**
 * 전체 테스트 데이터 맵
 */
export const mockAttendanceData = {
  // 개별 출근 기록
  attendances: {
    1: normalScheduled,
    2: normalInProgress,
    3: normalCompleted,
    4: earlyArrivalInProgress,
    5: overnightWorkStart,
    6: overnightWorkInProgress,
    7: additionalWorkScheduled,
    8: additionalWorkInProgress,
    9: additionalWorkCompleted,
    10: earlyDepartureCompleted,
  },

  // 일별 현황
  daily: {
    [todayStr]: todayDailyAttendance,
    [yesterdayStr]: yesterdayDailyAttendance,
    [tomorrowStr]: tomorrowDailyAttendance,
  },

  // 활성 출근 기록 (진행 중인 것들)
  active: [normalInProgress, earlyArrivalInProgress, overnightWorkInProgress, additionalWorkInProgress],
};

/**
 * 날짜별 데이터 생성 헬퍼
 */
export const generateDateData = (date: string): DailyAttendanceRes => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // 주말인 경우 빈 데이터
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      date,
      attendances: [],
      totalCount: 0,
      completedCount: 0,
      inProgressCount: 0,
      additionalWorkCount: 0,
    };
  }

  // 평일인 경우 기본 일정 생성
  const baseId = Math.floor(Math.random() * 1000) + 100;
  const attendance = createBaseAttendance(baseId, {
    workDate: date,
    scheduledStartTime: "09:00",
    scheduledEndTime: "18:00",
    status: date < todayStr ? AttendanceStatus.COMPLETED : AttendanceStatus.SCHEDULED,
    statusKorean: date < todayStr ? "근무완료" : "예정",
    ...(date < todayStr && {
      actualStartTime: `${date}T09:00:00`,
      actualEndTime: `${date}T18:00:00`,
      clockInTypes: ["NORMAL"],
      clockInTypesKorean: "정상출근",
      clockOutTypes: ["NORMAL"],
      clockOutTypesKorean: "정상퇴근",
      actualWorkingMinutes: 480,
      allAttendanceInfo: "정상출근, 정상퇴근",
    }),
  });

  return {
    date,
    attendances: [attendance],
    totalCount: 1,
    completedCount: date < todayStr ? 1 : 0,
    inProgressCount: 0,
    additionalWorkCount: 0,
  };
};