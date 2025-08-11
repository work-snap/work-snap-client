import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkplace } from "../api/deleteWP";

export const useDeleteWP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkplace,
    onSuccess: () => {
      // 삭제 성공 후 사업장 목록 쿼리 무효화 및 재조회
      queryClient.invalidateQueries({ queryKey: ["useGetWP"] });
    },
  });
};
