"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export default function BackButton({ 
  className = "mr-10 flex items-center",
  iconClassName = "w-6 h-6",
  onClick
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      aria-label="뒤로가기"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={iconClassName}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );
}
