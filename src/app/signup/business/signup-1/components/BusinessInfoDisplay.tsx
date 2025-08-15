"use client";

import { useRouter } from "next/navigation";
import { ResisterBusinessResponse } from "@/src/lib/auth/types";

interface BusinessInfoDisplayProps {
  businessInfo: ResisterBusinessResponse;
}

export default function BusinessInfoDisplay({ businessInfo }: BusinessInfoDisplayProps) {
  const router = useRouter();

  return (
    <div className="w-full pb-24">
      <h2 className="font-medium mb-3 text-lg">사업자등록증 확인</h2>
      <div className="mt-4 space-y-2">
        <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
          상호 : {businessInfo.businessName || "-"}
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
          사업자 번호 : {businessInfo.businessRegistrationNumber || "-"}
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
          성명 : {businessInfo.ownerName || "-"}
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
          사업장소재지 : {businessInfo.businessAddress || "-"}
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 text-main2 text-base font-medium">
          업태 : {businessInfo.businessType || "-"}
        </div>
      </div>
      
      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white max-w-[430px] mx-auto">
        <button
          onClick={() => router.push("/signup/business/success-signup")}
          className="w-full py-5 rounded-lg bg-main text-white"
        >
          가입 완료
        </button>
      </div>
    </div>
  );
}
