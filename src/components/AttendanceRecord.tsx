"use client";

import React, { useState, useCallback, useMemo } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { StatusChip } from "./StatusChip";
import { useEmployeeAttendance, useAttendanceStats } from "@/hooks/useAttendance";
import { AttendanceRecord as AttendanceRecordType, attendanceHelpers } from "@/services/attendanceService";
import { formatDate, formatDateSimple, isToday, isSameDay } from "@/utils/dateUtils";
import { formatTime } from "@/utils/timeUtils";

// 출석 기록 표시 타입
export type AttendanceRecordViewType = "card" | "list" | "table" | "calendar";

// 출석 기록 크기
export type AttendanceRecordSize = "sm" | "md" | "lg";

interface AttendanceRecordProps {
  record: AttendanceRecordType;
  viewType?: AttendanceRecordViewType;
  size?: AttendanceRecordSize;
  showActions?: boolean;
  showLocation?: boolean;
  showNotes?: boolean;
  onEdit?: (record: AttendanceRecordType) => void;
  onDelete?: (record: AttendanceRecordType) => void;
  onView?: (record: AttendanceRecordType) => void;
  className?: string;
}

// 크기별 스타일
const sizeStyles = {
  sm: {
    container: "p-3",
    title: "text-sm font-medium",
    content: "text-xs",
    spacing: "space-y-2",
  },
  md: {
    container: "p-4",
    title: "text-base font-semibold",
    content: "text-sm",
    spacing: "space-y-3",
  },
  lg: {
    container: "p-6",
    title: "text-lg font-bold",
    content: "text-base",
    spacing: "space-y-4",
  },
};

/**
 * 개별 출석 기록 표시 컴포넌트
 */
