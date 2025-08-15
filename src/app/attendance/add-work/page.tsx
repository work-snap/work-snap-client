"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@heroui/react";
import { Clock, MapPin } from "lucide-react";
import PageHeader from "./components/PageHeader";
import DateSelector from "./components/DateSelector";
import WorkplaceDropdown from "./components/WorkplaceDropdown";
import TimePicker from "@/app/components/TimePicker";
import { useGetMyWP } from "@/lib/queries/getMyWP";
import { useToast } from "@/hooks/use-toast";
import { useCreateAdditionalWork } from "@/hooks/useAttendanceQuery";

interface AddWorkForm {
    date: string;
    workplaceId: number | null;
    startTime: string;
    endTime: string;
    notes: string;
}

export default function AddWorkPage() {
    const router = useRouter();
    const { toast } = useToast();
    const createAdditionalWorkMutation = useCreateAdditionalWork();
    
    // 안전한 날짜 초기값 설정
    const getTodayDate = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const [form, setForm] = useState<AddWorkForm>({
        date: getTodayDate(), // 안전한 오늘 날짜 형식
        workplaceId: null,
        startTime: "",
        endTime: "",
        notes: "",
    });

    // 사용자의 사업장 목록 조회
    const { data: workplacesResponse, isLoading: workplacesLoading } = useGetMyWP();

    // WorkplaceDetail[]을 WorkplaceSummary[]로 변환
    const workplaces = workplacesResponse?.data?.map(workplace => ({
        id: workplace.workplace.id,
        workplaceName: workplace.workplace.workplaceName,
        workplaceType: workplace.workplace.workplaceType,
        workplaceAddress: workplace.workplace.workplaceAddress,
        isMainWorkplace: workplace.workplace.isMainWorkplace,
        isActive: workplace.workplace.isActive,
        workplaceColorIndex: workplace.workplace.workplaceColorIndex,
    })) || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.workplaceId) {
            toast({
                title: "입력 오류",
                description: "사업장을 선택해주세요.",
                variant: "destructive",
            });
            return;
        }

        if (!form.startTime || !form.endTime) {
            toast({
                title: "입력 오류",
                description: "시작 시간과 종료 시간을 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        const requestData = {
            workplaceId: form.workplaceId!,
            workDate: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            reason: form.notes || undefined
        };

        console.log("추가근무 등록 요청:", requestData);
        
        createAdditionalWorkMutation.mutate(requestData, {
            onSuccess: () => {
                // 성공 토스트 표시
                toast({
                    title: "등록 완료",
                    description: "추가근무가 성공적으로 등록되었습니다.",
                });

                // 성공 시 attendance 페이지로 이동
                router.push("/attendance");
            },
            onError: (error: any) => {
                console.error("추가근무 등록 실패:", error);
                
                // 에러 메시지 추출
                const errorMessage = error?.response?.data?.message || 
                                   error?.message || 
                                   "추가근무 등록에 실패했습니다. 다시 시도해주세요.";
                
                toast({
                    title: "등록 실패",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        });
    };

    const handleInputChange = useCallback((field: keyof AddWorkForm, value: string | number) => {
        console.log(`[AddWorkPage] handleInputChange: ${field} = ${value}`);
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleTimeChange = useCallback(({ startTime, endTime }: { startTime: string; endTime: string }) => {
        console.log(`[AddWorkPage] handleTimeChange: startTime=${startTime}, endTime=${endTime}`);
        setForm(prev => ({
            ...prev,
            startTime,
            endTime
        }));
    }, []);

    return (
        <div className="flex flex-col bg-white w-full min-h-0">
            <PageHeader title="추가근무 등록" />

            <div className="overflow-y-auto p-4">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 사업장 선택 */}
                    <div>
                        <div className="text-[15px] font-bold mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            사업장
                        </div>
                        <WorkplaceDropdown
                            workplaces={workplaces}
                            selectedWorkplaceId={form.workplaceId}
                            onChange={(workplaceId) => handleInputChange("workplaceId", workplaceId)}
                            label="사업장을 선택하세요"
                        />
                        {workplacesLoading && (
                            <div className="text-sm text-gray-500 mt-1">사업장 목록을 불러오는 중...</div>
                        )}
                    </div>
                    {/* 날짜 선택 */}
                    <DateSelector
                        date={form.date}
                        onChange={(date) => handleInputChange("date", date)}
                    />

                                         {/* 시간 선택 */}
                     <div className="space-y-4">
                         <div className="text-[15px] font-bold flex items-center gap-2">
                             <Clock className="w-4 h-4" />
                             근무 시간
                         </div>
                         
                         <TimePicker
                             onChange={handleTimeChange}
                             debug={true}
                         />
                     </div>

                     {/* 제출 버튼 */}
                     <div className="pt-4">
                         <Button
                             type="submit"
                             className="w-full h-14 bg-main text-white font-bold rounded-xl"
                             disabled={!form.workplaceId || !form.startTime || !form.endTime || createAdditionalWorkMutation.isPending}
                             isLoading={createAdditionalWorkMutation.isPending}
                         >
                             {createAdditionalWorkMutation.isPending ? "등록 중..." : "추가근무 등록"}
                         </Button>
                     </div>
                </form>
            </div>
        </div>
    );
}
