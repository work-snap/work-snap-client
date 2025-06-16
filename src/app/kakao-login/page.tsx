"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function KakaoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleKakaoLogin = async () => {
      const code = searchParams.get("code");
      const userType = searchParams.get("userType") || "PART_TIME_WORKER";

      if (!code) {
        // 코드가 없으면 카카오 로그인 페이지로 리다이렉트
        const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
        const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;

        if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
          console.error("필수 환경 변수가 설정되지 않았습니다.");
          return;
        }

        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
          REDIRECT_URI
        )}&response_type=code`;

        // 디버깅을 위한 로그
        console.log("카카오 로그인 URL:", kakaoAuthUrl);
        console.log("클라이언트 ID:", KAKAO_CLIENT_ID);
        console.log("리다이렉트 URI:", REDIRECT_URI);

        window.location.href = kakaoAuthUrl;
        return;
      }

      try {
        // 인증 코드로 서버에 로그인 요청
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        // 요청 데이터 로깅
        const requestData = {
          code,
          userType,
        };
        console.log("서버 요청 데이터:", requestData);

        // 서버 요청 설정
        const config = {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // 10초 타임아웃
        };

        console.log("서버 요청 설정:", {
          url: `${API_URL}/api/auth/kakao/login`,
          method: "POST",
          headers: config.headers,
        });

        const response = await axios.post(
          `${API_URL}/api/auth/kakao/login`,
          requestData,
          config
        );

        console.log("서버 응답:", response.data);

        if (response.data && response.data.accessToken) {
          const { accessToken, user, isNewUser } = response.data;

          // 토큰과 사용자 정보 저장
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

          // 이후 모든 요청에 Authorization 헤더 설정
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          // 신규 사용자는 회원가입 페이지로, 기존 사용자는 메인 페이지로 리다이렉트
          if (isNewUser) {
            router.push("/signup");
          } else {
            router.push("/");
          }
        } else {
          throw new Error("서버 응답에 accessToken이 없습니다.");
        }
      } catch (error) {
        console.error("카카오 로그인 실패:", error);

        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data;
          const errorDetails = {
            message: error.message,
            response: errorData,
            status: error.response?.status,
            headers: error.response?.headers,
            errorCode: errorData?.errorCode,
            errorMessage: errorData?.errorMessage,
            timestamp: errorData?.timestamp,
            path: errorData?.path,
            request: {
              url: error.config?.url,
              method: error.config?.method,
              data: error.config?.data,
              headers: error.config?.headers,
            },
          };

          console.error("에러 상세:", errorDetails);

          // 서버 연결 실패
          if (!error.response) {
            alert(
              "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
            );
            return;
          }

          // 서버 에러 메시지 표시
          let errorMessage =
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

          if (errorData?.errorMessage) {
            errorMessage = errorData.errorMessage;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (error.response?.status === 500) {
            errorMessage =
              "서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.";
          }

          alert(errorMessage);
        } else {
          alert("로그인 중 오류가 발생했습니다.");
        }

        // 에러 발생 시 메인 페이지로 리다이렉트
        router.push("/");
      }
    };

    handleKakaoLogin();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">카카오 로그인 처리 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div> */}
    </div>
  );
}
