"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardBody } from "@heroui/react";
import { BaseButton } from "@/app/components/BaseButton";
import {
  StatusChip,
  AttendanceStatus,
  MultiStatusChip,
  StatusStatsChip,
} from "./StatusChip";
import { useDateNavigation } from "@/context/DateContext";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { formatDate, isToday, isSameDay } from "@/utils/dateUtils";
import { formatTime } from "@/utils/timeUtils";
import { useToast } from "./Toast";

// 근무 정보 타입 정의
export interface WorkInfo {
  id: string;
  employeeId: string;
  employeeName: string;
  workDate: Date;
  scheduledStartTime: string; // "09:00"
  scheduledEndTime: string; // "18:00"
  actualStartTime?: string; // 실제 출근 시간
  actualEndTime?: string; // 실제 퇴근 시간
  status: AttendanceStatus;
  department?: string;
  position?: string;
  workLocation?: string;
  breakTime?: number; // 휴게시간 (분)
  overtimeHours?: number; // 연장근무 시간
  notes?: string;
  isFlexTime?: boolean; // 유연근무제 여부
  remoteWorkApproved?: boolean; // 재택근무 승인 여부
}

// 근무 통계 타입
export interface WorkStats {
  totalScheduled: number;
  totalCompleted: number;
  totalAbsent: number;
  totalLate: number;
  totalOvertime: number;
  totalEarlyArrival: number;
}

// 카드 크기 타입
export type WorkCardSize = "sm" | "md" | "lg";

// 카드 변형 타입
export type WorkCardVariant = "default" | "compact" | "detailed" | "summary";

interface WorkCardProps {
  workInfo: WorkInfo;
  size?: WorkCardSize;
  variant?: WorkCardVariant;
  className?: string;
  showActions?: boolean;
  showStats?: boolean;
  onCheckIn?: (workInfo: WorkInfo) => void;
  onCheckOut?: (workInfo: WorkInfo) => void;
  onEdit?: (workInfo: WorkInfo) => void;
  onViewDetails?: (workInfo: WorkInfo) => void;
}

// 크기별 스타일
const cardSizeStyles: Record<
  WorkCardSize,
  {
    container: string;
    padding: string;
    titleSize: string;
    contentSize: string;
  }
> = {
  sm: {
    container: "min-w-[280px]",
    padding: "p-3",
    titleSize: "text-sm font-medium",
    contentSize: "text-xs",
  },
  md: {
    container: "min-w-[320px]",
    padding: "p-4",
    titleSize: "text-base font-semibold",
    contentSize: "text-sm",
  },
  lg: {
    container: "min-w-[380px]",
    padding: "p-6",
    titleSize: "text-lg font-bold",
    contentSize: "text-base",
  },
};

/**
 * 근무 카드 컴포넌트
 * 직원의 일일 근무 정보와 상태를 표시하는 카드
 */
