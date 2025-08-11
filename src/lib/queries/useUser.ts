// src/lib/queries/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/src/lib/api/user";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });
};
