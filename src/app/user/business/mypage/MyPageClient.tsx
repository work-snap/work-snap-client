// src/app/user/business/mypage/MyPageClient.tsx
"use client";

import { useDeleteUser } from "@/src/lib/queries/deleteUser";
import { useUser } from "@/src/lib/queries/useUser";
import { useUserStore } from "@/src/stores/userStore";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 마이페이지 클라이언트 컴포넌트
 * - 사용자 데이터 페칭 및 동적 UI 렌더링
 * - 로그아웃/회원탈퇴 기능
 */
export default function MyPageClient() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { clearUser } = useUserStore();
  const queryClient = useQueryClient();

  // 모달 상태 관리
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteUser(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false);
        queryClient.clear();
        clearUser();
        router.push("/");
      },
      onError: (error) => {
        alert("회원 탈퇴에 실패했습니다.");
        console.error(error);
      },
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    queryClient.clear();
    clearUser();
    router.push("/");
  };

  return (
    <div className="h-dvh mx-auto w-full bg-white max-w-[430px] flex flex-col">
      <div className="p-4 flex flex-col gap-6 flex-grow pt-[40px]">
        <h1 className="text-2xl font-bold">MY</h1>

        {/* 프로필 카드 - 데이터 로딩 중에는 애니메이션 */}
        <div
          className={`flex items-center gap-4 p-4 rounded-xl border transition-opacity duration-300 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-12 h-12 bg-gray2 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray2 rounded w-24" />
                <div className="h-4 bg-gray2 rounded w-32" />
                <div className="h-4 bg-gray2 rounded w-28" />
              </div>
            </>
          ) : (
            <>
              <Image
                src={user?.profileImageUrl || "/default-profile.jpg"}
                alt="profile"
                width={48}
                height={48}
                priority
                sizes="48px"
                className="rounded-full object-cover"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
              />
              <div className="flex-1">
                <p className="font-semibold">{user?.nickname || "사용자"}</p>
                <p className="text-sm text-gray-400">
                  {user?.email || "이메일 없음"}
                </p>
                {user?.phoneNumber && (
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-sm text-gray-400">{user.phoneNumber}</p>
                    {user.phoneNumber.startsWith("010-1234-") && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        임시번호
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 메뉴 버튼 */}
        <div className="space-y-2 pt-[20px]">
          <button className="w-full flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50 transition-colors">
            <span>사업자등록증 관리</span>
            <span className="text-xl text-gray-400">›</span>
          </button>
          <button
            disabled
            className="w-full flex justify-between items-center p-3 border rounded-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <span>알림설정</span>
            <span className="text-xl text-gray-400">›</span>
          </button>
          <button
            onClick={() =>
              router.push("/user/business/mypage/change/user_type")
            }
            className="w-full flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50 transition-colors"
          >
            {isLoading ? (
              <div className="h-5 bg-gray2 rounded w-32 animate-pulse" />
            ) : (
              <span>
                {user?.userType === "BUSINESS_OWNER"
                  ? "알바님으로 변경"
                  : "사업자로 변경"}
              </span>
            )}
            <span className="text-xl text-gray-400">›</span>
          </button>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="flex-1 border rounded-xl py-4 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
          <button
            className="flex-1 border rounded-xl py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            onClick={handleDelete}
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 mx-4 w-full max-w-sm animate-scaleIn">
            <h3 className="text-lg font-semibold mb-2">로그아웃</h3>
            <p className="text-gray-600 mb-6">정말 로그아웃하시겠습니까?</p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 bg-main text-white rounded-lg font-medium hover:bg-main/90 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 mx-4 w-full max-w-sm animate-scaleIn">
            <h3 className="text-lg font-semibold mb-2">회원탈퇴</h3>
            <p className="text-gray-600 mb-6">
              정말 회원 탈퇴하시겠습니까?
              <br />
              탈퇴 후에는 복구가 불가능합니다.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-main text-white rounded-lg font-medium hover:bg-main/90 transition-colors"
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
