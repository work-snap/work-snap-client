"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import DayTimePicker, {
  type ScheduleItem,
} from "@/src/app/components/DayTimePicker";
import { DatePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { useGetEmployeeDetail } from "@/lib/queries/getEmployeeDetail";
import { useGetWorkplaceDetail } from "@/lib/queries/getWPDetail";
import { useUpdateEmployee } from "@/lib/queries/updateEmployee";
import { useDeleteEmployee } from "@/lib/queries/useDeleteEmployee";

export default function EditEmployee() {
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workplaceId = Number(searchParams.get("idx"));
  const employeeId = Number(searchParams.get("userId"));

  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentHourlyWage, setCurrentHourlyWage] = useState(""); // 현재 시급 (읽기전용)
  const [newHourlyWage, setNewHourlyWage] = useState(""); // 새 시급 입력
  const [enableHourlyWageChange, setEnableHourlyWageChange] = useState(false); // 시급 변경 활성화
  const [changeType, setChangeType] = useState<"IMMEDIATE" | "SCHEDULED">(
    "IMMEDIATE"
  );
  const [scheduledChangeDate, setScheduledChangeDate] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // 삭제 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [terminationDate, setTerminationDate] = useState("");
  const [terminationReason, setTerminationReason] = useState("");

  // 사업장 상세
  const { data: workplace, isLoading: isWorkplaceLoading } =
    useGetWorkplaceDetail(workplaceId);
  // ✅ 개별 직원 상세 정보
  const { data: employeeDetail, isLoading: isEmployeeLoading } =
    useGetEmployeeDetail(workplaceId, employeeId);

  const handleSchedulesChange = useCallback((newSchedules: ScheduleItem[]) => {
    setSchedules(newSchedules);
  }, []);

  // ✅ 새 시급 입력 핸들러 추가
  const handleNewHourlyWageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setNewHourlyWage(value);
    }
  };

  // ✅ useEffect 수정 - 개별 직원 상세 데이터 로딩
  useEffect(() => {
    if (!employeeDetail?.data) return;

    const employeeData = employeeDetail.data;
    console.log("전체 employeeData:", employeeData);
    console.log("currentHourlyWage 필드:", employeeData.currentHourlyWage);

    setCode(employeeData.inviteCode || "");
    setName(employeeData.name || "");
    setPhone(employeeData.phoneNumber || "");
    setContractStartDate(employeeData.contractStartDate || "");
    setContractEndDate(employeeData.contractEndDate || "");

    // ✅ 현재 시급 설정 (수정 불가)
    if (employeeData.currentHourlyWage) {
      setCurrentHourlyWage(String(employeeData.currentHourlyWage));
      console.log("현재 시급 설정됨:", employeeData.currentHourlyWage);
    } else {
      console.log("⚠️ currentHourlyWage 필드가 없거나 값이 없습니다.");
    }
  }, [employeeDetail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // ✅ 시급 변경 관련 유효성 검사
    if (enableHourlyWageChange) {
      if (
        !newHourlyWage ||
        isNaN(Number(newHourlyWage)) ||
        Number(newHourlyWage) <= 0
      ) {
        toast({
          title: "시급 입력 오류",
          description: "올바른 새 시급을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 최저임금 검사
      if (Number(newHourlyWage) < 9860) {
        toast({
          title: "시급 입력 오류",
          description: "시급은 최저임금(9,860원) 이상이어야 합니다.",
          variant: "destructive",
        });
        return;
      }

      // 현재 시급과 동일한지 검사
      if (
        currentHourlyWage &&
        Number(newHourlyWage) === Number(currentHourlyWage)
      ) {
        toast({
          title: "시급 입력 오류",
          description: "현재 시급과 동일합니다. 다른 금액을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 예정 변경일 검사
      if (changeType === "SCHEDULED" && !scheduledChangeDate) {
        toast({
          title: "입력 누락",
          description: "시급 변경 예정일을 선택해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 예정 변경일이 과거인지 검사
      if (changeType === "SCHEDULED" && scheduledChangeDate) {
        const changeDate = new Date(scheduledChangeDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (changeDate <= today) {
          toast({
            title: "날짜 선택 오류",
            description: "변경 예정일은 내일 이후로 선택해주세요.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // ❌ 기존 스케줄 필수 검사 제거 (선택사항이므로)
    // if (schedules.length === 0) { ... }

    try {
      // ✅ 수정된 payload 구성
      const payload = {
        contractStartDate,
        contractEndDate: contractEndDate || undefined, // 빈 문자열이면 undefined
        hourlyWageUpdate: enableHourlyWageChange
          ? {
              newHourlyWage: Number(newHourlyWage),
              changeType: changeType as "IMMEDIATE" | "SCHEDULED", // 수정됨
              ...(changeType === "SCHEDULED" && { scheduledChangeDate }),
            }
          : undefined, // 시급 변경 비활성화 시 undefined
        schedules:
          schedules.length > 0
            ? schedules.map((item) => ({
                ...item,
                dayOfWeek: item.dayOfWeek.toUpperCase() as
                  | "MONDAY"
                  | "TUESDAY"
                  | "WEDNESDAY"
                  | "THURSDAY"
                  | "FRIDAY"
                  | "SATURDAY"
                  | "SUNDAY",
              }))
            : undefined, // 스케줄이 없으면 undefined
      };

      console.log("전송할 payload:", payload); // 디버깅용

      const res = await updateEmployeeMutation.mutateAsync({
        workplaceId,
        employeeId,
        payload,
      });

      toast({
        title: "수정 완료",
        description: "알바 정보가 업데이트되었습니다.",
        variant: "success",
      });
      router.push(`/user/business/add-business/detail?idx=${workplaceId}`);
    } catch (err: any) {
      console.error("수정 실패:", err); // 디버깅용
      toast({
        title: "수정 실패",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 알바 삭제 처리
  const handleDeleteEmployee = async () => {
    if (!terminationDate) {
      toast({
        title: "입력 누락",
        description: "종료일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 종료일이 과거인지 검사
    const termDate = new Date(terminationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (termDate < today) {
      toast({
        title: "날짜 선택 오류",
        description: "종료일은 오늘 이후로 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteEmployeeMutation.mutateAsync({
        workplaceId,
        employeeId,
        payload: {
          terminationDate,
          terminationReason: terminationReason || undefined,
        },
      });

      toast({
        title: "삭제 완료",
        description: "알바 계약이 성공적으로 종료되었습니다.",
        variant: "success",
      });

      // 삭제 모달 닫기
      setShowDeleteModal(false);

      // 사업장 상세 페이지로 돌아가기
      router.push(`/user/business/add-business/detail?idx=${workplaceId}`);
    } catch (err: any) {
      console.error("삭제 실패:", err);
      toast({
        title: "삭제 실패",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  if (isWorkplaceLoading || isEmployeeLoading) return <div>로딩 중...</div>;

  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      <div className="flex flex-col px-2 py-2">
        <button
          onClick={() =>
            router.push(`/user/business/add-business/detail?idx=${workplaceId}`)
          }
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
      </div>

      <div className="flex-1 flex flex-col gap-3 max-h-[1137px] overflow-y-auto ">
        <span className="ml-4 mt-2 font-extrabold text-2xl">
          알바 정보 수정
        </span>
        <div className="px-4 mb-2">
          <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray4 font-semibold text-base">
            사업장 : {workplace?.workplaceName || "-"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 ">
          {/* 인증코드 */}
          <span className="font-semibold text-gray4">인증코드</span>
          <label className="flex gap-2">
            <input
              type="text"
              value={code}
              disabled
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray2 rounded-lg p-3 w-full"
              placeholder="예) 23FK99"
            />
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
                    setContractStartDate(
                      `${newDate.year}-${String(newDate.month).padStart(
                        2,
                        "0"
                      )}-${String(newDate.day).padStart(2, "0")}`
                    );
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
                    setContractEndDate(
                      `${newDate.year}-${String(newDate.month).padStart(
                        2,
                        "0"
                      )}-${String(newDate.day).padStart(2, "0")}`
                    );
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

          {/* ✅ 1. 현재 시급 표시 + 시급 변경 옵션 (통합) */}
          <div className="flex flex-col gap-3 rounded-xl border border-gray2 bg-white px-4 py-3">
            {/* 헤더: 현재 시급 제목 + 시급 변경 토글 */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray4">현재 시급</span>
              <label className="flex items-center gap-2 text-gray4">
                <span className="text-sm">시급 변경</span>
                <Switch
                  checked={enableHourlyWageChange}
                  onChange={(e) => setEnableHourlyWageChange(e.target.checked)}
                  aria-label="시급 변경 토글"
                />
              </label>
            </div>

            {/* 현재 시급 입력 필드 */}
            <div className="relative">
              <input
                type="text"
                value={currentHourlyWage}
                disabled
                className="border border-gray2 rounded-lg p-3 w-full pr-16 bg-gray-50"
                placeholder="현재 설정된 시급"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray3 text-sm">
                원/시간
              </span>
            </div>
            {currentHourlyWage && (
              <div className="text-xs text-gray3">
                현재 시급: {Number(currentHourlyWage).toLocaleString()}원/시간
              </div>
            )}

            {/* ✅ 시급 변경 옵션 (조건부 렌더링) - border 안에 포함 */}
            {enableHourlyWageChange && (
              <>
                {/* 구분선 */}
                <div className="border-t border-gray2 pt-3">
                  {/* 변경 타입 선택 */}
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="font-semibold text-gray4">변경 방식</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="changeType"
                          value="IMMEDIATE"
                          checked={changeType === "IMMEDIATE"}
                          onChange={(e) =>
                            setChangeType(
                              e.target.value as "IMMEDIATE" | "SCHEDULED"
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">즉시 변경</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="changeType"
                          value="SCHEDULED"
                          checked={changeType === "SCHEDULED"}
                          onChange={(e) =>
                            setChangeType(
                              e.target.value as "IMMEDIATE" | "SCHEDULED"
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">예정 변경</span>
                      </label>
                    </div>
                  </div>

                  {/* 새 시급 입력 */}
                  <div className="flex flex-col gap-1 mb-3">
                    <span className="font-semibold text-gray4">새 시급</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={newHourlyWage}
                        onChange={handleNewHourlyWageChange}
                        className="border border-gray2 rounded-lg p-3 w-full pr-16"
                        placeholder="예: 12000"
                        maxLength={6}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray3 text-sm">
                        원/시간
                      </span>
                    </div>
                    {newHourlyWage && (
                      <div className="text-xs text-gray3 mt-1">
                        새 시급: {Number(newHourlyWage).toLocaleString()}원/시간
                      </div>
                    )}
                  </div>

                  {/* 예정 변경일 (SCHEDULED 선택 시만 표시) */}
                  {changeType === "SCHEDULED" && (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray4">
                        변경 예정일
                      </span>
                      <DatePicker
                        value={
                          scheduledChangeDate
                            ? parseDate(scheduledChangeDate)
                            : null
                        }
                        onChange={(newDate: CalendarDate | null) => {
                          if (newDate) {
                            setScheduledChangeDate(
                              `${newDate.year}-${String(newDate.month).padStart(
                                2,
                                "0"
                              )}-${String(newDate.day).padStart(2, "0")}`
                            );
                          }
                        }}
                        aria-label="시급 변경 예정일"
                        placeholder="변경 예정일 선택"
                        disableAnimation
                        showMonthAndYearPickers
                        granularity="day"
                        minValue={parseDate(
                          new Date().toISOString().split("T")[0]
                        )} // 오늘 이후만 선택 가능
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 근무 시간 */}
          <DayTimePicker onChange={handleSchedulesChange} />

          {/* 버튼들 */}
          <div className="w-full pt-6 pb-8 flex flex-col gap-3">
            {/* 수정 버튼 */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
            >
              알바 수정하기
            </Button>

            {/* 삭제 버튼 */}
            <Button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl h-[50px] text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              알바 삭제하기
            </Button>
          </div>
        </form>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-auto p-6">
            <div className="flex flex-col gap-4">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">알바 삭제</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 경고 메시지 */}
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    주의: 이 작업은 되돌릴 수 없습니다
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    알바 계약을 종료하면 관련된 스케줄과 미래 출근 기록이
                    삭제됩니다.
                  </p>
                </div>
              </div>

              {/* 종료일 선택 */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">
                  계약 종료일 <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={terminationDate ? parseDate(terminationDate) : null}
                  onChange={(newDate: CalendarDate | null) => {
                    if (newDate) {
                      setTerminationDate(
                        `${newDate.year}-${String(newDate.month).padStart(
                          2,
                          "0"
                        )}-${String(newDate.day).padStart(2, "0")}`
                      );
                    }
                  }}
                  aria-label="계약 종료일"
                  placeholder="종료일 선택"
                  disableAnimation
                  showMonthAndYearPickers
                  granularity="day"
                  minValue={parseDate(new Date().toISOString().split("T")[0])}
                />
              </div>

              {/* 종료 사유 (선택사항) */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">
                  종료 사유 (선택사항)
                </label>
                <textarea
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full resize-none"
                  placeholder="예: 계약 만료, 업무 부적응 등"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                  {terminationReason.length}/500
                </div>
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg h-[50px]"
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteEmployee}
                  disabled={
                    deleteEmployeeMutation.isPending || !terminationDate
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteEmployeeMutation.isPending ? "처리 중..." : "삭제하기"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
