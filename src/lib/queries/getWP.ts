// src/lib/queries/useGetWP.ts
import { useQuery } from "@tanstack/react-query";
import { getWorkPlaces } from "@/src/lib/api/getWP";

export const useGetWP = () => {
  return useQuery({
    queryKey: ["useGetWP"],
    queryFn: getWorkPlaces,
    retry: 0,
  });
};
