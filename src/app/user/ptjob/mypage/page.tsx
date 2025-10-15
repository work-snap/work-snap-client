// src/app/user/ptjob/mypage/page.tsx
"use client";

import Navigation from "@/src/app/components/navigation";
import { useDeleteUser } from "@/src/lib/queries/deleteUser";
import { useUser } from "@/src/lib/queries/useUser";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/src/stores/userStore";
import { useQueryClient } from "@tanstack/react-query";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MyPage() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { toast } = useToast();
  const { clearUser } = useUserStore();
  const queryClient = useQueryClient();

  // 모달 상태 관리
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return (
      <div className="h-dvh bg-white max-w-[430px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteUser(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false);
        toast({
          title: "회원 탈퇴 완료",
          description: "회원 탈퇴가 완료되었습니다.",
        });
        // Zustand 스토어 및 React Query 캐시 초기화
        queryClient.clear();
        clearUser();
        router.push("/");
      },
      onError: (error) => {
        toast({
          title: "회원 탈퇴 실패",
          description: "회원 탈퇴에 실패했습니다.",
          variant: "destructive",
        });
        console.error(error);
      },
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    toast({
      title: "로그아웃 완료",
      description: "로그아웃되었습니다.",
    });
    // Zustand 스토어 및 React Query 캐시 초기화
    queryClient.clear();
    clearUser();
    router.push("/");
  };

  return (
    <div className="h-dvh bg-white max-w-[430px] w-full flex flex-col">
      <div className="p-4 flex flex-col gap-6 flex-grow pt-[40px]">
        <h1 className="text-2xl font-bold">MY</h1>

        <div className="flex items-center gap-4 p-4 rounded-xl border">
          <Image
            src={user?.profileImageUrl || "/default-profile.jpg"}
            alt="profile"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold">{user?.nickname || "사용자"}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {user?.phoneNumber && (
              <div className="flex items-center gap-1 mt-1">
                <p className="text-sm text-gray-400">{user?.phoneNumber}</p>
                {user?.phoneNumber.startsWith("010-1234-") && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    임시번호
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-[20px]">
          <button
            disabled
            className="w-full flex justify-between items-center p-3 border rounded-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <span>알림설정</span>
            <span className="text-xl text-gray-400">›</span>
          </button>
          <button
            onClick={() => router.push("/user/ptjob/mypage/change/user_type")}
            className="w-full flex justify-between items-center p-3 border rounded-xl"
          >
            <span>
              {user?.userType === "BUSINESS_OWNER"
                ? "알바님으로 변경"
                : "사업자로 변경"}
            </span>
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

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 mx-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">로그아웃</h3>
            <p className="text-gray-600 mb-6">정말 로그아웃하시겠습니까?</p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 bg-main text-white rounded-lg font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 mx-4 w-full">
            <h3 className="text-lg font-semibold mb-2">
              회원탈퇴 하시겠습니까?
            </h3>
            <h2 className="text-gray-600 mb-6">
              정말 회원 탈퇴하시겠습니까?
              <br />
              탈퇴 후에는 복구가 불가능합니다.
            </h2>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-main text-white rounded-lg font-medium"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
