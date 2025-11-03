"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useJoinUser } from "@/src/lib/queries/joinUser";
import { useGetWorkplaceDetail } from "@/src/lib/queries/getWPDetail";
import { useValidateInviteCode } from "@/src/lib/queries/validateInviteCode";
import {
  EmployeeRegistrationStatus,
  ExistingEmployeeInfo,
} from "@/src/types/api";
import DayTimePicker, {
  type ScheduleItem,
} from "@/src/app/components/DayTimePicker";
import { DatePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";

interface RegisterFormClientProps {
  workplaceId: number;
}

export default function RegisterFormClient({
  workplaceId,
}: RegisterFormClientProps) {
  const joinUserMutation = useJoinUser();
  const validateInviteCodeMutation = useValidateInviteCode();
  const router = useRouter();
  const { data } = useGetWorkplaceDetail(workplaceId);
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");

  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingEmployee, setExistingEmployee] =
    useState<ExistingEmployeeInfo | null>(null);

  // 등록 결과 메시지 생성 함수
  const getRegistrationMessage = (
    registrationType?: EmployeeRegistrationStatus,
    restoredData?: any
  ) => {
    switch (registrationType) {
      case EmployeeRegistrationStatus.NEW_USER:
        return "새로운 아르바이트생이 등록되었습니다.";

      case EmployeeRegistrationStatus.RETURNING_INACTIVE:
        return `이전 설정으로 복구되었습니다. (${
          restoredData?.reactivationCount || 1
        }번째 재등록)`;

      case EmployeeRegistrationStatus.TERMINATED:
        return `새로운 계약으로 재등록되었습니다.\n이전 계약: ${
          restoredData?.previousContractPeriod || "기록 없음"
        }`;

      default:
        return "등록이 완료되었습니다.";
    }
  };

  const handleValidateCode = async () => {
    if (!code) {
      toast({ title: "인증코드 입력", description: "코드를 입력해주세요." });
      return;
    }
    try {
      const res = await validateInviteCodeMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
      });
      setName(res.data.partTimer.name);
      setPhone(res.data.partTimer.phoneNumber);
      toast({ title: "인증 성공", description: res.message });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "인증 실패",
        description: err?.message || "잠시 후 다시 시도해주세요.",
      });
    }
  };

  const handleSchedulesChange = useCallback((newSchedules: ScheduleItem[]) => {
    setSchedules(newSchedules);
  }, []);

  const handleHourlyWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setHourlyWage(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!code || !name || !phone || schedules.length === 0) {
      toast({
        title: "입력 누락",
        description: "인증코드와 근무 시간을 모두 입력해주세요.",
      });
      return;
    }

    if (!hourlyWage || isNaN(Number(hourlyWage)) || Number(hourlyWage) <= 0) {
      toast({
        title: "시급 입력",
        description: "올바른 시급을 입력해주세요.",
      });
      return;
    }

    try {
      const res = await joinUserMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
        schedules,
        contractStartDate,
        contractEndDate,
        hourlyWage: Number(hourlyWage),
        forceCreate: false,
        restoreExisting: false,
      });

      if (res.success && res.data) {
        if (res.data.requiresUserChoice) {
          setExistingEmployee(res.data.existingEmployee || null);
          setShowConfirmModal(true);
        } else {
          handleRegistrationSuccess(res.data);
        }
      }
    } catch (err: any) {
      console.error("등록 실패:", err);

      if (err?.response?.status === 400) {
        const errorResponse = err?.response?.data;
        const errorData = errorResponse?.data;
        const errorMessage = errorResponse?.message || "";

        if (errorData?.requiresUserChoice && errorData?.existingEmployee) {
          setExistingEmployee(errorData.existingEmployee);
          setShowConfirmModal(true);
          return;
        }

        if (name && phone && !errorMessage.includes("기존 멤버십이 없습니다")) {
          const detectedEmployeeInfo: ExistingEmployeeInfo = {
            userInfo: {
              userId: 0,
              name: name || "알 수 없음",
              phoneNumber: phone || "알 수 없음",
            },
            contractStartDate: "이전 등록 기록 발견",
            contractEndDate: undefined,
            currentHourlyWage: undefined,
            status: "TERMINATED",
            scheduleCount: 0,
            lastActiveDate: undefined,
          };

          setExistingEmployee(detectedEmployeeInfo);
          setShowConfirmModal(true);
          return;
        }

        if (errorMessage.includes("기존 멤버십이 없습니다")) {
          const fallbackEmployeeInfo: ExistingEmployeeInfo = {
            userInfo: {
              userId: 0,
              name: name || "알 수 없음",
              phoneNumber: phone || "알 수 없음",
            },
            contractStartDate: "이전 계약 정보 없음",
            contractEndDate: undefined,
            currentHourlyWage: undefined,
            status: "TERMINATED",
            scheduleCount: 0,
            lastActiveDate: undefined,
          };

          setExistingEmployee(fallbackEmployeeInfo);
          setShowConfirmModal(true);
          return;
        }

        if (errorMessage.includes("Transaction")) {
          toast({
            title: "등록 처리 중 오류",
            description:
              "시스템 처리 중 문제가 발생했습니다. 다시 시도해주세요.",
            variant: "destructive",
          });
          return;
        }
      }

      if (err?.response?.status === 409) {
        toast({
          title: "등록 불가",
          description: "이미 등록된 아르바이트생입니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "등록 실패",
          description:
            err?.response?.data?.message ||
            err?.message ||
            "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    }
  };

  const handleForceRegistration = async () => {
    try {
      const res = await joinUserMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
        schedules,
        contractStartDate,
        contractEndDate,
        hourlyWage: Number(hourlyWage),
        forceCreate: true,
        restoreExisting: false,
      });

      if (res.success && res.data) {
        setShowConfirmModal(false);
        handleRegistrationSuccess(res.data);
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        try {
          const retryRes = await joinUserMutation.mutateAsync({
            workplaceId,
            inviteCode: code,
            schedules,
            contractStartDate,
            contractEndDate,
            hourlyWage: Number(hourlyWage),
            forceCreate: false,
            restoreExisting: false,
          });

          setShowConfirmModal(false);
          handleRegistrationSuccess(retryRes.data);
          return;
        } catch (retryError) {
          console.error("재시도 실패:", retryError);
        }
      }

      toast({
        title: "등록 실패",
        description: "새로 등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreExisting = async () => {
    try {
      const res = await joinUserMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
        schedules: [],
        contractStartDate:
          existingEmployee?.contractStartDate &&
          existingEmployee.contractStartDate !== "이전 계약 정보 없음" &&
          existingEmployee.contractStartDate !== "이전 등록 기록 발견"
            ? existingEmployee.contractStartDate
            : contractStartDate,
        contractEndDate: existingEmployee?.contractEndDate || contractEndDate,
        hourlyWage: existingEmployee?.currentHourlyWage || Number(hourlyWage),
        forceCreate: false,
        restoreExisting: true,
      });

      if (res.success && res.data) {
        setShowConfirmModal(false);
        handleRegistrationSuccess(res.data);
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        try {
          const retryRes = await joinUserMutation.mutateAsync({
            workplaceId,
            inviteCode: code,
            schedules,
            contractStartDate,
            contractEndDate,
            hourlyWage: Number(hourlyWage),
            forceCreate: false,
            restoreExisting: false,
          });

          setShowConfirmModal(false);
          handleRegistrationSuccess(retryRes.data);
          return;
        } catch (retryError) {
          console.error("재시도 실패:", retryError);
        }
      }

      toast({
        title: "복구 실패",
        description: "데이터 복구에 실패했습니다. '새로 등록'을 시도해보세요.",
        variant: "destructive",
      });
    }
  };

  const handleRegistrationSuccess = (data: any) => {
    const registrationType = data.registrationType;
    const restoredData = data.restoredData;

    const customMessage = getRegistrationMessage(
      registrationType,
      restoredData
    );

    toast({
      title: "등록 완료",
      description: customMessage,
    });

    if (restoredData?.restoredPreferences) {
      setTimeout(() => {
        toast({
          title: "설정 복구",
          description: "✅ 이전 설정이 복구되었습니다.",
          variant: "default",
        });
      }, 1500);
    }

    router.push(`/user/business/add-business/detail?idx=${workplaceId}`);
  };

  // ✅ 모든 필수 필드가 입력되었는지 확인
  const isFormValid =
    code.trim() !== "" &&
    name.trim() !== "" &&
    phone.trim() !== "" &&
    hourlyWage.trim() !== "" &&
    Number(hourlyWage) > 0 &&
    schedules.length > 0;

  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      {/* 상단 네비게이션 */}
      <div className="flex flex-col px-2 py-2">
        <button
          onClick={() => {
            router.push(`/user/business/add-business/detail?idx=${data?.id}`);
          }}
          className="text-gray5 font-semibold text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="px-2 py-4 font-extrabold text-2xl">알바 등록</span>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 max-h-[1137px] overflow-y-auto ">
        <div className="px-4 mb-2">
          <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray4 font-semibold text-base">
            사업장 : {data?.workplaceName || "-"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 mt-2">
          {/* 인증코드 */}
          <span className="font-semibold text-gray4">인증코드</span>
          <label className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="예) 23FK99"
            />
            <button
              type="button"
              onClick={handleValidateCode}
              className="bg-main text-gray1 font-semibold rounded-xl px-8 whitespace-nowrap"
            >
              인증하기
            </button>
          </label>

          {/* 이름 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">이름</span>
            <input
              type="text"
              value={name}
              disabled
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="이름 입력"
            />
          </label>

          {/* 번호 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">번호</span>
            <div className="relative">
              <input
                type="text"
                value={phone}
                disabled
                className="border border-gray2 rounded-lg p-3 w-full"
                placeholder="예) 010-1234-1234"
              />
              {phone && phone.startsWith("010-1234-") && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  임시번호
                </span>
              )}
            </div>
          </label>

          {/* 계약 기간 */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray4">계약 기간</span>
            <div className="flex items-center justify-center gap-2">
              <DatePicker
                value={contractStartDate ? parseDate(contractStartDate) : null}
                onChange={(newDate: CalendarDate | null) => {
                  if (newDate) {
                    const formattedDate = `${newDate.year}-${String(
                      newDate.month
                    ).padStart(2, "0")}-${String(newDate.day).padStart(
                      2,
                      "0"
                    )}`;
                    setContractStartDate(formattedDate);
                  }
                }}
                aria-label="계약 시작일"
                placeholder="시작일"
                disableAnimation
                showMonthAndYearPickers
                granularity="day"
              />
              <span>-</span>
              <DatePicker
                value={contractEndDate ? parseDate(contractEndDate) : null}
                onChange={(newDate: CalendarDate | null) => {
                  if (newDate) {
                    const formattedDate = `${newDate.year}-${String(
                      newDate.month
                    ).padStart(2, "0")}-${String(newDate.day).padStart(
                      2,
                      "0"
                    )}`;
                    setContractEndDate(formattedDate);
                  }
                }}
                aria-label="계약 종료일"
                placeholder="종료일"
                disableAnimation
                showMonthAndYearPickers
                granularity="day"
              />
            </div>
          </div>

          {/* 시급 입력 */}
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-gray4">시급</span>
            <div className="relative">
              <input
                type="text"
                value={hourlyWage}
                onChange={handleHourlyWageChange}
                className="border border-gray2 rounded-lg p-3 w-full pr-16"
                placeholder="예: 10000"
                maxLength={6}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray3 text-sm">
                원/시간
              </span>
            </div>
            {hourlyWage && (
              <div className="text-xs text-gray3 mt-1">
                입력된 시급: {Number(hourlyWage).toLocaleString()}원/시간
              </div>
            )}
          </label>

          {/* 근무 시간 */}
          <DayTimePicker onChange={handleSchedulesChange} />

          {/* 등록 버튼 */}
          <div className="w-full pt-6 pb-8">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              알바 등록하기
            </Button>
          </div>
        </form>

        {/* 기존 정보 확인 모달 */}
        {showConfirmModal && existingEmployee && (
          <ConfirmModal
            existingEmployee={existingEmployee}
            newEmployeeInfo={{
              name,
              phone,
              contractStartDate,
              contractEndDate,
              hourlyWage: Number(hourlyWage),
              schedules,
            }}
            onRestore={handleRestoreExisting}
            onRegisterNew={handleForceRegistration}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// 모달 컴포넌트
interface NewEmployeeInfo {
  name: string;
  phone: string;
  contractStartDate: string;
  contractEndDate: string;
  hourlyWage: number;
  schedules: ScheduleItem[];
}

interface ConfirmModalProps {
  existingEmployee: ExistingEmployeeInfo;
  newEmployeeInfo: NewEmployeeInfo;
  onRestore: () => void;
  onRegisterNew: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  existingEmployee,
  newEmployeeInfo,
  onRestore,
  onRegisterNew,
  onCancel,
}) => {
  const formatSchedules = (schedules: ScheduleItem[]) => {
    if (!schedules || schedules.length === 0) return "없음";

    const getDayKorean = (dayOfWeek: string) => {
      const dayMap: { [key: string]: string } = {
        SUNDAY: "일",
        MONDAY: "월",
        TUESDAY: "화",
        WEDNESDAY: "수",
        THURSDAY: "목",
        FRIDAY: "금",
        SATURDAY: "토",
      };
      return dayMap[dayOfWeek] || dayOfWeek;
    };

    return schedules
      .map(
        (schedule) =>
          `${getDayKorean(schedule.dayOfWeek)} ${schedule.startTime}-${
            schedule.endTime
          }`
      )
      .join(", ");
  };

  const formatExistingContract = () => {
    if (existingEmployee.contractStartDate === "이전 계약 정보 없음") {
      return "🔍 이전 계약 정보 없음";
    }
    if (existingEmployee.contractStartDate === "이전 등록 기록 발견") {
      return "📋 이전 등록 기록이 발견되었습니다";
    }
    return `${existingEmployee.contractStartDate} ~ ${
      existingEmployee.contractEndDate || "무기한"
    }`;
  };

  const formatNewContract = () => {
    if (
      !newEmployeeInfo.contractStartDate &&
      !newEmployeeInfo.contractEndDate
    ) {
      return "설정 안함";
    }
    return `${newEmployeeInfo.contractStartDate || "미정"} ~ ${
      newEmployeeInfo.contractEndDate || "무기한"
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4">
          <h2 className="text-xl font-bold text-center">
            기존 등록 정보가 발견되었습니다
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            기존 정보를 복구하거나 새로 입력한 정보로 등록할 수 있습니다.
          </p>
        </div>

        <div className="p-4">
          {/* 정보 비교 테이블 */}
          <div className="flex flex-col gap-4 mb-6">
            {/* 기존 정보 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                🔄 기존 등록 정보
                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  {existingEmployee.status === "TERMINATED"
                    ? "삭제됨"
                    : existingEmployee.status}
                </span>
              </h3>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">이름:</span>
                  <div className="text-blue-700">
                    {existingEmployee.userInfo.name}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">번호:</span>
                  <div className="text-blue-700">
                    {existingEmployee.userInfo.phoneNumber}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">계약 기간:</span>
                  <div className="text-blue-700">
                    {formatExistingContract()}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">시급:</span>
                  <div className="text-blue-700">
                    {existingEmployee.currentHourlyWage
                      ? `${existingEmployee.currentHourlyWage.toLocaleString()}원`
                      : "정보 없음"}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">스케줄:</span>
                  <div className="text-blue-700">
                    {existingEmployee.scheduleCount}개 설정됨
                  </div>
                </div>

                {existingEmployee.lastActiveDate && (
                  <div>
                    <span className="font-medium text-gray-700">
                      마지막 활동:
                    </span>
                    <div className="text-blue-700">
                      {existingEmployee.lastActiveDate}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 새로 입력한 정보 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-3 flex items-center">
                ✨ 새로 입력한 정보
                <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                  신규
                </span>
              </h3>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">이름:</span>
                  <div className="text-green-700">
                    {newEmployeeInfo.name || "미입력"}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">번호:</span>
                  <div className="text-green-700">
                    {newEmployeeInfo.phone || "미입력"}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">계약 기간:</span>
                  <div className="text-green-700">{formatNewContract()}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">시급:</span>
                  <div className="text-green-700">
                    {newEmployeeInfo.hourlyWage > 0
                      ? `${newEmployeeInfo.hourlyWage.toLocaleString()}원`
                      : "미입력"}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">스케줄:</span>
                  <div className="text-green-700">
                    {newEmployeeInfo.schedules.length > 0
                      ? `${newEmployeeInfo.schedules.length}개 설정`
                      : "미설정"}
                  </div>
                  {newEmployeeInfo.schedules.length > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      {formatSchedules(newEmployeeInfo.schedules)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 선택 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-yellow-800 mb-2">
              어떻게 처리하시겠습니까?
            </h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                • <strong>기존 정보로 복구:</strong> 이전 설정을 그대로
                사용합니다
              </p>
              <p>
                • <strong>새로 입력한 정보로 등록:</strong> 방금 입력한 정보로
                새 계약을 생성합니다
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onRestore}
                className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
              >
                <span className="font-bold">🔄 기존 정보로 복구</span>
                <span className="text-xs opacity-90 mt-1">
                  이전 설정 그대로 사용
                </span>
              </button>

              <button
                onClick={onRegisterNew}
                className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex flex-col items-center text-sm"
              >
                <span className="font-bold">✨ 새 정보로 등록</span>
                <span className="text-xs opacity-90 mt-1">
                  입력한 정보로 새 계약
                </span>
              </button>
            </div>

            <button
              onClick={onCancel}
              className="w-full py-3 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
