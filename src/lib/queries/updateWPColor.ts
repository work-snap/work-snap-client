// src/lib/queries/updateWPColor.ts
import { useMutation } from "@tanstack/react-query";
import api from "../api"; // axios instance

export interface UpdateColorRequest {
  workplaceId: number;
  index: number;
}

export const updateWorkPlaceColor = () => {
  return useMutation({
    mutationFn: async ({ workplaceId, index }: UpdateColorRequest) => {
      const res = await api.put(
        `/api/v1/part-time/workplace/${workplaceId}/color`,
        null, // body 필요 없음
        { params: { index } } // query parameter
      );
      return res.data;
    },
  });
};
