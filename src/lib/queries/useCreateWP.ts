import { useMutation } from "@tanstack/react-query";
import {
  createWP,
  CreateWPRequest,
  CreateWPResponse,
} from "@/src/lib/api/createWP";

export const useCreateWP = () => {
  return useMutation<CreateWPResponse, Error, CreateWPRequest>({
    mutationFn: (payload) => createWP(payload),
  });
};
