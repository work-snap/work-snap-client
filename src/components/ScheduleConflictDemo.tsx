"use client";

import React, { useState } from "react";
import { DateNavigationProvider } from "@/context/DateContext";
import { ScheduleForm, QuickScheduleForm } from "./ScheduleForm";
import { ConflictAlert, useConflictAlert, ConflictSummary } from "./ConflictAlert";
import { BaseButton } from "@/app/components/BaseButton";
import { DateNavigation } from "./DateNavigation";
import { WorkSchedule, ScheduleConflict } from "@/services/scheduleService";

// 샘플 직원 데이터
const SAMPLE_EMPLOYEES = [
  { value: "EMP001", label: "김철수 (개발팀)" },
  { value: "EMP002", label: "이영희 (디자인팀)" },
  { value: "EMP003", label: "박민수 (개발팀)" },
  { value: "EMP004", label: "정수진 (마케팅팀)" },
  { value: "EMP005", label: "최동현 (인사팀)" },
];

// 샘플 충돌 데이터 생성
const createSampleConflicts = (): ScheduleConflict[] => [
  {
    conflictingSchedule: {
      id: "schedule-1",
      employeeId: "EMP001",
      employeeName: "김철수",
      workDate: "2024-01-15",
      startTime: "09:00",
      endTime: "18:00",
      dayOfWeek: "MONDAY",
      isFlexible: false,
      isActive: true,
      workLocation: "본사",
    },
    conflictType: "OVERLAP",
    conflictStartTime: "09:30",
    conflictEndTime: "10:30",
    conflictDurationMinutes: 60,
    message: "기존 스케줄과 1시간 겹칩니다",
  },
  {
    conflictingSchedule: {
      id: "schedule-2",
      employeeId: "EMP001",
      employeeName: "김철수",
      workDate: "2024-01-15",
      startTime: "14:00",
      endTime: "16:00",
      dayOfWeek: "MONDAY",
      isFlexible: true,
      isActive: true,
      workLocation: "재택",
    },
    conflictType: "ADJACENT",
    conflictStartTime: "13:00",
    conflictEndTime: "14:00",
    conflictDurationMinutes: 0,
    message: "연속된 스케줄로 휴게시간이 부족할 수 있습니다",
  },
];

/**
 * 스케줄 충돌 검사 데모 컴포넌트
 * ScheduleForm과 ConflictAlert 컴포넌트의 통합 사용 예시
 */
