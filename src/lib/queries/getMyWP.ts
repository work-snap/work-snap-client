// src/lib/queries/useGetWP.ts
import { useQuery } from "@tanstack/react-query";
import { getMyWorkPlaces } from "../api/getMyWP";

export const useGetMyWP = () => {
  return useQuery({
    queryKey: ["useGetMyWP"],
    queryFn: getMyWorkPlaces,
    retry: 0,
  });
};
