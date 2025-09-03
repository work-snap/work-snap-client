import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWP,
  CreateWPRequest,
  CreateWPResponse,
} from "@/src/lib/api/createWP";

export const useCreateWP = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateWPResponse, Error, CreateWPRequest>({
    mutationFn: (payload) => createWP(payload),
    onSuccess: () => {
      // 사업장 생성 성공 후 관련 쿼리들 무효화 및 재조회
      queryClient.invalidateQueries({ queryKey: ["useGetWP"] });
      queryClient.invalidateQueries({ queryKey: ["businessOwnerWorkplaces"] });
      queryClient.invalidateQueries({ queryKey: ["hasAnyWorkplace"] });
    },
  });
};
