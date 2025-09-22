"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  Button,
  Divider,
} from "@heroui/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  FileText,
  TrendingUp,
  Brain,
  Globe,
  ChevronRight,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  badge?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  // 메인 대시보드
  {
    id: "dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
    path: "/admin",
  },

  // 사용자 관리
  {
    id: "users",
    label: "사용자 관리",
    icon: Users,
    path: "/admin/users",
    badge: "New",
  },
];

interface AdminSidebarProps {
  onItemSelect?: (itemId: string, path?: string) => void;
}

export default function AdminSidebar({ onItemSelect }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleItemClick = (item: SidebarItem) => {
    if (item.path) {
      if (item.path.includes("#")) {
        // 해시가 있는 경우 (같은 페이지 내 탭 이동)
        const [basePath, hash] = item.path.split("#");
        if (pathname === basePath) {
          // 같은 페이지에서 탭만 변경
          onItemSelect?.(hash, item.path);
        } else {
          // 다른 페이지로 이동
          router.push(item.path);
        }
      } else {
        // 일반 페이지 이동
        router.push(item.path);
      }
    }
    onItemSelect?.(item.id, item.path);
  };

  const isActive = (item: SidebarItem): boolean => {
    if (!item.path) return false;

    if (item.path.includes("#")) {
      const [basePath] = item.path.split("#");
      return pathname === basePath;
    }

    return pathname === item.path;
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <div key={item.id} className="mb-1">
        <Button
          onClick={() => handleItemClick(item)}
          variant="light"
          className={`
            w-full justify-start h-12 px-3
            ${active
              ? "bg-primary-50 text-primary-700 font-semibold border-r-3 border-primary-500"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }
            transition-all duration-200
          `}
          startContent={
            <div className={`p-2 rounded-lg ${active ? "bg-primary-100" : "bg-gray-100"}`}>
              <Icon className={`w-5 h-5 ${active ? "text-primary-600" : "text-gray-600"}`} />
            </div>
          }
          endContent={
            item.badge && (
              <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full font-medium">
                {item.badge}
              </span>
            )
          }
        >
          <span className="flex-1 text-left ml-2">{item.label}</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">관리자 패널</h2>
            <p className="text-sm text-gray-600">WorkSnap Admin</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* 메인 메뉴 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 px-3">
            메인 메뉴
          </h3>
          <nav className="space-y-2">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </nav>
        </div>

        <Divider className="my-6" />

        {/* 상태 카드 */}
        <div className="space-y-3">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <h4 className="font-medium text-gray-900 mb-1 text-sm">시스템 정상</h4>
              <p className="text-xs text-gray-600">모든 서비스 운영 중</p>
            </div>
          </Card>

          {/* 도움말 카드 */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1 text-sm">관리 기능</h4>
              <p className="text-xs text-gray-600 mb-3">대시보드 내 탭에서 <br />상세 관리 가능</p>
            </div>
          </Card>
        </div>
      </div>

      {/* 푸터 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center text-xs text-gray-500">
          <p>WorkSnap Admin v1.0</p>
          <p className="mt-1">© 2024 WorkSnap</p>
        </div>
      </div>
    </div>
  );
}