// src/lib/queries/useValidateInviteCode.ts
import { useMutation } from "@tanstack/react-query";
import {
  validateInviteCode,
  ValidateInviteCodeRequest,
  ValidateInviteCodeResponse,
} from "../api/validateInviteCode";

export const useValidateInviteCode = () => {
  return useMutation<
    ValidateInviteCodeResponse,
    Error,
    ValidateInviteCodeRequest
  >({
    mutationFn: validateInviteCode,
  });
};
