import { ScedulesProps, AttendanceRecordProps } from "./types";
import { MoreHorizontal, CheckCircle } from "lucide-react";
import { formatMonthDay } from "../../../utils/dateUtils";
import { useState, useEffect, useMemo } from "react";
import { useCheckIn, useCheckOut } from "@/hooks/useAttendanceQuery";
import { getCurrentLocation as getCurrentLocationApi } from "@/api/attendanceApi";
import toast from "react-hot-toast";

type AttendanceMode =
  | "CHECK_IN_NORMAL" // 출근 하기
  | "CHECK_IN_EARLY" // 조기 출근
  | "CHECK_IN_LATE" // 지각
  | "CHECK_OUT_NORMAL" // 퇴근 하기
  | "CHECK_OUT_EARLY" // 조퇴 하기
  | "CHECK_OUT_OVERTIME"; // 연장 근무 하기

interface AttendanceModeOption {
  mode: AttendanceMode;
  label: string;
  description: string;
}

interface StatusStyles {
  timeDisplay: string;
  startEndTime: string;
  realtime: string;
  activeButton: string;
  headerBg: string;
  workplaceName: string;
  dateBadge: string;
  checkInButton: string;
}

export default function AttendanceCard({
  id,
  workplaceId,
  workplaceName,
  userId,
  dayOfWeek,
  dayOfWeekKorean,
  startTime,
  endTime,
  workingHours,
  isActive,
  scheduledStartDate,
  scheduledEndDate,
  attendanceRecord,
  currentStatus,
  type,
}: ScedulesProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMode, setSelectedMode] =
    useState<AttendanceMode>("CHECK_IN_NORMAL");

  // API 호출 훅들
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 현재 시간과 스케줄을 비교하여 사용 가능한 모드 결정
  const getAvailableModes = (): AttendanceModeOption[] => {
    const now = new Date();
    const scheduleStart = new Date(scheduledStartDate);
    const scheduleEnd = new Date(scheduledEndDate);

    if (currentStatus === "NOT_STARTED") {
      // 추가 근무인 경우 조기 출근만 표시
      if (type === "ADDITIONAL") {
        return [
          {
            mode: "CHECK_IN_EARLY",
            label: "조기 출근",
            description: "추가 근무 시작",
          },
        ];
      }

      // 정규 근무인 경우: 출근하기 + 조기출근 버튼 (토글용)
      return [
        {
          mode: "CHECK_IN_NORMAL",
          label: "출근 하기",
          description: "스케줄 시간으로 기록",
        },
        {
          mode: "CHECK_IN_EARLY",
          label: "조기 출근",
          description: "실제 시간으로 기록",
        },
      ];
    } else if (currentStatus === "IN_PROGRESS") {
      // 근무 중
      if (now < scheduleEnd) {
        // 스케줄 상 퇴근 시간 이전
        return [
          {
            mode: "CHECK_OUT_NORMAL",
            label: "퇴근 하기",
            description: "스케줄 시간으로 기록",
          },
          {
            mode: "CHECK_OUT_EARLY",
            label: "조퇴 하기",
            description: "실제 시간으로 기록",
          },
        ];
      } else {
        // 스케줄 상 퇴근 시간 이후
        return [
          {
            mode: "CHECK_OUT_NORMAL",
            label: "퇴근 하기",
            description: "스케줄 시간으로 기록",
          },
          {
            mode: "CHECK_OUT_OVERTIME",
            label: "연장 근무",
            description: "실제 시간으로 기록",
          },
        ];
      }
    }

    // COMPLETED 상태에서는 업무종료 버튼 표시
    if (currentStatus === "COMPLETED") {
      return [
        {
          mode: "CHECK_IN_NORMAL",
          label: "업무종료",
          description: "완료된 근무",
        },
      ];
    }

    // 다른 날짜나 기타 상태에서는 기본 버튼 표시 (클릭 시 검증에서 차단)
    return [
      {
        mode: "CHECK_IN_NORMAL",
        label: "출근 하기",
        description: "스케줄 시간으로 기록",
      },
    ];
  };

  const availableModes = getAvailableModes();

  // 지각 상황 감지
  const isLateCheckIn = useMemo(() => {
    if (currentStatus !== "NOT_STARTED") return false;
    const now = new Date();
    const scheduleStart = new Date(scheduledStartDate);
    return now > scheduleStart;
  }, [currentStatus, scheduledStartDate, currentTime]);

  // 기본 모드 설정
  useEffect(() => {
    if (availableModes.length > 0) {
      setSelectedMode(availableModes[0].mode);
    }
  }, [currentStatus, availableModes.length]);

  const selectedModeOption =
    availableModes.find((mode) => mode.mode === selectedMode) ||
    availableModes[0];

  // 토글 핸들러 - 두 개 옵션 사이에서 전환
  const handleModeToggle = () => {
    if (availableModes.length === 2) {
      const currentIndex = availableModes.findIndex(
        (mode) => mode.mode === selectedMode
      );
      const nextIndex = currentIndex === 0 ? 1 : 0;
      setSelectedMode(availableModes[nextIndex].mode);
    }
  };

  // 토글 버튼에 표시할 텍스트 (다음에 선택될 옵션)
  const getToggleButtonText = () => {
    if (availableModes.length !== 2) {
      return selectedModeOption?.label || "완료";
    }

    const currentIndex = availableModes.findIndex(
      (mode) => mode.mode === selectedMode
    );
    const nextIndex = currentIndex === 0 ? 1 : 0;
    return availableModes[nextIndex].label;
  };

  // 날짜 검증 함수
  const isToday = () => {
    const today = new Date();
    const scheduleDate = new Date(scheduledStartDate);

    return (
      today.getFullYear() === scheduleDate.getFullYear() &&
      today.getMonth() === scheduleDate.getMonth() &&
      today.getDate() === scheduleDate.getDate()
    );
  };

  // 출석 체크 핸들러
  const handleAttendanceClick = async () => {
    if (!selectedModeOption) return;

    // COMPLETED 상태에서는 아무 동작하지 않음
    if (currentStatus === "COMPLETED") {
      return;
    }

    // 날짜 검증
    if (!isToday()) {
      toast.error(
        "오늘 날짜가 아닌 스케줄에는 출근할 수 없습니다.\n오늘 날짜의 스케줄을 확인해주세요.",
        {
          duration: 6000,
          position: "bottom-center",
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          icon: "⚠️",
        }
      );
      return;
    }

    try {
      // GPS 위치 정보 가져오기 시도
      let location: { latitude: number; longitude: number } | null = null;

      try {
        location = await getCurrentLocation();
      } catch (locationError) {
        console.warn("위치 정보 가져오기 실패:", locationError);

        // 위치 권한이 거부된 경우에도 계속 진행
        console.warn("위치 정보 없이 출석 처리를 진행합니다.");
      }

      if (selectedMode.startsWith("CHECK_IN")) {
        // 출근 처리
        await handleCheckIn(location);
      } else if (selectedMode.startsWith("CHECK_OUT")) {
        // 퇴근 처리
        await handleCheckOut(location);
      }
    } catch (error) {
      console.error("출석 체크 실패:", error);

      // 에러 메시지에 따른 토스트 표시
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다";

      if (errorMessage.includes("날짜") || errorMessage.includes("요일")) {
        toast.error(
          "스케줄 날짜와 현재 날짜가 일치하지 않습니다.\n오늘 날짜의 스케줄을 확인해주세요.",
          {
            duration: 8000,
            position: "bottom-center",
            style: {
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
              maxWidth: "400px",
              padding: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            icon: "🚫",
          }
        );
      } else if (errorMessage.includes("권한")) {
        toast.error("해당 스케줄에 대한 권한이 없습니다.", {
          duration: 5000,
          position: "bottom-center",
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          icon: "🔒",
        });
      } else if (errorMessage.includes("중복")) {
        toast.error("이미 출근 처리된 스케줄입니다.", {
          duration: 5000,
          position: "bottom-center",
          style: {
            background: "#FEF7CD",
            color: "#A16207",
            border: "1px solid #FDE68A",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          icon: "⚠️",
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
          position: "bottom-center",
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          icon: "❌",
        });
      }
    }
  };

  // 지각 출근 처리 핸들러
  const handleLateCheckIn = async () => {
    // COMPLETED 상태에서는 아무 동작하지 않음
    if (currentStatus === "COMPLETED") {
      return;
    }

    // 날짜 검증
    if (!isToday()) {
      toast.error(
        "오늘 날짜가 아닌 스케줄에는 출근할 수 없습니다.\n오늘 날짜의 스케줄을 확인해주세요.",
        {
          duration: 6000,
          position: "bottom-center",
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          icon: "⚠️",
        }
      );
      return;
    }

    try {
      // GPS 위치 정보 가져오기 시도
      let location: { latitude: number; longitude: number } | null = null;

      try {
        location = await getCurrentLocation();
      } catch (locationError) {
        console.warn("위치 정보 가져오기 실패:", locationError);
        console.warn("위치 정보 없이 지각 출근 처리를 진행합니다.");
      }

      // 지각 출근 처리
      await handleCheckInWithMode(location, "CHECK_IN_LATE");
    } catch (error) {
      console.error("지각 출근 처리 실패:", error);

      // 에러 메시지에 따른 토스트 표시
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다";

      toast.error(errorMessage, {
        duration: 5000,
        position: "bottom-center",
        style: {
          background: "#FEF2F2",
          color: "#DC2626",
          border: "1px solid #FECACA",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "400px",
          padding: "16px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        icon: "❌",
      });
    }
  };

  // 위치 정보는 공용 API 유틸을 사용해 중복 제거
  const getCurrentLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    const loc = await getCurrentLocationApi();
    return { latitude: loc.latitude, longitude: loc.longitude };
  };

  const handleCheckInWithMode = async (
    location: {
      latitude: number;
      longitude: number;
    } | null,
    mode: AttendanceMode
  ) => {
    try {
      // 위치 정보가 없으면 기본값 사용
      const finalLocation = location || {
        latitude: 0,
        longitude: 0,
      };

      const requestData = {
        scheduleId: id,
        latitude: finalLocation.latitude,
        longitude: finalLocation.longitude,
        isEarlyCheckIn: mode === "CHECK_IN_EARLY",
        isLateCheckIn: mode === "CHECK_IN_LATE",
      };

      console.log("출근 처리 시작:", {
        scheduleId: id,
        mode: mode,
        location: finalLocation,
        requestData: requestData,
      });

      await checkInMutation.mutateAsync(requestData);

      const modeLabel =
        mode === "CHECK_IN_LATE"
          ? "지각"
          : mode === "CHECK_IN_EARLY"
          ? "조기 출근"
          : "출근하기";
      toast.success(`${modeLabel} 처리되었습니다.`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#F0FDF4",
          color: "#166534",
          border: "1px solid #BBF7D0",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "400px",
          padding: "16px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        icon: "✅",
      });
      console.log(`${modeLabel} 처리되었습니다.`);
    } catch (error) {
      console.error("출근 처리 실패:", error);
      // 상위에서 처리하도록 throw
      throw error;
    }
  };

  const handleCheckIn = async (
    location: {
      latitude: number;
      longitude: number;
    } | null
  ) => {
    await handleCheckInWithMode(location, selectedMode);
  };

  const handleCheckOut = async (
    location: {
      latitude: number;
      longitude: number;
    } | null
  ) => {
    try {
      if (!attendanceRecord?.id) {
        const errorMsg = "출석 기록을 찾을 수 없습니다.";
        console.error(errorMsg);
        toast.error(errorMsg, {
          duration: 5000,
          position: "bottom-center",
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          icon: "❌",
        });
        return;
      }

      // 위치 정보가 없으면 기본값 사용
      const finalLocation = location || {
        latitude: 0,
        longitude: 0,
      };

      console.log("퇴근 처리 시작:", {
        attendanceRecordId: attendanceRecord.id,
        mode: selectedMode,
        location: finalLocation,
      });

      await checkOutMutation.mutateAsync({
        attendanceRecordId: attendanceRecord.id,
        latitude: finalLocation.latitude,
        longitude: finalLocation.longitude,
      });

      toast.success(`${selectedModeOption.label} 처리되었습니다.`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#F0FDF4",
          color: "#166534",
          border: "1px solid #BBF7D0",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "400px",
          padding: "16px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        icon: "✅",
      });
      console.log(`${selectedModeOption.label} 처리되었습니다.`);
    } catch (error) {
      console.error("퇴근 처리 실패:", error);
      // 상위에서 처리하도록 throw
      throw error;
    }
  };

  const formatTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const statusStyles: Record<string, StatusStyles> = {
    NOT_STARTED: {
      timeDisplay: "text-gray1",
      startEndTime: "text-gray5",
      realtime: "text-gray3",
      activeButton: "text-white bg-main",
      headerBg: "bg-gray2",
      workplaceName: "text-main",
      dateBadge: "text-gray3 border-gray3",
      checkInButton: "text-main bg-white",
    },
    IN_PROGRESS: {
      timeDisplay: "text-main",
      startEndTime: "text-sub3",
      realtime: "text-sub3",
      activeButton: "text-sub3 bg-white",
      headerBg: "bg-sub3",
      workplaceName: "text-white",
      dateBadge: "text-sub3 border-sub3",
      checkInButton: "text-sub3 bg-white",
    },
    COMPLETED: {
      timeDisplay: "text-sub3",
      startEndTime: "text-main",
      realtime: "text-main",
      activeButton: "hidden",
      headerBg: "bg-main",
      workplaceName: "text-white",
      dateBadge: "text-main border-main",
      checkInButton: "text-gray4 bg-gray2",
    },
  };

  const getStatusStyle = (
    status: string,
    styleType: keyof StatusStyles
  ): string => {
    return (
      statusStyles[status]?.[styleType] || statusStyles.NOT_STARTED[styleType]
    );
  };

  const workText = {
    before: "아직 출근 전입니다",
    ing: "열심히 일하고 있어요",
    after: "오늘 업무 완료",
  };

  const getAttendanceTimeDisplay = (
    currentStatus: string,
    attendanceRecord: AttendanceRecordProps | null
  ) => {
    if (currentStatus === "NOT_STARTED") {
      return { status: "현재시각", time: formatTime(currentTime) };
    }
    if (attendanceRecord?.checkInTime) {
      return {
        status: "출근",
        time: formatTime(attendanceRecord.checkInTime),
      };
    }
    return {
      status: "출근",
      time: "--:--",
    };
  };

  const getRealtimeDisplay = (
    currentStatus: string,
    attendanceRecord: AttendanceRecordProps | null
  ) => {
    switch (currentStatus) {
      case "NOT_STARTED":
        return { status: "", time: "" };
      case "IN_PROGRESS":
        return { status: "현재시간", time: formatTime(currentTime) };
      case "COMPLETED":
        if (attendanceRecord?.checkOutTime) {
          return {
            status: "퇴근",
            time: formatTime(attendanceRecord.checkOutTime),
          };
        }
        return { status: "퇴근", time: "--:--" };
      default:
        return { status: "", time: "" };
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden border border-gray1">
      {/* header */}
      <div
        className={`flex justify-between items-center px-4 py-3 border-b border-gray1 ${getStatusStyle(
          currentStatus,
          "headerBg"
        )}`}
      >
        <div
          className={`font-semibold ${getStatusStyle(
            currentStatus,
            "workplaceName"
          )}`}
        >
          {workplaceName}
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleModeToggle}
            className={`rounded-full px-4 py-2 font-semibold text-sm transition-all hover:scale-105 ${getStatusStyle(
              currentStatus,
              "activeButton"
            )} ${
              availableModes.length === 2
                ? "cursor-pointer shadow-md"
                : "cursor-default"
            }`}
            disabled={availableModes.length <= 1}
          >
            {getToggleButtonText()}
          </button>
        </div>
      </div>
      {/* body */}
      <div className=" overflow-auto">
        <div className="flex flex-col px-4 py-3">
          <div className="flex items-center justify-start">
            <CheckCircle
              size={15}
              className={`${
                getStatusStyle(currentStatus, "dateBadge").split(" ")[0]
              }`}
            />
            <span
              className={`text-xs font-semibold pl-1 ${
                getStatusStyle(currentStatus, "dateBadge").split(" ")[0]
              }`}
            >
              {currentStatus === "NOT_STARTED"
                ? workText.before
                : currentStatus === "IN_PROGRESS"
                ? workText.ing
                : currentStatus === "COMPLETED"
                ? workText.after
                : ""}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="space-y-2">
              <div
                className={`w-fit text-xs font-semibold rounded-full px-3 py-0.5 flex items-center justify-center border-2 ${getStatusStyle(
                  currentStatus,
                  "dateBadge"
                )}`}
              >
                {formatMonthDay(new Date(scheduledStartDate))}
              </div>
              <div
                className={`text-5xl font-bold ${getStatusStyle(
                  currentStatus,
                  "startEndTime"
                )} font-gmarketlocal`}
              >
                {startTime}
              </div>
              <div
                className={`text-sm font-medium flex items-center justify-between ${getStatusStyle(
                  currentStatus,
                  "realtime"
                )}`}
              >
                <span className="text-lg">
                  {
                    getAttendanceTimeDisplay(currentStatus, attendanceRecord)
                      .status
                  }
                </span>
                <span className="text-2xl">
                  {
                    getAttendanceTimeDisplay(currentStatus, attendanceRecord)
                      .time
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <MoreHorizontal size={40} className="text-main2" />
            </div>
            <div className="space-y-2">
              <div
                className={`w-fit text-xs font-semibold rounded-full px-3 py-0.5 flex items-center justify-center border-2 ${getStatusStyle(
                  currentStatus,
                  "dateBadge"
                )}`}
              >
                {formatMonthDay(new Date(scheduledEndDate))}
              </div>
              <div
                className={`text-5xl font-bold ${getStatusStyle(
                  currentStatus,
                  "startEndTime"
                )} font-gmarketlocal`}
              >
                {endTime}
              </div>
              <div
                className={`text-sm font-medium flex items-center justify-between w-full ${getStatusStyle(
                  currentStatus,
                  "realtime"
                )}`}
              >
                <span className="text-lg">
                  {getRealtimeDisplay(currentStatus, attendanceRecord).status}
                </span>
                <span className="text-2xl">
                  {getRealtimeDisplay(currentStatus, attendanceRecord).time}
                </span>
              </div>
              {currentStatus === "NOT_STARTED" && <div className="h-8"></div>}
            </div>
          </div>
        </div>
      </div>
      {availableModes.length > 0 && (
        <>
          {isLateCheckIn ? (
            // 지각 상황: 분할 버튼
            <div className="flex w-full border-t border-gray1">
              <button
                className={`flex-1 flex justify-center items-center py-3 text-lg hover:opacity-80 transition-opacity ${getStatusStyle(
                  currentStatus,
                  "checkInButton"
                )} ${
                  checkInMutation.isPending || checkOutMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } border-r border-gray1`}
                onClick={() => handleAttendanceClick()}
                disabled={
                  checkInMutation.isPending || checkOutMutation.isPending
                }
              >
                {checkInMutation.isPending || checkOutMutation.isPending
                  ? "처리 중..."
                  : selectedModeOption?.label || "출근하기"}
              </button>
              <button
                className={`flex-1 flex justify-center items-center py-3 text-lg bg-main hover:bg-main2 text-white transition-opacity ${
                  checkInMutation.isPending || checkOutMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleLateCheckIn()}
                disabled={
                  checkInMutation.isPending || checkOutMutation.isPending
                }
              >
                {checkInMutation.isPending || checkOutMutation.isPending
                  ? "처리 중..."
                  : "지각"}
              </button>
            </div>
          ) : (
            // 일반 상황: 단일 버튼
            <button
              className={`w-full flex justify-center items-center py-3 text-lg border-t border-gray1 hover:opacity-80 transition-opacity ${getStatusStyle(
                currentStatus,
                "checkInButton"
              )} ${
                checkInMutation.isPending ||
                checkOutMutation.isPending ||
                currentStatus === "COMPLETED"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => handleAttendanceClick()}
              disabled={
                checkInMutation.isPending ||
                checkOutMutation.isPending ||
                currentStatus === "COMPLETED"
              }
            >
              {checkInMutation.isPending || checkOutMutation.isPending
                ? "처리 중..."
                : selectedModeOption?.label || "출근하기"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