export const ScheduleConflictDemo: React.FC = () => {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  const [demoConflicts] = useState<ScheduleConflict[]>(createSampleConflicts());
  const [currentForm, setCurrentForm] = useState<"none" | "create" | "edit" | "quick">("none");
  
  const conflictAlert = useConflictAlert();

  // 스케줄 생성/수정 성공 핸들러
  const handleScheduleSuccess = (schedule: WorkSchedule) => {
    if (selectedSchedule) {
      // 수정
      setSchedules(prev => 
        prev.map(s => s.id === schedule.id ? schedule : s)
      );
    } else {
      // 생성
      setSchedules(prev => [...prev, schedule]);
    }
    
    setCurrentForm("none");
    setSelectedSchedule(null);
    alert(`스케줄이 성공적으로 ${selectedSchedule ? "수정" : "생성"}되었습니다.`);
  };

  // 스케줄 수정 시작
  const handleEditSchedule = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setCurrentForm("edit");
  };

  // 스케줄 삭제
  const handleDeleteSchedule = (schedule: WorkSchedule) => {
    if (confirm(`${schedule.employeeName}님의 스케줄을 삭제하시겠습니까?`)) {
      setSchedules(prev => prev.filter(s => s.id !== schedule.id));
    }
  };

  // 충돌 알림 데모
  const showConflictDemo = (type: "modal" | "inline" | "toast" | "banner") => {
    conflictAlert.showAlert(demoConflicts, {
      type,
      title: "스케줄 충돌 데모",
      canProceed: true,
      recommendation: "시간을 조정하거나 기존 스케줄을 확인해주세요.",
      onProceed: () => {
        alert("충돌을 무시하고 진행하였습니다.");
        conflictAlert.hideAlert();
      },
      onCancel: () => {
        alert("작업이 취소되었습니다.");
        conflictAlert.hideAlert();
      },
    });
  };

  return (
    <DateNavigationProvider>
      <div className="h-full bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              스케줄 충돌 검사 시스템 데모
            </h1>
            <p className="text-gray-600">
              스케줄 생성/수정 시 충돌 검사 및 경고 메시지 표시 기능을 확인해보세요.
            </p>
          </div>

          {/* 날짜 네비게이션 */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">날짜 선택</h2>
            <DateNavigation />
          </div>

          {/* 컨트롤 패널 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">스케줄 관리</h2>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <BaseButton
                buttonState={{
                  label: "새 스케줄 생성",
                  variant: "primary",
                  icon: "➕",
                }}
                onClick={() => {
                  setSelectedSchedule(null);
                  setCurrentForm("create");
                }}
              />
              
              <BaseButton
                buttonState={{
                  label: "빠른 생성",
                  variant: "secondary",
                  icon: "⚡",
                }}
                onClick={() => setCurrentForm("quick")}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">충돌 알림 데모</h3>
              <div className="flex flex-wrap gap-2">
                <BaseButton
                  buttonState={{
                    label: "모달 알림",
                    variant: "secondary",
                  }}
                  onClick={() => showConflictDemo("modal")}
                />
                <BaseButton
                  buttonState={{
                    label: "인라인 알림",
                    variant: "secondary",
                  }}
                  onClick={() => showConflictDemo("inline")}
                />
                <BaseButton
                  buttonState={{
                    label: "토스트 알림",
                    variant: "secondary",
                  }}
                  onClick={() => showConflictDemo("toast")}
                />
                <BaseButton
                  buttonState={{
                    label: "배너 알림",
                    variant: "secondary",
                  }}
                  onClick={() => showConflictDemo("banner")}
                />
              </div>
            </div>
          </div>

          {/* 충돌 요약 정보 */}
          <div className="mb-6">
            <ConflictSummary
              conflicts={demoConflicts}
              className="bg-white rounded-lg shadow-sm border"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 스케줄 폼 */}
            <div>
              {currentForm === "create" && (
                <ScheduleForm
                  mode="create"
                  employeeOptions={SAMPLE_EMPLOYEES}
                  onSuccess={handleScheduleSuccess}
                  onCancel={() => setCurrentForm("none")}
                  onError={(error) => alert(`오류: ${error.message}`)}
                  showConflictWarnings={true}
                  autoCheckConflicts={true}
                />
              )}

              {currentForm === "edit" && selectedSchedule && (
                <ScheduleForm
                  mode="edit"
                  initialData={selectedSchedule}
                  employeeOptions={SAMPLE_EMPLOYEES}
                  onSuccess={handleScheduleSuccess}
                  onCancel={() => {
                    setCurrentForm("none");
                    setSelectedSchedule(null);
                  }}
                  onError={(error) => alert(`오류: ${error.message}`)}
                  showConflictWarnings={true}
                  autoCheckConflicts={true}
                />
              )}

              {currentForm === "none" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <p className="text-gray-600 text-lg mb-4">
                      스케줄 폼을 사용해보세요
                    </p>
                    <p className="text-sm text-gray-500">
                      "새 스케줄 생성" 버튼을 클릭하여 시작하세요.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 스케줄 목록 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">생성된 스케줄</h2>
              
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📝</div>
                  <p className="text-gray-600">
                    아직 생성된 스케줄이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {schedule.employeeName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {schedule.workDate} ({schedule.startTime} - {schedule.endTime})
                          </p>
                          {schedule.workLocation && (
                            <p className="text-xs text-gray-500">
                              📍 {schedule.workLocation}
                            </p>
                          )}
                          {schedule.isFlexible && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                              유연근무
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-1">
                          <BaseButton
                            buttonState={{
                              label: "",
                              icon: "✏️",
                              variant: "secondary",
                            }}
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-xs px-2 py-1"
                            title="수정"
                          />
                          <BaseButton
                            buttonState={{
                              label: "",
                              icon: "🗑️",
                              variant: "danger",
                            }}
                            onClick={() => handleDeleteSchedule(schedule)}
                            className="text-xs px-2 py-1"
                            title="삭제"
                          />
                        </div>
                      </div>
                      
                      {schedule.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {schedule.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 기능 설명 */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">구현된 기능</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">충돌 검사</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 실시간 충돌 검사</li>
                  <li>• 백엔드 API 연동</li>
                  <li>• 시간 겹침 분석</li>
                  <li>• 중복 스케줄 감지</li>
                  <li>• 인접 스케줄 경고</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">경고 시스템</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 4가지 알림 타입</li>
                  <li>• 심각도별 스타일</li>
                  <li>• 사용자 액션 옵션</li>
                  <li>• 무시하고 진행 기능</li>
                  <li>• 상세 정보 표시</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">폼 기능</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 생성/수정/복제 모드</li>
                  <li>• 실시간 유효성 검사</li>
                  <li>• 자동 요일 설정</li>
                  <li>• 시간 계산</li>
                  <li>• 직원 선택</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 생성 폼 모달 */}
        {currentForm === "quick" && (
          <QuickScheduleForm
            onSubmit={handleScheduleSuccess}
            onCancel={() => setCurrentForm("none")}
          />
        )}

        {/* 충돌 알림 모달 */}
        {conflictAlert.isVisible && (
          <ConflictAlert
            conflicts={conflictAlert.conflicts}
            {...conflictAlert.alertProps}
          />
        )}
      </div>
    </DateNavigationProvider>
  );
};