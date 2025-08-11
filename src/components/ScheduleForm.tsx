"use client";

import React, { useState, useCallback, useEffect } from "react";
import { BaseButton } from "@/app/components/BaseButton";
import { TestFormField, FieldConfig, FieldPresets } from "@/app/develop-test/components/forms/TestFormField";
import { ConflictAlert, useConflictAlert } from "./ConflictAlert";
import { 
  scheduleService, 
  WorkSchedule, 
  CreateScheduleRequest, 
  UpdateScheduleRequest,
  ScheduleConflict,
  scheduleHelpers 
} from "@/services/scheduleService";
import { useDateNavigation } from "@/context/DateContext";
import { formatDateSimple } from "@/utils/dateUtils";

// 폼 모드 타입
export type ScheduleFormMode = "create" | "edit" | "duplicate";

// 폼 데이터 타입
interface ScheduleFormData {
  employeeId: string;
  employeeName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  isFlexible: boolean;
  workLocation: string;
  description: string;
}

interface ScheduleFormProps {
  mode?: ScheduleFormMode;
  initialData?: Partial<WorkSchedule>;
  employeeOptions?: Array<{ value: string; label: string; }>;
  onSubmit?: (data: WorkSchedule) => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: (schedule: WorkSchedule) => void;
  onError?: (error: Error) => void;
  className?: string;
  showConflictWarnings?: boolean;
  autoCheckConflicts?: boolean;
}

// 요일 옵션
const DAY_OF_WEEK_OPTIONS = [
  { value: "MONDAY", label: "월요일" },
  { value: "TUESDAY", label: "화요일" },
  { value: "WEDNESDAY", label: "수요일" },
  { value: "THURSDAY", label: "목요일" },
  { value: "FRIDAY", label: "금요일" },
  { value: "SATURDAY", label: "토요일" },
  { value: "SUNDAY", label: "일요일" },
];

// 기본 폼 데이터
const getDefaultFormData = (initialData?: Partial<WorkSchedule>, currentDate?: Date): ScheduleFormData => {
  const today = currentDate || new Date();
  const dayOfWeekMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  
  return {
    employeeId: initialData?.employeeId || "",
    employeeName: initialData?.employeeName || "",
    workDate: initialData?.workDate || formatDateSimple(today),
    startTime: initialData?.startTime || "09:00",
    endTime: initialData?.endTime || "18:00",
    dayOfWeek: initialData?.dayOfWeek || dayOfWeekMap[today.getDay()],
    isFlexible: initialData?.isFlexible || false,
    workLocation: initialData?.workLocation || "",
    description: initialData?.description || "",
  };
};

/**
 * 스케줄 생성/수정 폼 컴포넌트
 * 충돌 검사 및 경고 기능이 통합된 스케줄 관리 폼
 */
