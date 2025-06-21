import React from "react";
import { TabType, TabInfo } from "../lib/types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: TabInfo[] = [
  {
    id: "auth",
    name: "🔑 인증",
    description: "로그인, 토큰 관리",
  },
  {
    id: "user",
    name: "👤 사용자",
    description: "사용자 정보 관리",
  },
  {
    id: "business",
    name: "🏢 사업자",
    description: "사업자 전용 기능",
  },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <div>{tab.name}</div>
              <div className="text-xs text-gray-400">{tab.description}</div>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};
