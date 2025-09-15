"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
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

export default function RegisterParttimer() {
  const joinUserMutation = useJoinUser();
  const validateInviteCodeMutation = useValidateInviteCode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("idx"));
  const { data } = useGetWorkplaceDetail(workplaceId);
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hourlyWage, setHourlyWage] = useState(""); // 시급 입력 필드 추가

  // 날짜 변수명 일치
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Vemontes 방식: 기존 직원 정보 모달 상태
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

  // 시급 입력 핸들러
  const handleHourlyWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 입력 가능하도록 제한
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

    // 시급 입력 검증
    if (!hourlyWage || isNaN(Number(hourlyWage)) || Number(hourlyWage) <= 0) {
      toast({
        title: "시급 입력",
        description: "올바른 시급을 입력해주세요.",
      });
      return;
    }

    try {
      console.log("🚀 등록 요청 시작:", {
        workplaceId,
        inviteCode: code,
        contractStartDate,
        contractEndDate,
        hourlyWage: Number(hourlyWage),
        forceCreate: false,
        restoreExisting: false,
      });

      // ✨ Vemontes 방식: 항상 forceCreate: false로 시작
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

      console.log("📥 서버 응답 받음:", res);

      if (res.success && res.data) {
        console.log("✅ 성공 응답 데이터:", res.data);
        console.log("🔍 requiresUserChoice:", res.data.requiresUserChoice);

        if (res.data.requiresUserChoice) {
          // ✨ 기존 정보 발견 - 항상 사용자 선택 요구 (Vemontes 방식)
          console.log(
            "✅ 정상 응답에서 기존 직원 정보 발견:",
            res.data.existingEmployee
          );
          setExistingEmployee(res.data.existingEmployee || null);
          setShowConfirmModal(true);
          console.log("🎯 모달 표시 상태 설정 완료");
        } else {
          // ✅ 신규 사용자 등록 완료
          console.log("🆕 신규 사용자 등록 완료");
          handleRegistrationSuccess(res.data);
        }
      } else {
        console.log("❌ 응답이 성공하지 않음:", res);
      }
    } catch (err: any) {
      console.error("등록 실패:", err);
      console.error("에러 응답 전체:", err?.response?.data);

      // ✨ 400 에러에서도 requiresUserChoice 확인 (백엔드 트랜잭션 이슈 대응)
      if (err?.response?.status === 400) {
        const errorResponse = err?.response?.data;
        const errorData = errorResponse?.data;
        const errorMessage = errorResponse?.message || "";

        console.log("🔍 400 에러 전체 응답:", errorResponse);
        console.log("🔍 400 에러 데이터:", errorData);
        console.log("🔍 400 에러 메시지:", errorMessage);

        // Case 1: 에러 응답에서 requiresUserChoice 정보가 있는 경우
        if (errorData?.requiresUserChoice && errorData?.existingEmployee) {
          console.log(
            "✅ 에러 응답에서 기존 직원 정보 발견, 모달 표시:",
            errorData.existingEmployee
          );
          setExistingEmployee(errorData.existingEmployee);
          setShowConfirmModal(true);
          return;
        }

        // Case 1.5: 백엔드에서 기존 직원 감지 후 트랜잭션 롤백된 경우
        // 인증 완료된 상태에서 400 에러 = 기존 직원 가능성 높음
        if (name && phone && !errorMessage.includes("기존 멤버십이 없습니다")) {
          console.log("🎯 기존 직원 관련 에러 감지 - 강제 모달 생성");

          // 인증된 정보로 모달 표시
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

          console.log("🛠️ 기존 직원 감지로 상태 설정:", detectedEmployeeInfo);
          setExistingEmployee(detectedEmployeeInfo);
          setShowConfirmModal(true);
          console.log("🎯 기존 직원 감지 모달 표시 상태 설정 완료");
          return;
        }

        // Case 2: "기존 멤버십이 없습니다" 에러 - 삭제된 유저일 가능성이 높음
        if (errorMessage.includes("기존 멤버십이 없습니다")) {
          console.log(
            "🎯 기존 멤버십 없음 에러 - 삭제된 유저로 추정하여 수동 모달 생성"
          );

          // 삭제된 유저에 대한 기본 정보로 모달 표시
          const fallbackEmployeeInfo: ExistingEmployeeInfo = {
            userInfo: {
              userId: 0, // 임시값
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

          console.log("🛠️ fallback 정보로 상태 설정:", fallbackEmployeeInfo);
          setExistingEmployee(fallbackEmployeeInfo);
          setShowConfirmModal(true);
          console.log("🎯 fallback 모달 표시 상태 설정 완료");
          return;
        }

        // Case 3: 트랜잭션 롤백 에러
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

  // ✨ 강제 등록: 기존 데이터 삭제 후 새로 등록
  const handleForceRegistration = async () => {
    try {
      console.log("🔥 강제 등록 시작:", {
        workplaceId,
        inviteCode: code,
        forceCreate: true,
        restoreExisting: false,
      });

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

      console.log("✅ 강제 등록 성공:", res);
      if (res.success && res.data) {
        setShowConfirmModal(false);
        handleRegistrationSuccess(res.data);
      }
    } catch (error: any) {
      console.error("❌ 강제 등록 실패:", error);
      console.error("❌ 강제 등록 에러 응답:", error?.response?.data);

      // 강제 등록도 400 에러가 나는 경우 → 신규 등록으로 처리
      if (error?.response?.status === 400) {
        console.log("🔄 강제 등록 실패 → 신규 사용자로 재시도");
        try {
          // 모든 플래그를 false로 하여 신규 등록 시도
          const retryRes = await joinUserMutation.mutateAsync({
            workplaceId,
            inviteCode: code,
            schedules,
            contractStartDate,
            contractEndDate,
            hourlyWage: Number(hourlyWage),
            forceCreate: false, // false로 변경
            restoreExisting: false,
          });

          console.log("✅ 재시도 성공:", retryRes);
          setShowConfirmModal(false);
          handleRegistrationSuccess(retryRes.data);
          return;
        } catch (retryError) {
          console.error("❌ 재시도도 실패:", retryError);
        }
      }

      toast({
        title: "등록 실패",
        description: "새로 등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // ✨ 기존 데이터 복구: 입력한 정보 무시하고 기존 데이터로 재활성화
  const handleRestoreExisting = async () => {
    try {
      console.log("🔄 기존 정보 복구 시작:", {
        workplaceId,
        inviteCode: code,
        forceCreate: false,
        restoreExisting: true,
      });

      const res = await joinUserMutation.mutateAsync({
        workplaceId,
        inviteCode: code,
        schedules: [], // 기존 스케줄 유지
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

      console.log("✅ 기존 정보 복구 성공:", res);
      if (res.success && res.data) {
        setShowConfirmModal(false);
        handleRegistrationSuccess(res.data);
      }
    } catch (error: any) {
      console.error("❌ 데이터 복구 실패:", error);
      console.error("❌ 복구 에러 응답:", error?.response?.data);

      // 복구도 400 에러가 나는 경우 → 신규 등록으로 처리
      if (error?.response?.status === 400) {
        console.log("🔄 복구 실패 → 신규 사용자로 재시도");
        try {
          // 복구가 안 되면 신규 등록으로 시도
          const retryRes = await joinUserMutation.mutateAsync({
            workplaceId,
            inviteCode: code,
            schedules,
            contractStartDate,
            contractEndDate,
            hourlyWage: Number(hourlyWage),
            forceCreate: false, // 신규 등록
            restoreExisting: false,
          });

          console.log("✅ 신규 등록으로 재시도 성공:", retryRes);
          setShowConfirmModal(false);
          handleRegistrationSuccess(retryRes.data);
          return;
        } catch (retryError) {
          console.error("❌ 신규 등록 재시도도 실패:", retryError);
        }
      }

      toast({
        title: "복구 실패",
        description: "데이터 복구에 실패했습니다. '새로 등록'을 시도해보세요.",
        variant: "destructive",
      });
    }
  };

  // ✨ 직접 신규 등록: 모든 플래그 무시하고 강제로 신규 등록
  // const handleDirectNewRegistration = async () => {
  //   try {
  //     console.log("🆕 직접 신규 등록 시작 (백엔드 이슈 우회)");

  //     // 완전히 새로운 등록으로 처리 (모든 백엔드 체크 우회)
  //     const res = await joinUserMutation.mutateAsync({
  //       workplaceId,
  //       inviteCode: code,
  //       schedules,
  //       contractStartDate,
  //       contractEndDate,
  //       hourlyWage: Number(hourlyWage),
  //       // 두 플래그 모두 false로 설정하여 신규 등록 강제
  //       forceCreate: false,
  //       restoreExisting: false,
  //     });

  //     console.log("✅ 직접 신규 등록 성공:", res);
  //     setShowConfirmModal(false);
  //     handleRegistrationSuccess(res.data);

  //     toast({
  //       title: "등록 완료",
  //       description: "새로운 계약으로 등록되었습니다.",
  //     });
  //   } catch (error: any) {
  //     console.error("❌ 직접 신규 등록도 실패:", error);

  //     toast({
  //       title: "등록 실패",
  //       description:
  //         "시스템 오류로 등록에 실패했습니다. 관리자에게 문의해주세요.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // 등록 성공 처리
  const handleRegistrationSuccess = (data: any) => {
    const registrationType = data.registrationType;
    const restoredData = data.restoredData;

    // 상태별 맞춤 메시지 표시
    const customMessage = getRegistrationMessage(
      registrationType,
      restoredData
    );

    toast({
      title: "등록 완료",
      description: customMessage,
    });

    // 등록된 정보 표시
    if (data.employeeInfo) {
      console.log("등록된 알바:", data.employeeInfo);
    }

    // 복구된 설정이 있는 경우 추가 알림
    if (restoredData?.restoredPreferences) {
      setTimeout(() => {
        toast({
          title: "설정 복구",
          description: "✅ 이전 설정이 복구되었습니다.",
          variant: "default",
        });
      }, 1500);
    }

    // 페이지 이동
    router.push(`/user/business/add-business/detail?idx=${workplaceId}`);
  };

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
                disableAnimation // 날짜 선택 클릭 시 자동꺼짐현상 없앰
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
                disableAnimation // 날짜 선택 클릭 시 자동꺼짐현상 없앰
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
              className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
            >
              알바 등록하기
            </Button>
          </div>
        </form>

        {/* ✨ 기존 정보 확인 모달 (Vemontes 방식) */}
        {(() => {
          console.log("🎭 모달 렌더링 체크:", {
            showConfirmModal,
            existingEmployee: !!existingEmployee,
          });
          return null;
        })()}
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
            // onDirectNew={handleDirectNewRegistration}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// ✨ 기존 정보 확인 모달 컴포넌트
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
  // onDirectNew: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  existingEmployee,
  newEmployeeInfo,
  onRestore,
  onRegisterNew,
  // onDirectNew,
  onCancel,
}) => {
  // 스케줄을 읽기 쉬운 형태로 변환
  const formatSchedules = (schedules: ScheduleItem[]) => {
    if (!schedules || schedules.length === 0) return "없음";

    // 요일을 한글로 변환하는 헬퍼 함수
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

  // 기존 계약 기간 포맷팅
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

  // 새 계약 기간 포맷팅
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
          {/* ✨ 정보 비교 테이블 */}
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

              {/* 기존 정보 상태 안내 */}
              {(existingEmployee.contractStartDate === "이전 계약 정보 없음" ||
                existingEmployee.contractStartDate ===
                  "이전 등록 기록 발견") && (
                <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-xs">
                  {existingEmployee.contractStartDate === "이전 등록 기록 발견"
                    ? "📋 이전에 등록했던 기록이 있습니다."
                    : "💡 이전 등록 정보가 삭제되어 상세 정보를 확인할 수 없습니다."}
                </div>
              )}
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

              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-xs">
                💡 방금 입력하신 새로운 정보입니다.
              </div>
            </div>
          </div>

          {/* ✨ 선택 안내 */}
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

          {/* ✨ 액션 버튼 */}
          <div className="space-y-3">
            {/* 첫 번째 줄: 주요 선택지 */}
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

            {/* 두 번째 줄: 고급 옵션 */}
            {/* <button
              onClick={onDirectNew}
              className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              <span className="font-bold">🆕 직접 신규 등록</span>
              <span className="ml-2 text-xs opacity-90">
                (시스템 검증 우회)
              </span>
            </button> */}

            {/* 세 번째 줄: 취소 */}
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
