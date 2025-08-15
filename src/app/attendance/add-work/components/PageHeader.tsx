"use client";

import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  backHref?: string;
}

export default function PageHeader({
  title,
  backHref = "/attendance",
}: PageHeaderProps) {
  const router = useRouter();
  return (
    <div className="sticky top-0 left-0 right-0 bg-white z-10 max-w-[430px] w-full mx-auto">
      <div className="flex items-center px-4 pt-5 pb-3">
        <button
          onClick={() => router.push(backHref)}
          className="mr-2 flex items-center"
          aria-label="뒤로가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      </div>
    </div>
  );
}
