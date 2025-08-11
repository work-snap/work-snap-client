// src/lib/queries/useDeleteUser.ts
import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "@/src/lib/api/delete"; // 또는 api/user.ts

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: deleteUser,
  });
};
