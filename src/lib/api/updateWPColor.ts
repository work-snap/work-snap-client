//src/lib/api/updateWPColor.ts

import api from "../api";

export const UpdateWorkplaceColor = async (
  workplaceId: number,
  index: number
): Promise<void> => {
  await api.put(
    `/api/v1/part-time/workplace/${workplaceId}/color`,
    null, // body가 필요 없으므로 null
    {
      params: { index }, // query parameter로 전달
    }
  );
};
