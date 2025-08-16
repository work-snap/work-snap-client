// src/app/user/business/mypage/page.tsx
"use client";

import { useDeleteUser } from "@/src/lib/queries/deleteUser";
import { useUser } from "@/src/lib/queries/useUser";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = () => {
    const confirmDelete = window.confirm("정말 회원 탈퇴하시겠습니까?");
    if (!confirmDelete) return;

    deleteUser(undefined, {
      onSuccess: () => {
        alert("회원 탈퇴가 완료되었습니다.");
        router.push("/"); // 로그인 페이지 등으로 이동
      },
      onError: (error) => {
        alert("회원 탈퇴에 실패했습니다.");
        console.error(error);
      },
    });
  };
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    alert("로그아웃되었습니다.");
    router.push("/");
  };

  return (
    <div className="h-dvh mx-auto w-full bg-white max-w-[430px]  flex flex-col">
      <div className="p-4 flex flex-col gap-6 flex-grow pt-[60px]">
        <h1 className="text-2xl font-bold">MY</h1>

        <div className="flex items-center gap-4 p-4 rounded-xl border">
          <Image
            src={user?.data.profileImageUrl || "/default-profile.jpg"}
            alt="profile"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{user?.data.nickname || "사용자"}</p>
            <p className="text-sm text-gray-400">
              {user?.data.email || "이메일 없음"}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-[20px]">
          <button className="w-full flex justify-between items-center p-3 border rounded-xl">
            <span>사업자등록증 관리</span>
            <span className="text-xl text-gray-400">›</span>
          </button>
          <button className="w-full flex justify-between items-center p-3 border rounded-xl">
            <span>알림설정</span>
            <span className="text-xl text-gray-400">›</span>
          </button>
        </div>
      </div>

      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="flex-1 border rounded-xl py-4 text-sm font-medium"
          >
            로그아웃
          </button>
          <button
            className="flex-1 border rounded-xl py-4 text-sm font-medium text-red-500"
            onClick={handleDelete}
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
