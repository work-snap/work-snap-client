"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * 카카오 로그인 버튼 컴포넌트
 * - 클라이언트 상호작용 필요 (onClick 핸들러)
 */
export default function KakaoLoginButton() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    router.push("/kakao-login");
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-[90%] max-w-[340px] cursor-pointer"
      aria-label="카카오 로그인"
    >
      <Image
        src="/kakao_login_large_wide.png"
        alt="카카오 로그인"
        width={340}
        height={48}
        className="w-full h-auto"
        priority
      />
    </button>
  );
}