export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  mode = "create",
  initialData,
  employeeOptions = [],
  onSubmit,
  onCancel,
  onSuccess,
  onError,
  className = "",
  showConflictWarnings = true,
  autoCheckConflicts = true,
}) => {
  const { currentDate } = useDateNavigation();
  const conflictAlert = useConflictAlert();
  
  // 폼 상태
  const [formData, setFormData] = useState<ScheduleFormData>(() => 
    getDefaultFormData(initialData, currentDate)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [lastConflictCheck, setLastConflictCheck] = useState<ScheduleConflict[]>([]);
  const [canProceedWithConflicts, setCanProceedWithConflicts] = useState(false);

  // 필드 설정
  const fieldConfigs: FieldConfig[] = [
    // 직원 선택
    {
      ...FieldPresets.select("employeeId", "직원", employeeOptions, true),
      disabled: mode === "edit", // 수정 시에는 직원 변경 불가
    },
    
    // 근무 날짜
    {
      ...FieldPresets.text("workDate", "근무 날짜", true),
      type: "date",
    },
    
    // 시작 시간
    {
      ...FieldPresets.text("startTime", "시작 시간", true),
      type: "time",
    },
    
    // 종료 시간
    {
      ...FieldPresets.text("endTime", "종료 시간", true),
      type: "time",
      validation: {
        required: true,
        custom: (value) => {
          if (formData.startTime && value && !scheduleHelpers.isValidScheduleTime(formData.startTime, value)) {
            return "종료 시간은 시작 시간보다 늦어야 합니다.";
          }
          return null;
        },
      },
    },
    
    // 요일
    FieldPresets.select("dayOfWeek", "요일", DAY_OF_WEEK_OPTIONS, true),
    
    // 근무지
    FieldPresets.text("workLocation", "근무지"),
    
    // 설명
    FieldPresets.textarea("description", "설명"),
    
    // 유연근무제
    FieldPresets.checkbox("isFlexible", "유연근무제"),
  ];

  // 폼 데이터 변경 핸들러
  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // 날짜 변경 시 요일 자동 업데이트
      if (name === "workDate" && value) {
        const date = new Date(value);
        const dayOfWeekMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        newData.dayOfWeek = dayOfWeekMap[date.getDay()];
      }
      
      return newData;
    });
    
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // 충돌 검사 실행
  const checkConflicts = useCallback(async (data: ScheduleFormData): Promise<ScheduleConflict[]> => {
    if (!data.employeeId || !data.workDate || !data.startTime || !data.endTime) {
      return [];
    }

    setIsCheckingConflicts(true);
    try {
      const scheduleData: CreateScheduleRequest = {
        employeeId: data.employeeId,
        workDate: data.workDate,
        startTime: data.startTime,
        endTime: data.endTime,
        dayOfWeek: data.dayOfWeek,
        isFlexible: data.isFlexible,
        workLocation: data.workLocation || undefined,
        description: data.description || undefined,
      };

      const excludeId = mode === "edit" ? initialData?.id : undefined;
      const result = await scheduleService.checkScheduleConflict(scheduleData, excludeId);
      
      return result.conflicts || [];
    } catch (error) {
      console.error("충돌 검사 실패:", error);
      return [];
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [mode, initialData?.id]);

  // 자동 충돌 검사 (디바운스)
  useEffect(() => {
    if (!autoCheckConflicts || !showConflictWarnings) return;

    const timer = setTimeout(async () => {
      const conflicts = await checkConflicts(formData);
      setLastConflictCheck(conflicts);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, checkConflicts, autoCheckConflicts, showConflictWarnings]);

  // 폼 유효성 검사
  const validateForm = (data: ScheduleFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!data.employeeId) newErrors.employeeId = "직원을 선택해주세요.";
    if (!data.workDate) newErrors.workDate = "근무 날짜를 선택해주세요.";
    if (!data.startTime) newErrors.startTime = "시작 시간을 입력해주세요.";
    if (!data.endTime) newErrors.endTime = "종료 시간을 입력해주세요.";
    if (!data.dayOfWeek) newErrors.dayOfWeek = "요일을 선택해주세요.";

    // 시간 유효성 검사
    if (data.startTime && data.endTime && !scheduleHelpers.isValidScheduleTime(data.startTime, data.endTime)) {
      newErrors.endTime = "종료 시간은 시작 시간보다 늦어야 합니다.";
    }

    return newErrors;
  };

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // 충돌 검사
      const conflicts = await checkConflicts(formData);
      
      if (conflicts.length > 0 && showConflictWarnings && !canProceedWithConflicts) {
        conflictAlert.showAlert(conflicts, {
          title: mode === "create" ? "스케줄 생성 시 충돌 발생" : "스케줄 수정 시 충돌 발생",
          canProceed: true,
          recommendation: "시간을 조정하거나 기존 스케줄을 확인해주세요.",
          onProceed: async () => {
            setCanProceedWithConflicts(true);
            conflictAlert.hideAlert();
            // 충돌을 무시하고 진행
            await submitForm();
          },
          onCancel: () => {
            conflictAlert.hideAlert();
            setIsSubmitting(false);
          },
        });
        return;
      }

      await submitForm();
    } catch (error) {
      console.error("폼 제출 중 오류:", error);
      onError?.(error as Error);
      setIsSubmitting(false);
    }
  }, [formData, checkConflicts, showConflictWarnings, canProceedWithConflicts, conflictAlert, mode, onError]);

  // 실제 스케줄 제출
  const submitForm = useCallback(async () => {
    try {
      const scheduleData: CreateScheduleRequest | UpdateScheduleRequest = {
        employeeId: formData.employeeId,
        workDate: formData.workDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        dayOfWeek: formData.dayOfWeek,
        isFlexible: formData.isFlexible,
        workLocation: formData.workLocation || undefined,
        description: formData.description || undefined,
      };

      let result: WorkSchedule;

      if (mode === "edit" && initialData?.id) {
        result = await scheduleService.updateSchedule({
          ...scheduleData,
          id: initialData.id,
        } as UpdateScheduleRequest);
      } else {
        result = await scheduleService.createSchedule(scheduleData);
      }

      // 성공 처리
      onSuccess?.(result);
      onSubmit?.(result);
      
      // 폼 리셋 (생성 모드일 때만)
      if (mode === "create") {
        setFormData(getDefaultFormData(undefined, currentDate));
        setCanProceedWithConflicts(false);
      }

    } catch (error) {
      console.error("스케줄 저장 실패:", error);
      onError?.(error as Error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, initialData?.id, onSuccess, onSubmit, onError, currentDate]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" && "새 스케줄 생성"}
            {mode === "edit" && "스케줄 수정"}
            {mode === "duplicate" && "스케줄 복제"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === "create" && "새로운 근무 스케줄을 생성합니다."}
            {mode === "edit" && "기존 스케줄을 수정합니다."}
            {mode === "duplicate" && "기존 스케줄을 복제하여 새로 생성합니다."}
          </p>
        </div>

        {/* 충돌 경고 (인라인) */}
        {showConflictWarnings && lastConflictCheck.length > 0 && !conflictAlert.isVisible && (
          <div className="mb-6">
            <ConflictAlert
              conflicts={lastConflictCheck}
              type="inline"
              title="스케줄 충돌 감지"
              showDetails={false}
              canProceed={false}
            />
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldConfigs.map((config) => (
              <div key={config.name} className={config.type === "textarea" ? "md:col-span-2" : ""}>
                <TestFormField
                  config={config}
                  value={formData[config.name as keyof ScheduleFormData]}
                  onChange={handleFieldChange}
                  error={errors[config.name]}
                />
              </div>
            ))}
          </div>

          {/* 폼 정보 */}
          {formData.startTime && formData.endTime && scheduleHelpers.isValidScheduleTime(formData.startTime, formData.endTime) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">스케줄 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">근무 시간:</span>
                  <span className="ml-2 font-medium">
                    {scheduleHelpers.formatScheduleTime(formData.startTime, formData.endTime)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">소요 시간:</span>
                  <span className="ml-2 font-medium">
                    {scheduleHelpers.calculateDurationMinutes(formData.startTime, formData.endTime)}분
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <BaseButton
                buttonState={{
                  label: "취소",
                  variant: "secondary",
                  disabled: isSubmitting,
                }}
                onClick={onCancel}
              />
            )}
            
            <BaseButton
              buttonState={{
                label: isCheckingConflicts 
                  ? "충돌 검사 중..." 
                  : mode === "create" 
                    ? "스케줄 생성" 
                    : "스케줄 수정",
                variant: "primary",
                loading: isSubmitting || isCheckingConflicts,
                disabled: isSubmitting || isCheckingConflicts,
              }}
              type="submit"
            />
          </div>
        </form>
      </div>

      {/* 충돌 알림 모달 */}
      {conflictAlert.isVisible && (
        <ConflictAlert
          conflicts={conflictAlert.conflicts}
          type="modal"
          {...conflictAlert.alertProps}
        />
      )}
    </div>
  );
};

/**
 * 간단한 스케줄 생성 폼 컴포넌트
 */
export const QuickScheduleForm: React.FC<{
  employeeId?: string;
  defaultDate?: string;
  onSubmit?: (schedule: WorkSchedule) => void;
  onCancel?: () => void;
  className?: string;
}> = ({
  employeeId,
  defaultDate,
  onSubmit,
  onCancel,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = useCallback((schedule: WorkSchedule) => {
    onSubmit?.(schedule);
    setIsOpen(false);
  }, [onSubmit]);

  if (!isOpen) {
    return (
      <BaseButton
        buttonState={{
          label: "빠른 스케줄 추가",
          variant: "primary",
          icon: "➕",
        }}
        onClick={() => setIsOpen(true)}
        className={className}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <ScheduleForm
          mode="create"
          initialData={{
            employeeId,
            workDate: defaultDate,
          }}
          onSuccess={handleSuccess}
          onCancel={() => {
            setIsOpen(false);
            onCancel?.();
          }}
          showConflictWarnings={true}
          autoCheckConflicts={true}
        />
      </div>
    </div>
  );
};