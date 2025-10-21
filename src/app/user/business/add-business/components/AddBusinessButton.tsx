"use client";

import { useRouter } from "next/navigation";

export default function AddBusinessButton() {
  const router = useRouter();

  return (
    <div className="w-full px-4 py-4 bg-white">
      <button
        onClick={() => router.push("/user/business/add-business/add")}
        className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-base"
      >
        <span className="font-semibold text-lg">사업장 등록</span>
      </button>
    </div>
  );
}
