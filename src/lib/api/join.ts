// src/lib/api/join.ts
import api from "../api";

export interface JoinUserPayload {
  inviteCode: string;
  //   name: string;
  //   phone: string;
  //   startDate: string;
  //   endDate: string;
}

export interface JoinUserResponse {
  success: boolean;
  data?: {
    success: boolean;
    workplaceId: number;
    inviteCodeOwner: number;
    message: string;
  };
  message: string;
}

export const joinUser = async (
  payload: JoinUserPayload
): Promise<JoinUserResponse> => {
  const res = await api.post(
    `/api/v1/part-time/join?inviteCode=${encodeURIComponent(
      payload.inviteCode
    )}`
  );
  console.log("👀 응답 데이터:", res.data);
  return res.data;
};
