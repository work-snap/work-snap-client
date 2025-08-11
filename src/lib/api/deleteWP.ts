import api from "../api";

export const deleteWorkplace = async (workplaceId: number): Promise<void> => {
  await api.delete(`/api/business-owner/workplaces/${workplaceId}`);
};
