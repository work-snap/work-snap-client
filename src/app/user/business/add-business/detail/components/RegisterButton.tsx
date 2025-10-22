"use client";

import { useRouter } from "next/navigation";

export default function RegisterButton({
  workplaceId,
}: {
  workplaceId: number;
}) {
  const router = useRouter();

  return (
    <div className="w-full px-4 mt-4 mb-4">
      <button
        className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-lg"
        onClick={() => {
          router.push(
            `/user/business/add-business/detail/register-parttimer?idx=${workplaceId}`
          );
        }}
      >
        알바 인증코드 등록
      </button>
    </div>
  );
}
