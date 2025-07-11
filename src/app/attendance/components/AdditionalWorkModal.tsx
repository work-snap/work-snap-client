import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/components/ui/use-toast";
import { useCreateAdditionalWork } from "../lib/hooks";

const additionalWorkSchema = z
  .object({
    startTime: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "올바른 시간 형식을 입력해주세요 (HH:mm)"
      ),
    endTime: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "올바른 시간 형식을 입력해주세요 (HH:mm)"
      ),
    reason: z
      .string()
      .min(5, "사유는 최소 5자 이상 입력해주세요")
      .max(200, "사유는 200자를 초과할 수 없습니다"),
  })
  .refine(
    (data) => {
      const start = new Date(`2000/01/01 ${data.startTime}`);
      const end = new Date(`2000/01/01 ${data.endTime}`);
      return end > start;
    },
    {
      message: "종료 시간은 시작 시간보다 늦어야 합니다",
      path: ["endTime"],
    }
  );

type AdditionalWorkForm = z.infer<typeof additionalWorkSchema>;

interface AdditionalWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  workplaceId: number;
  date: Date;
}

export function AdditionalWorkModal({
  isOpen,
  onClose,
  workplaceId,
  date,
}: AdditionalWorkModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdditionalWorkForm>({
    resolver: zodResolver(additionalWorkSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createMutation = useCreateAdditionalWork({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyAttendance", format(date, "yyyy-MM-dd")],
      });
      toast({
        title: "추가 근무가 등록되었습니다",
        description: "근무 기록이 성공적으로 생성되었습니다.",
      });
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "추가 근무 등록에 실패했습니다. 다시 시도해주세요.";
      toast({
        variant: "destructive",
        title: "오류가 발생했습니다",
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (data: AdditionalWorkForm) => {
    createMutation.mutate({
      workplaceId,
      workDate: format(date, "yyyy-MM-dd"),
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">추가 근무 등록</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">시작 시간</label>
            <input
              type="time"
              {...register("startTime")}
              className="w-full border rounded-md p-2"
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">종료 시간</label>
            <input
              type="time"
              {...register("endTime")}
              className="w-full border rounded-md p-2"
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">사유</label>
            <textarea
              {...register("reason")}
              className="w-full border rounded-md p-2 h-24"
              placeholder="추가 근무 사유를 입력해주세요"
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-main text-white rounded-md hover:bg-main/90"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
