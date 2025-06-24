import React from "react";
import { TabType, TabInfo } from "../lib/types";
import { AuthTab } from "./tabs/AuthTab";
import { UserTab } from "./tabs/UserTab";
import { BusinessTab } from "./tabs/BusinessTab";
import { WorkplaceTab } from "./tabs/WorkplaceTab";
import { WorkScheduleTab } from "./tabs/WorkScheduleTab";
import { TestResultDisplay } from "./TestResultDisplay";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: TabInfo[] = [
  {
    id: "auth",
    name: "인증",
    description: "인증 및 토큰 관리",
    icon: "🔐",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "user",
    name: "사용자",
    description: "사용자 정보 관리",
    icon: "👤",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "business",
    name: "사업자",
    description: "사업자 등록 및 관리",
    icon: "🏢",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "workplace",
    name: "사업장",
    description: "사업장 등록 및 관리",
    icon: "🏪",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "schedule",
    name: "근무 스케줄",
    description: "아르바이트 근무 관리",
    icon: "📅",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "parttime",
    name: "아르바이트",
    description: "초대코드 관리 및 정보 조회",
    icon: "💼",
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: "attendance",
    name: "출근 관리",
    description: "출근/퇴근 및 근무 기록 관리",
    icon: "🕐",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "attendance-card",
    name: "출근 카드",
    description: "모바일 출근 카드 UI",
    icon: "📱",
    color: "from-orange-500 to-red-500",
  },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="relative">
      {/* 탭 버튼 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? "backdrop-blur-xl bg-white/90 shadow-2xl shadow-blue-500/25 border border-white/50"
                  : "backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/30 hover:shadow-lg"
              }`}
            >
              {/* 활성 탭 배경 그라데이션 */}
              {isActive && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-10 rounded-2xl`}
                ></div>
              )}

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

              <div className="relative z-10 text-center">
                {/* 아이콘 */}
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${tab.color} shadow-lg text-white`
                      : "bg-white/70 text-gray-600 group-hover:bg-white/90"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                </div>

                {/* 제목 */}
                <div
                  className={`font-bold text-sm mb-1 transition-colors duration-300 ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {tab.name}
                </div>

                {/* 설명 */}
                <div
                  className={`text-xs leading-relaxed transition-colors duration-300 ${
                    isActive
                      ? "text-gray-600"
                      : "text-gray-500 group-hover:text-gray-600"
                  }`}
                >
                  {tab.description}
                </div>
              </div>

              {/* 활성 탭 인디케이터 */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div
                    className={`w-3 h-3 bg-gradient-to-br ${tab.color} rounded-full shadow-lg`}
                  ></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 하단 장식 라인 */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
};
