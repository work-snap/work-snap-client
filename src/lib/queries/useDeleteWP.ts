import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkplace } from "../api/deleteWP";

export const useDeleteWP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkplace,
    onSuccess: () => {
      // 삭제 성공 후 관련 쿼리들 무효화 및 즉시 재조회
      queryClient.invalidateQueries({ queryKey: ["useGetWP"] });
      queryClient.refetchQueries({ queryKey: ["useGetWP"] });
      queryClient.invalidateQueries({ queryKey: ["businessOwnerWorkplaces"] });
      queryClient.invalidateQueries({ queryKey: ["hasAnyWorkplace"] });
    },
  });
};