export const AttendanceRecord: React.FC<AttendanceRecordProps> = ({
  record,
  viewType = "card",
  size = "md",
  showActions = true,
  showLocation = true,
  showNotes = true,
  onEdit,
  onDelete,
  onView,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const style = sizeStyles[size];

  // 계산된 값들
  const computed = useMemo(() => {
    const isRecordToday = isToday(new Date(record.workDate));
    const hasCheckedIn = attendanceHelpers.hasCheckedIn(record);
    const hasCheckedOut = attendanceHelpers.hasCheckedOut(record);
    const isCompleted = attendanceHelpers.isWorkCompleted(record);
    const workTime = record.totalWorkMinutes ? attendanceHelpers.formatWorkTime(record.totalWorkMinutes) : null;
    const summary = attendanceHelpers.generateRecordSummary(record);

    return {
      isRecordToday,
      hasCheckedIn,
      hasCheckedOut,
      isCompleted,
      workTime,
      summary,
    };
  }, [record]);

  // 카드 뷰 렌더링
  if (viewType === "card") {
    return (
      <div className={`
        bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow
        ${computed.isRecordToday ? "ring-2 ring-blue-200 border-blue-300" : "border-gray-200"}
        ${style.container} ${className}
      `}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className={`${style.title} text-gray-900`}>
                {record.employeeName || "직원"}
              </h3>
              <p className={`${style.content} text-gray-600`}>
                {formatDate(new Date(record.workDate), { showYear: false })}
                {computed.isRecordToday && <span className="ml-2 text-blue-600 font-medium">오늘</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <StatusChip 
              status={record.status} 
              size={size === "lg" ? "md" : "sm"}
            />
            {showActions && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={isExpanded ? "접기" : "펼치기"}
              >
                {isExpanded ? "▼" : "▶"}
              </button>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className={style.spacing}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`${style.content} font-medium text-gray-700`}>
                출근 시간
              </label>
              <p className={`${style.content} text-gray-900 mt-1`}>
                {record.actualStartTime || "미출근"}
              </p>
            </div>
            
            <div>
              <label className={`${style.content} font-medium text-gray-700`}>
                퇴근 시간
              </label>
              <p className={`${style.content} text-gray-900 mt-1`}>
                {record.actualEndTime || "미퇴근"}
              </p>
            </div>
          </div>

          {computed.workTime && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className={`${style.content} text-gray-700`}>
                총 근무시간: <span className="font-medium text-gray-900">{computed.workTime}</span>
              </p>
            </div>
          )}
        </div>

        {/* 확장 정보 */}
        {isExpanded && (
          <div className={`${style.spacing} pt-3 border-t mt-3`}>
            {/* 예정 시간 */}
            {(record.scheduledStartTime || record.scheduledEndTime) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${style.content} font-medium text-gray-700`}>
                    예정 출근
                  </label>
                  <p className={`${style.content} text-gray-600 mt-1`}>
                    {record.scheduledStartTime || "-"}
                  </p>
                </div>
                <div>
                  <label className={`${style.content} font-medium text-gray-700`}>
                    예정 퇴근
                  </label>
                  <p className={`${style.content} text-gray-600 mt-1`}>
                    {record.scheduledEndTime || "-"}
                  </p>
                </div>
              </div>
            )}

            {/* 위치 정보 */}
            {showLocation && (record.workLocation || record.checkInLatitude) && (
              <div>
                <label className={`${style.content} font-medium text-gray-700`}>
                  근무지
                </label>
                <p className={`${style.content} text-gray-600 mt-1`}>
                  {record.workLocation || "위치 정보 있음"}
                  {record.checkInLatitude && record.checkInLongitude && (
                    <span className="ml-2 text-blue-600 cursor-pointer hover:underline"
                          onClick={() => window.open(`https://maps.google.com/?q=${record.checkInLatitude},${record.checkInLongitude}`, '_blank')}>
                      📍 지도 보기
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* 메모 */}
            {showNotes && record.notes && (
              <div>
                <label className={`${style.content} font-medium text-gray-700`}>
                  메모
                </label>
                <p className={`${style.content} text-gray-600 mt-1`}>
                  {record.notes}
                </p>
              </div>
            )}

            {/* 추가 정보 */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              {record.isFlexible && (
                <div className="flex items-center space-x-1">
                  <span>🕐</span>
                  <span>유연근무</span>
                </div>
              )}
              {record.isRemoteWork && (
                <div className="flex items-center space-x-1">
                  <span>🏠</span>
                  <span>재택근무</span>
                </div>
              )}
              {record.overtimeMinutes && record.overtimeMinutes > 0 && (
                <div className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>연장근무 {attendanceHelpers.formatWorkTime(record.overtimeMinutes)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {showActions && (onEdit || onDelete || onView) && (
          <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t">
            {onView && (
              <BaseButton
                buttonState={{
                  label: "",
                  icon: "👁",
                  variant: "secondary",
                }}
                onClick={() => onView(record)}
                className="text-xs px-2 py-1"
                title="상세보기"
              />
            )}
            {onEdit && (
              <BaseButton
                buttonState={{
                  label: "",
                  icon: "✏️",
                  variant: "secondary",
                }}
                onClick={() => onEdit(record)}
                className="text-xs px-2 py-1"
                title="수정"
              />
            )}
            {onDelete && (
              <BaseButton
                buttonState={{
                  label: "",
                  icon: "🗑️",
                  variant: "danger",
                }}
                onClick={() => onDelete(record)}
                className="text-xs px-2 py-1"
                title="삭제"
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // 리스트 뷰 렌더링
  if (viewType === "list") {
    return (
      <div className={`
        flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50
        ${computed.isRecordToday ? "bg-blue-50" : ""}
        ${className}
      `}>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <StatusChip status={record.status} size="sm" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {formatDate(new Date(record.workDate), { showYear: false, showWeekday: true })}
            </h4>
            <p className="text-xs text-gray-600">
              {computed.summary}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {computed.workTime && (
            <span>{computed.workTime}</span>
          )}
          {showActions && onView && (
            <BaseButton
              buttonState={{
                label: "",
                icon: "👁",
                variant: "secondary",
              }}
              onClick={() => onView(record)}
              className="text-xs px-2 py-1"
            />
          )}
        </div>
      </div>
    );
  }

  // 테이블 행 렌더링
  if (viewType === "table") {
    return (
      <tr className={`hover:bg-gray-50 ${computed.isRecordToday ? "bg-blue-50" : ""}`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {formatDate(new Date(record.workDate), { showYear: false })}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusChip status={record.status} size="sm" />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {record.actualStartTime || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {record.actualEndTime || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {computed.workTime || "-"}
        </td>
        {showLocation && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {record.workLocation || "-"}
          </td>
        )}
        {showActions && (
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-1">
              {onView && (
                <button
                  onClick={() => onView(record)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  보기
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(record)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  수정
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    );
  }

  // 기본 뷰
  return (
    <div className={`p-3 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {formatDate(new Date(record.workDate))}
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {computed.summary}
          </p>
        </div>
        <StatusChip status={record.status} size="sm" />
      </div>
    </div>
  );
};

/**
 * 출석 기록 목록 컴포넌트
 */
export const AttendanceRecordList: React.FC<{
  records: AttendanceRecordType[];
  viewType?: AttendanceRecordViewType;
  size?: AttendanceRecordSize;
  showActions?: boolean;
  showLocation?: boolean;
  onEdit?: (record: AttendanceRecordType) => void;
  onDelete?: (record: AttendanceRecordType) => void;
  onView?: (record: AttendanceRecordType) => void;
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
}> = ({
  records,
  viewType = "card",
  size = "md",
  showActions = true,
  showLocation = true,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "출석 기록이 없습니다.",
  className = "",
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <p className="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // 테이블 뷰
  if (viewType === "table") {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                날짜
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                출근시간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                퇴근시간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                근무시간
              </th>
              {showLocation && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  근무지
                </th>
              )}
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <AttendanceRecord
                key={record.id}
                record={record}
                viewType="table"
                size={size}
                showActions={showActions}
                showLocation={showLocation}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 리스트 뷰
  if (viewType === "list") {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 ${className}`}>
        {records.map((record) => (
          <AttendanceRecord
            key={record.id}
            record={record}
            viewType="list"
            size={size}
            showActions={showActions}
            showLocation={showLocation}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    );
  }

  // 카드 뷰
  return (
    <div className={`space-y-4 ${className}`}>
      {records.map((record) => (
        <AttendanceRecord
          key={record.id}
          record={record}
          viewType="card"
          size={size}
          showActions={showActions}
          showLocation={showLocation}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

/**
 * 직원별 출석 현황 대시보드 컴포넌트
 */
export const AttendanceDashboard: React.FC<{
  employeeId: string;
  className?: string;
}> = ({ employeeId, className = "" }) => {
  const attendance = useEmployeeAttendance(employeeId);
  const [viewType, setViewType] = useState<AttendanceRecordViewType>("card");

  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const stats = useAttendanceStats(employeeId, monthStart, today);

  const handleEdit = useCallback((record: AttendanceRecordType) => {
    // TODO: 수정 모달 열기
    console.log(`출석 기록 수정: ${record.id}`);
  }, []);

  const handleDelete = useCallback((record: AttendanceRecordType) => {
    if (confirm('이 출석 기록을 삭제하시겠습니까?')) {
      attendance.deleteRecord(record.id);
    }
  }, [attendance]);

  const handleView = useCallback((record: AttendanceRecordType) => {
    // TODO: 상세 모달 열기
    console.log(`출석 기록 상세: ${record.id}`);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 오늘 현황 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘 출석 현황</h2>
        
        {attendance.currentRecord ? (
          <AttendanceRecord
            record={attendance.currentRecord}
            viewType="card"
            size="lg"
            showActions={false}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📝</div>
            <p className="text-gray-600">오늘 출석 기록이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 통계 요약 */}
      {stats.stats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">이번 달 통계</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.stats.presentDays}</div>
              <div className="text-sm text-gray-600">출석일</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.stats.absentDays}</div>
              <div className="text-sm text-gray-600">결근일</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.stats.lateDays}</div>
              <div className="text-sm text-gray-600">지각일</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.stats.overtimeDays}</div>
              <div className="text-sm text-gray-600">연장근무일</div>
            </div>
          </div>
        </div>
      )}

      {/* 출석 기록 목록 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">최근 출석 기록</h2>
          
          <div className="flex items-center space-x-2">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as AttendanceRecordViewType)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="card">카드 뷰</option>
              <option value="list">리스트 뷰</option>
              <option value="table">테이블 뷰</option>
            </select>
            
            <BaseButton
              buttonState={{
                label: "",
                icon: "🔄",
                variant: "secondary",
                loading: attendance.loading,
              }}
              onClick={attendance.refresh}
              className="text-sm px-2 py-1"
              title="새로고침"
            />
          </div>
        </div>
        
        <AttendanceRecordList
          records={attendance.recentRecords}
          viewType={viewType}
          loading={attendance.loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      {/* 에러 메시지 */}
      {attendance.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-800 font-medium">오류 발생</span>
          </div>
          <p className="text-red-700 mt-1">{attendance.error}</p>
          <BaseButton
            buttonState={{
              label: "다시 시도",
              variant: "danger",
            }}
            onClick={attendance.clearError}
            className="mt-2 text-sm"
          />
        </div>
      )}
    </div>
  );
};