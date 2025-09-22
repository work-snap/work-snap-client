"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "./components";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("overview");

  // 경로에 따라 activeTab 설정
  useEffect(() => {
    if (pathname === "/admin") {
      // URL 해시 확인
      const hash = window.location.hash.replace("#", "");
      setActiveTab(hash || "overview");
    }
  }, [pathname]);

  // 사이드바에서 탭 변경 핸들러
  const handleSidebarItemSelect = (itemId: string, path?: string) => {
    if (path?.includes("#")) {
      // 해시가 있는 경우 (같은 페이지 내 탭 이동)
      const [basePath, hash] = path.split("#");
      if (pathname === basePath) {
        // 같은 페이지에서 탭만 변경
        setActiveTab(hash);
        // 해시 업데이트
        window.history.replaceState(null, "", `${basePath}#${hash}`);

        // 부모 컴포넌트에 탭 변경 이벤트 전달
        const event = new CustomEvent("adminTabChange", { detail: hash });
        window.dispatchEvent(event);
      } else {
        // 다른 페이지로 이동
        router.push(path);
      }
    } else if (path) {
      // 일반 페이지 이동
      router.push(path);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* 사이드바 */}
      <AdminSidebar onItemSelect={handleSidebarItemSelect} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}