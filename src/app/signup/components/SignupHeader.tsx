"use client";

import { IoArrowBack } from "react-icons/io5";

interface SignupHeaderProps {
  onBack: () => void;
  onLogout: () => void;
}

/**
 * 회원가입 헤더 컴포넌트
 * - 뒤로가기 버튼과 로그아웃 버튼 포함
 */
export default function SignupHeader({ onBack, onLogout }: SignupHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2" aria-label="뒤로가기">
          <IoArrowBack size={24} />
        </button>
      </div>
      <button
        onClick={onLogout}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
