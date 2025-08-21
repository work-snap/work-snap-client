"use client";

import { Toaster } from "@/components/ui/toaster";
import Header from "../components/Header";
import Navigation from "../components/navigation";
import { usePathname } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Header를 숨길 경로 배열
  const hideHeaderPaths = ["/user/ptjob/mypage", "/user/business/mypage"];

  // 현재 경로가 배열에 포함되면 Header 숨기기
  const showHeader = !hideHeaderPaths.includes(pathname);

  return (
    <div className="h-dvh flex flex-col justify-between max-w-[430px] min-h-0 mx-auto">
      {showHeader && <Header />}
      {children}
      <Toaster />
      <Navigation />
    </div>
  );
}
