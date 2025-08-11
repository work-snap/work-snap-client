// src/lib/api/validateInviteCode.ts

import api from "../api";

export interface ValidateInviteCodeRequest {
  workplaceId: number;
  inviteCode: string;
}

export interface ValidateInviteCodeResponse {
  success: boolean;
  data: {
    inviteCode: string;
    partTimer: {
      userId: number;
      name: string;
      phoneNumber: string;
    };
    alreadyRegistered: boolean;
  };
  message: string;
}

export const validateInviteCode = async ({
  workplaceId,
  inviteCode,
}: ValidateInviteCodeRequest): Promise<ValidateInviteCodeResponse> => {
  const { data } = await api.post(
    `/api/business-owner/workplaces/${workplaceId}/employees/invites/validate`,
    { inviteCode }
  );
  console.log(data);
  return data;
};
