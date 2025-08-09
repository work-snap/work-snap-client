"use client";

import React from "react";

interface RedirectButtonsProps {
  onRedirect: (path: string) => void;
}

export const RedirectButtons: React.FC<RedirectButtonsProps> = ({ onRedirect }) => {
  const redirectPages = [
    { path: "/attendance", label: "출석 관리", icon: "📊", color: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" },
    { path: "/admin", label: "관리자 대시보드", icon: "⚙️", color: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" },
    { path: "/user/ptjob/mainpage", label: "파트타임 메인", icon: "💼", color: "from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" },
    { path: "/develop-test", label: "개발 테스트", icon: "🔧", color: "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800" },
  ];

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-2xl p-6 shadow-xl shadow-green-500/10 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl"></div>

      <div className="relative">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">🌟</span>
          </div>
          <div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
              페이지 이동
            </h4>
            <p className="text-green-600/80 mt-1">
              로그인이 완료되었습니다. 원하는 페이지로 이동하세요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {redirectPages.map((page) => (
            <button
              key={page.path}
              onClick={() => onRedirect(page.path)}
              className={`group relative bg-gradient-to-r ${page.color} text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{page.icon}</span>
                <span>{page.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};