export const WorkCard: React.FC<WorkCardProps> = ({
  workInfo,
  size = "md",
  variant = "default",
  className = "",
  showActions = true,
  showStats = false,
  onCheckIn,
  onCheckOut,
  onEdit,
  onViewDetails,
}) => {
  const { currentDate } = useDateNavigation();
  const { currentTime } = useCurrentTime();
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const sizeStyle = cardSizeStyles[size];
  const isWorkDateToday = isToday(workInfo.workDate);
  const isSelectedDate = isSameDay(workInfo.workDate, currentDate);

  // 출근/퇴근 가능 여부 계산
  const canCheckIn = useMemo(() => {
    return (
      isWorkDateToday &&
      !workInfo.actualStartTime &&
      workInfo.status !== "ABSENT"
    );
  }, [isWorkDateToday, workInfo.actualStartTime, workInfo.status]);

  const canCheckOut = useMemo(() => {
    return (
      isWorkDateToday && workInfo.actualStartTime && !workInfo.actualEndTime
    );
  }, [isWorkDateToday, workInfo.actualStartTime, workInfo.actualEndTime]);

  // 근무 시간 계산
  const calculateWorkHours = useCallback(() => {
    if (!workInfo.actualStartTime || !workInfo.actualEndTime) {
      return null;
    }

    const startTime = new Date(
      `${formatDate(workInfo.workDate, {
        showYear: false,
        showWeekday: false,
      })} ${workInfo.actualStartTime}`
    );
    const endTime = new Date(
      `${formatDate(workInfo.workDate, {
        showYear: false,
        showWeekday: false,
      })} ${workInfo.actualEndTime}`
    );

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // 휴게시간 제외
    const breakHours = (workInfo.breakTime || 60) / 60; // 기본 1시간 휴게
    const actualWorkHours = diffHours - breakHours;

    return Math.max(0, actualWorkHours);
  }, [workInfo]);

  // 출근 버튼 클릭 핸들러
  const handleCheckIn = useCallback(() => {
    if (!isWorkDateToday) {
      toast.warning(
        "출근 불가",
        "오늘 날짜가 아닌 스케줄에는 출근할 수 없습니다. 오늘 날짜의 스케줄을 확인해주세요.",
        6000
      );
      return;
    }
    onCheckIn?.(workInfo);
  }, [isWorkDateToday, toast, onCheckIn, workInfo]);

  // 퇴근 버튼 클릭 핸들러  
  const handleCheckOut = useCallback(() => {
    if (!isWorkDateToday) {
      toast.warning(
        "퇴근 불가",
        "오늘 날짜가 아닌 스케줄에는 퇴근할 수 없습니다.",
        6000
      );
      return;
    }
    onCheckOut?.(workInfo);
  }, [isWorkDateToday, toast, onCheckOut, workInfo]);

  // 상태별 메시지 생성
  const getStatusMessage = useCallback(() => {
    const currentTimeStr = formatTime(currentTime);

    switch (workInfo.status) {
      case "NORMAL":
        return canCheckOut
          ? `현재 근무 중 (${currentTimeStr})`
          : "정상 근무 완료";
      case "LATE":
        return workInfo.actualStartTime
          ? `${workInfo.actualStartTime}에 지각 출근`
          : "지각 예정";
      case "EARLY_ARRIVAL":
        return `${workInfo.actualStartTime}에 조기 출근`;
      case "OVERTIME":
        const overtimeHours = workInfo.overtimeHours || 0;
        return `연장근무 ${overtimeHours.toFixed(1)}시간`;
      case "ABSENT":
        return "결근";
      case "LEAVE":
        return "휴가";
      case "REMOTE_WORK":
        return workInfo.remoteWorkApproved
          ? "재택근무 (승인됨)"
          : "재택근무 (대기중)";
      default:
        return workInfo.notes || "";
    }
  }, [workInfo, currentTime, canCheckOut]);

  // 컴팩트 카드 렌더링
  if (variant === "compact") {
    return (
      <Card
        className={`border border-gray-200 hover:shadow-md transition-all duration-200 ${sizeStyle.container} ${className}`}
      >
        <CardBody className={sizeStyle.padding}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className={`${sizeStyle.titleSize} text-gray-900 truncate`}>
                  {workInfo.employeeName}
                </h3>
                <StatusChip
                  status={workInfo.status}
                  size={size === "lg" ? "md" : "sm"}
                />
              </div>
              <p className={`${sizeStyle.contentSize} text-gray-600 mt-1`}>
                {workInfo.scheduledStartTime} - {workInfo.scheduledEndTime}
              </p>
            </div>
            {showActions && (
              <div className="flex space-x-1">
                {canCheckIn && (
                  <BaseButton
                    buttonState={{
                      label: "출근",
                      variant: "primary",
                    }}
                    onClick={handleCheckIn}
                    className="text-xs px-2 py-1"
                  />
                )}
                {canCheckOut && (
                  <BaseButton
                    buttonState={{
                      label: "퇴근",
                      variant: "secondary",
                    }}
                    onClick={handleCheckOut}
                    className="text-xs px-2 py-1"
                  />
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // 상세 카드 렌더링
  return (
    <Card
      className={`
        border border-gray-200 hover:shadow-lg transition-all duration-300
        ${
          isSelectedDate
            ? "ring-2 ring-toss-blue ring-opacity-20 border-toss-blue"
            : ""
        }
        ${sizeStyle.container} ${className}
      `}
    >
      <CardBody className={sizeStyle.padding}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className={`${sizeStyle.titleSize} text-gray-900`}>
                {workInfo.employeeName}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {workInfo.department && (
                  <span className={`${sizeStyle.contentSize} text-gray-500`}>
                    {workInfo.department}
                  </span>
                )}
                {workInfo.position && (
                  <span className={`${sizeStyle.contentSize} text-gray-400`}>
                    • {workInfo.position}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <StatusChip
              status={workInfo.status}
              size={size === "lg" ? "md" : "sm"}
              variant={isWorkDateToday ? "solid" : "subtle"}
            />
            {variant === "detailed" && (
              <BaseButton
                buttonState={{
                  label: "",
                  icon: isExpanded ? "▼" : "▶",
                  variant: "secondary",
                }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs px-2 py-1"
              />
            )}
          </div>
        </div>

        {/* 근무 시간 정보 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`${sizeStyle.contentSize} font-medium text-gray-700`}
              >
                예정 시간
              </label>
              <p className={`${sizeStyle.contentSize} text-gray-900 mt-1`}>
                {workInfo.scheduledStartTime} - {workInfo.scheduledEndTime}
              </p>
            </div>

            <div>
              <label
                className={`${sizeStyle.contentSize} font-medium text-gray-700`}
              >
                실제 시간
              </label>
              <p className={`${sizeStyle.contentSize} text-gray-900 mt-1`}>
                {workInfo.actualStartTime || "미출근"} -{" "}
                {workInfo.actualEndTime || "미퇴근"}
              </p>
            </div>
          </div>

          {/* 상태 메시지 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className={`${sizeStyle.contentSize} text-gray-700`}>
              {getStatusMessage()}
            </p>
            {calculateWorkHours() && (
              <p className={`${sizeStyle.contentSize} text-gray-500 mt-1`}>
                총 근무시간: {calculateWorkHours()?.toFixed(1)}시간
              </p>
            )}
          </div>

          {/* 확장 정보 */}
          {variant === "detailed" && isExpanded && (
            <div className="border-t pt-3 space-y-2">
              {workInfo.workLocation && (
                <div className="flex justify-between">
                  <span className={`${sizeStyle.contentSize} text-gray-600`}>
                    근무지:
                  </span>
                  <span className={`${sizeStyle.contentSize} text-gray-900`}>
                    {workInfo.workLocation}
                  </span>
                </div>
              )}

              {workInfo.isFlexTime && (
                <div className="flex justify-between">
                  <span className={`${sizeStyle.contentSize} text-gray-600`}>
                    근무형태:
                  </span>
                  <span className={`${sizeStyle.contentSize} text-blue-600`}>
                    유연근무제
                  </span>
                </div>
              )}

              {workInfo.notes && (
                <div>
                  <span className={`${sizeStyle.contentSize} text-gray-600`}>
                    메모:
                  </span>
                  <p className={`${sizeStyle.contentSize} text-gray-900 mt-1`}>
                    {workInfo.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex space-x-2">
              {canCheckIn && (
                <BaseButton
                  buttonState={{
                    label: "출근하기",
                    variant: "primary",
                    icon: "⏰",
                  }}
                  onClick={handleCheckIn}
                  className={size === "sm" ? "text-xs px-3 py-1.5" : ""}
                />
              )}

              {canCheckOut && (
                <BaseButton
                  buttonState={{
                    label: "퇴근하기",
                    variant: "secondary",
                    icon: "🏃‍♂️",
                  }}
                  onClick={handleCheckOut}
                  className={size === "sm" ? "text-xs px-3 py-1.5" : ""}
                />
              )}
            </div>

            <div className="flex space-x-1">
              {onEdit && (
                <BaseButton
                  buttonState={{
                    label: "",
                    icon: "✏️",
                    variant: "secondary",
                  }}
                  onClick={() => onEdit(workInfo)}
                  className="text-xs px-2 py-1"
                  title="수정"
                />
              )}

              {onViewDetails && (
                <BaseButton
                  buttonState={{
                    label: "",
                    icon: "👁",
                    variant: "secondary",
                  }}
                  onClick={() => onViewDetails(workInfo)}
                  className="text-xs px-2 py-1"
                  title="상세보기"
                />
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

/**
 * 근무 통계 카드 컴포넌트
 */
export const WorkStatsCard: React.FC<{
  stats: WorkStats;
  title?: string;
  className?: string;
  size?: WorkCardSize;
}> = ({ stats, title = "근무 현황", className = "", size = "md" }) => {
  const sizeStyle = cardSizeStyles[size];

  const statItems = [
    {
      status: "NORMAL" as AttendanceStatus,
      count: stats.totalCompleted,
      label: "완료",
    },
    {
      status: "LATE" as AttendanceStatus,
      count: stats.totalLate,
      label: "지각",
    },
    {
      status: "EARLY_ARRIVAL" as AttendanceStatus,
      count: stats.totalEarlyArrival,
      label: "조기출근",
    },
    {
      status: "OVERTIME" as AttendanceStatus,
      count: stats.totalOvertime,
      label: "연장근무",
    },
    {
      status: "ABSENT" as AttendanceStatus,
      count: stats.totalAbsent,
      label: "결근",
    },
  ];

  return (
    <Card
      className={`border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <CardBody className={sizeStyle.padding}>
        <h3 className={`${sizeStyle.titleSize} text-gray-900 mb-4`}>{title}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex justify-between items-center bg-toss-gray-50 rounded-lg p-3">
            <span
              className={`${sizeStyle.contentSize} font-medium text-gray-700`}
            >
              전체 일정
            </span>
            <span className={`${sizeStyle.titleSize} text-toss-blue`}>
              {stats.totalScheduled}
            </span>
          </div>

          {statItems.map(
            (item) =>
              item.count > 0 && (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <StatusStatsChip
                    status={item.status}
                    count={item.count}
                    size={size === "lg" ? "md" : "sm"}
                  />
                </div>
              )
          )}
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * 근무 카드 리스트 컴포넌트
 */
export const WorkCardList: React.FC<{
  workInfos: WorkInfo[];
  className?: string;
  size?: WorkCardSize;
  variant?: WorkCardVariant;
  onCheckIn?: (workInfo: WorkInfo) => void;
  onCheckOut?: (workInfo: WorkInfo) => void;
  onEdit?: (workInfo: WorkInfo) => void;
  onViewDetails?: (workInfo: WorkInfo) => void;
  emptyMessage?: string;
  loading?: boolean;
}> = ({
  workInfos,
  className = "",
  size = "md",
  variant = "default",
  onCheckIn,
  onCheckOut,
  onEdit,
  onViewDetails,
  emptyMessage = "등록된 근무 일정이 없습니다.",
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (workInfos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <p className="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {workInfos.map((workInfo) => (
        <WorkCard
          key={workInfo.id}
          workInfo={workInfo}
          size={size}
          variant={variant}
          onCheckIn={onCheckIn}
          onCheckOut={onCheckOut}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

// 근무 정보 생성 헬퍼 함수
export const createWorkInfo = (params: Partial<WorkInfo>): WorkInfo => {
  return {
    id: params.id || `work-${Date.now()}`,
    employeeId: params.employeeId || "",
    employeeName: params.employeeName || "",
    workDate: params.workDate || new Date(),
    scheduledStartTime: params.scheduledStartTime || "09:00",
    scheduledEndTime: params.scheduledEndTime || "18:00",
    status: params.status || "NORMAL",
    ...params,
  };
};

// 근무 통계 계산 헬퍼 함수
export const calculateWorkStats = (workInfos: WorkInfo[]): WorkStats => {
  return workInfos.reduce(
    (stats, work) => {
      stats.totalScheduled++;

      if (work.actualStartTime && work.actualEndTime) {
        stats.totalCompleted++;
      }

      switch (work.status) {
        case "ABSENT":
          stats.totalAbsent++;
          break;
        case "LATE":
          stats.totalLate++;
          break;
        case "OVERTIME":
          stats.totalOvertime++;
          break;
        case "EARLY_ARRIVAL":
          stats.totalEarlyArrival++;
          break;
      }

      return stats;
    },
    {
      totalScheduled: 0,
      totalCompleted: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalOvertime: 0,
      totalEarlyArrival: 0,
    }
  );
};
