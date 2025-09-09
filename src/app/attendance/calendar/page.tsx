"use client";
import { useCallback, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  getDaysInMonth,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useGetMyWP } from "@/lib/queries/getMyWP";
import { useSearchParams } from "next/navigation";
import ColorWorkplaceDropdown from "../add-work/components/ColorWorkplaceDropDown";
import {
  attendanceService,
  AttendanceRecord,
} from "@/services/attendanceService";
import { fetchDailySchedules } from "@/api/attendanceApi";
import {
  ScedulesProps,
  AttendanceRecordProps,
} from "@/app/attendance/components/types";

interface AddWorkForm {
  date: string;
  workplaceId: number | null;
  startTime: string;
  endTime: string;
  notes: string;
}

interface Schedule {
  id: number;
  workplaceId: number;
  dayOfWeek: string; // SUNDAY, MONDAY, ...
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface WorkplaceSummary {
  id: number;
  workplaceName: string;
  workplaceType: string | null;
  workplaceAddress: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  workplaceColorIndex: number;
  contractStartDate: string;
  contractEndDate: string;
  schedules?: Schedule[];
}

const getColorFromIndex = (index: number) => {
  const colors = ["#eeace3", "#fcdd2c", "#08fd31", "#44d1fc", "#b700ff"];
  return colors[index % colors.length];
};

// 시간 문자열을 분 단위로 변환하는 함수
const parseTimeToMinutes = (timeStr: string): number => {
  try {
    // HH:mm 또는 HH:mm:ss 형식 지원
    const timePart = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
    const [hours, minutes] = timePart.split(":").map(Number);
    const result = hours * 60 + (minutes || 0);

    return result;
  } catch (error) {
    console.error("시간 파싱 오류:", { timeStr, error });
    return 0;
  }
};

// 조퇴 여부 판단 함수
const isEarlyDeparture = (
  schedule: ScedulesProps,
  attendanceRecord: AttendanceRecordProps
) => {
  if (!attendanceRecord.isCheckedOut || !attendanceRecord.checkOutTime) {
    return false; // 아직 퇴근하지 않음
  }

  try {
    // 예정 종료 시간과 실제 퇴근 시간을 분 단위로 변환
    const scheduledEndMinutes = parseTimeToMinutes(schedule.endTime);
    const actualEndMinutes = parseTimeToMinutes(attendanceRecord.checkOutTime);

    // 1분 이상 일찍 퇴근한 경우 조퇴로 판단 (더 민감하게)
    const diffMinutes = scheduledEndMinutes - actualEndMinutes;
    const isEarly = diffMinutes >= 1;

    return isEarly;
  } catch (error) {
    console.error("조퇴 판단 오류:", error);
    return false;
  }
};

// 지각 여부 판단 함수
const isLateArrival = (
  schedule: ScedulesProps,
  attendanceRecord: AttendanceRecordProps
) => {
  if (!attendanceRecord.isCheckedIn || !attendanceRecord.checkInTime) {
    return false;
  }

  try {
    // 예정 시작 시간과 실제 출근 시간을 분 단위로 변환
    const scheduledStartMinutes = parseTimeToMinutes(schedule.startTime);
    const actualStartMinutes = parseTimeToMinutes(attendanceRecord.checkInTime);

    // 5분 이상 늦게 출근한 경우 지각으로 판단 (테스트용으로 낮춤)
    const diffMinutes = actualStartMinutes - scheduledStartMinutes;
    const isLate = diffMinutes >= 5;

    return isLate;
  } catch (error) {
    console.error("지각 판단 오류:", error);
    return false;
  }
};

// 실시간 무단결근 판단 함수
const isRealtimeAbsent = (schedule: any, currentTime: Date): boolean => {
  // 출근 기록이 있는 경우는 무단결근이 아님
  if (
    schedule.actualStartTime ||
    (schedule.attendanceRecord && schedule.attendanceRecord.isCheckedIn)
  ) {
    return false;
  }

  // 스케줄의 날짜 확인
  const today = new Date();
  const scheduleDate = new Date(
    schedule.scheduledStartDate ||
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`
  );

  // 오늘 날짜가 아니면 무단결근 판단하지 않음
  if (
    today.getFullYear() !== scheduleDate.getFullYear() ||
    today.getMonth() !== scheduleDate.getMonth() ||
    today.getDate() !== scheduleDate.getDate()
  ) {
    return false;
  }

  try {
    // 스케줄의 종료 시간을 Date 객체로 변환
    const [endHours, endMinutes] = schedule.endTime.split(":").map(Number);
    const scheduleEndTime = new Date(today);
    scheduleEndTime.setHours(endHours, endMinutes, 0, 0);

    // 현재 시간이 퇴근 시간을 지났고, 출근 기록이 없으면 무단결근
    return currentTime > scheduleEndTime;
  } catch (error) {
    console.error("무단결근 판단 오류:", error);
    return false;
  }
};

// 출근 상태별 색상 정의
const getAttendanceStatusColor = (status: string, hasRecord: boolean) => {
  if (!hasRecord) return "#3B82F6"; // 파란색 - 출근일 (스케줄만 있음)

  switch (status) {
    case "EARLY_DEPARTURE":
    case "EARLY_LEAVE":
      return "#F97316"; // 주황색 - 조퇴 (최우선)
    case "LATE":
    case "LATE_ARRIVAL":
      return "#6B7280"; // 회색 - 지각
    case "ABSENT":
    case "NO_SHOW":
      return "#000000"; // 검은색 - 무단
    case "NORMAL":
    case "COMPLETED":
    case "EARLY_ARRIVAL":
    case "OVERTIME":
      return "#EF4444"; // 빨간색 - 출근완료
    default:
      return "#EF4444"; // 빨간색 - 기본 출근완료
  }
};

// 출근 상태별 텍스트 색상
const getAttendanceTextColor = (status: string, hasRecord: boolean) => {
  if (!hasRecord) return "text-black";

  switch (status) {
    case "NORMAL":
    case "COMPLETED":
    case "OVERTIME":
    case "LATE":
    case "LATE_ARRIVAL":
    case "EARLY_DEPARTURE":
    case "EARLY_LEAVE":
    case "EARLY_ARRIVAL":
    case "ABSENT":
    case "NO_SHOW":
      return "text-white";
    default:
      return "text-white";
  }
};

export default function WorkCalendar() {
  const searchParams = useSearchParams();
  const workplaceIdFromQuery = searchParams.get("workplaceId");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const { data: workplacesResponse } = useGetMyWP();

  const workplaces: WorkplaceSummary[] =
    workplacesResponse?.data?.map((wp) => ({
      id: wp.workplace.id,
      workplaceName: wp.workplace.workplaceName,
      workplaceType: wp.workplace.workplaceType,
      workplaceAddress: wp.workplace.workplaceAddress,
      isMainWorkplace: wp.workplace.isMainWorkplace,
      isActive: wp.workplace.isActive,
      workplaceColorIndex: wp.workplace.workplaceColorIndex,
      contractStartDate: wp.contractStartDate,
      contractEndDate: wp.contractEndDate,
      schedules: wp.schedules?.map((s) => ({
        id: s.id,
        workplaceId: s.workplaceId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive,
      })),
    })) || [];

  const getTodayDate = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [form, setForm] = useState<AddWorkForm>({
    date: getTodayDate(),
    workplaceId: null,
    startTime: "",
    endTime: "",
    notes: "",
  });

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    return () => clearInterval(timer);
  }, []);

  // 초기값 세팅용 useEffect (한 번만)
  useEffect(() => {
    if (!workplaces || workplaces.length === 0) return;
    if (form.workplaceId !== null) return;

    const initialId = workplaceIdFromQuery
      ? Number(workplaceIdFromQuery)
      : workplaces[0].id;

    setForm((prev) => ({ ...prev, workplaceId: initialId }));
  }, [workplaces, workplaceIdFromQuery]);

  // 월별 출근 기록 가져오기
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!form.workplaceId) return;

      setIsLoadingAttendance(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const daysInMonth = getDaysInMonth(currentMonth);

        // 실제 API를 사용해서 월별 데이터 수집
        const attendanceData: AttendanceRecord[] = [];

        // 각 날짜별로 스케줄 데이터를 가져와서 출근 기록 추출
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;

          try {
            const dailySchedules = await fetchDailySchedules(dateStr);

            // 선택된 사업장의 스케줄만 필터링
            const workplaceSchedules = dailySchedules.filter(
              (schedule) => schedule.workplaceId === form.workplaceId
            );

            // 각 스케줄의 출근 기록 확인
            workplaceSchedules.forEach((schedule) => {
              // attendanceRecord가 있고 출근했거나, 직접 actualStartTime이 있는 경우
              const hasAttendanceRecord =
                schedule.attendanceRecord &&
                schedule.attendanceRecord.isCheckedIn;
              const hasDirectAttendance = (schedule as any).actualStartTime;

              // attendanceStatus가 null인 경우도 처리 (무단결근)
              const hasScheduleWithNullStatus =
                (schedule as any).attendanceStatus === null &&
                (schedule as any).status === "SCHEDULED";

              // 실시간 무단결근 체크
              const isAbsentRealtime = isRealtimeAbsent(schedule, currentTime);

              if (
                hasAttendanceRecord ||
                hasDirectAttendance ||
                hasScheduleWithNullStatus ||
                isAbsentRealtime
              ) {
                // 스케줄 상태에 따른 처리
                let finalStatus =
                  (schedule as any).attendanceStatus ||
                  schedule.attendanceRecord?.attendanceStatus;

                // 실시간 무단결근 체크 (최우선)
                if (isAbsentRealtime) {
                  finalStatus = "ABSENT";
                  console.log(
                    `실시간 무단결근 처리: ${dateStr}, 스케줄 ID: ${schedule.id}, 사업장: ${schedule.workplaceName}`
                  );
                }
                // attendanceStatus가 null이고 status가 SCHEDULED인 경우 무단결근으로 처리
                else if (
                  finalStatus === null &&
                  (schedule as any).status === "SCHEDULED"
                ) {
                  finalStatus = "ABSENT";
                  console.log(
                    `서버 무단결근 처리: ${dateStr}, 스케줄 ID: ${schedule.id}, 사업장: ${schedule.workplaceName}`
                  );
                } else if (finalStatus === null || finalStatus === undefined) {
                  finalStatus = "NORMAL";
                }

                // 서버 응답에서 직접 시간 정보 가져오기
                const actualCheckInTime =
                  (schedule as any).actualStartTime ||
                  schedule.attendanceRecord?.checkInTime;
                const actualCheckOutTime =
                  (schedule as any).actualEndTime ||
                  schedule.attendanceRecord?.checkOutTime;
                const isCheckedOut = !!actualCheckOutTime;

                // 임시 attendanceRecord 객체 생성 (기존 함수 호환용)
                const tempAttendanceRecord = {
                  checkInTime: actualCheckInTime,
                  checkOutTime: actualCheckOutTime,
                  isCheckedIn: !!actualCheckInTime,
                  isCheckedOut: isCheckedOut,
                  attendanceStatus: finalStatus,
                };

                // 무단결근이 아닌 경우에만 조퇴/지각 검사 수행
                if (finalStatus !== "ABSENT") {
                  // 조퇴 여부 체크 (가장 우선순위)
                  const isEarly = isEarlyDeparture(
                    schedule,
                    tempAttendanceRecord as any
                  );
                  const isLate = isLateArrival(
                    schedule,
                    tempAttendanceRecord as any
                  );

                  if (isEarly) {
                    finalStatus = "EARLY_DEPARTURE";
                  }
                  // 지각 여부 체크 (두 번째 우선순위)
                  else if (isLate) {
                    finalStatus = "LATE_ARRIVAL";
                  }
                }

                attendanceData.push({
                  id: (
                    (schedule as any).attendanceId || schedule.id
                  ).toString(),
                  employeeId: (
                    (schedule as any).userId || "unknown"
                  ).toString(),
                  workDate: dateStr,
                  status: finalStatus as any,
                  workplaceId: schedule.workplaceId.toString(),
                  actualStartTime:
                    finalStatus === "ABSENT"
                      ? undefined
                      : actualCheckInTime
                      ? actualCheckInTime.includes("T")
                        ? actualCheckInTime.split("T")[1]
                        : actualCheckInTime
                      : undefined,
                  actualEndTime:
                    finalStatus === "ABSENT"
                      ? undefined
                      : actualCheckOutTime
                      ? actualCheckOutTime.includes("T")
                        ? actualCheckOutTime.split("T")[1]
                        : actualCheckOutTime
                      : undefined,
                  totalWorkMinutes:
                    finalStatus === "ABSENT"
                      ? undefined
                      : (schedule as any).actualHours
                      ? Math.round((schedule as any).actualHours * 60)
                      : undefined,
                  overtimeMinutes:
                    finalStatus === "ABSENT"
                      ? undefined
                      : (schedule as any).overtimeHours
                      ? Math.round((schedule as any).overtimeHours * 60)
                      : undefined,
                });
              }
            });
          } catch (error) {
            // 특정 날짜에 데이터가 없는 경우는 무시
            console.debug(`${dateStr} 데이터 없음:`, error);
          }
        }

        setAttendanceRecords(attendanceData);
      } catch (error) {
        console.error("출근 기록 조회 실패:", error);
        setAttendanceRecords([]);
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchAttendanceRecords();
  }, [currentMonth, form.workplaceId, currentTime]);

  const handleInputChange = useCallback(
    (field: keyof AddWorkForm, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const firstDay = startOfMonth(currentMonth);
  const startWeekDay = getDay(firstDay);
  const daysInMonth = getDaysInMonth(currentMonth);

  const selectedWorkplace = workplaces.find((wp) => wp.id === form.workplaceId);

  const isWorkday = (date: number) => {
    if (!selectedWorkplace || !selectedWorkplace.schedules) return false;

    const fullDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );

    // 계약기간 체크
    const contractStart = new Date(selectedWorkplace.contractStartDate);
    const contractEnd = new Date(selectedWorkplace.contractEndDate);

    // 디버깅 로그 (첫날만)
    if (date === 1) {
      console.log("📅 계약기간 정보:", {
        workplaceName: selectedWorkplace.workplaceName,
        contractStart: selectedWorkplace.contractStartDate,
        contractEnd: selectedWorkplace.contractEndDate,
        currentMonth: currentMonth.toISOString().split("T")[0],
      });
    }

    // 해당 날짜가 계약기간에 포함되지 않으면 출근일이 아님
    if (fullDate < contractStart || fullDate > contractEnd) {
      return false;
    }

    const dayIndex = getDay(fullDate); // 0: 일요일, 1: 월요일 ...
    const dayOfWeekMap = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const dayOfWeekStr = dayOfWeekMap[dayIndex];

    return selectedWorkplace.schedules.some(
      (s) => s.dayOfWeek === dayOfWeekStr && s.isActive
    );
  };

  // 특정 날짜의 출근 기록 찾기
  const getAttendanceRecord = (date: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

    return attendanceRecords.find((record) => record.workDate === dateStr);
  };

  return (
    <div className="h-dvh flex flex-col bg-white p-4 rounded-2xl">
      <div className="flex flex-col items-center gap-7">
        {/* 선택된 사업장 색상 */}

        <ColorWorkplaceDropdown
          workplaces={workplaces}
          selectedWorkplaceId={form.workplaceId}
          onChange={(id) => handleInputChange("workplaceId", id)}
          label="사업장을 선택하세요"
        />

        <div className="w-full flex justify-between items-center gap-2">
          <button
            className="bg-main text-white text-sm px-4 py-2 rounded-lg"
            onClick={() => setCurrentMonth(new Date())}
          >
            오늘
          </button>
          <div className="flex items-center space-x-2 text-md text-gray4">
            <ChevronLeft
              size={18}
              className="cursor-pointer"
              onClick={prevMonth}
            />
            <span>{format(currentMonth, "yyyy년 M월", { locale: ko })}</span>
            <ChevronRight
              size={18}
              className="cursor-pointer"
              onClick={nextMonth}
            />
          </div>
          <div className="px-7"></div>
          {/* <button className="border px-4 py-2 rounded-md">
            <CalendarIcon size={16} />
          </button> */}
        </div>
      </div>

      {/* 달력 범례 */}
      <div className="flex flex-wrap justify-between gap-2 mt-8 text-xs text-gray5">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          ></span>
          출근일
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#EF4444" }}
          ></span>
          출근완료
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#F97316" }}
          ></span>
          조퇴
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#6B7280" }}
          ></span>
          지각
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#000000" }}
          ></span>
          무단
        </span>
      </div>

      <div className="h-full grid grid-cols-7 gap-2 mt-4 text-center text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="flex justify-center items-center font-bold">
            {d}
          </div>
        ))}
        {Array.from({ length: startWeekDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = i + 1;
          const fullDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            date
          );
          const today = isToday(fullDate);
          const workday = isWorkday(date);
          const attendanceRecord = getAttendanceRecord(date);

          // 출근 기록이 있으면 해당 상태의 색상, 없으면 기본 출근일 색상
          const statusColor = attendanceRecord
            ? getAttendanceStatusColor(attendanceRecord.status, true)
            : workday
            ? getAttendanceStatusColor("", false)
            : "transparent";

          const textColor = attendanceRecord
            ? getAttendanceTextColor(attendanceRecord.status, true)
            : workday
            ? getAttendanceTextColor("", false)
            : "text-gray-400";

          return (
            <div
              key={date}
              className={`flex flex-col items-center gap-1 rounded-lg justify-evenly ${
                today ? "border border-gray4" : ""
              }`}
            >
              <div
                className={`w-8 h-8 flex justify-center items-center bg-gray2 rounded-full ${
                  workday || attendanceRecord ? "text-black" : "text-gray-400"
                }`}
                style={{
                  border:
                    workday || attendanceRecord
                      ? `2px solid ${statusColor}`
                      : "none",
                }}
              >
                {date}
              </div>
              <span className="text-[10px] leading-none mt-0.5 h-[12px] text-pink-500">
                {(workday || attendanceRecord) && selectedWorkplace
                  ? selectedWorkplace.workplaceName.split(" ")[0]
                  : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
