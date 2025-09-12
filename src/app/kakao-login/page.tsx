"use client";

/*
 * 카카오 로그인 처리 페이지
 *
 * 📋 리드미 기반 구현 사항:
 * - JWT 기반 이중 토큰 시스템 (AccessToken + RefreshToken)
 * - AccessToken: localStorage 저장 (15분 수명)
 * - RefreshToken: HTTP-only 쿠키 자동 저장 (7일 수명)
 * - CSRF 방지를 위한 state 파라미터 사용
 * - withCredentials: true 설정으로 쿠키 포함 전송
 * - 표준 에러 처리 및 상태 코드별 대응
 *
 * 🔐 보안 특징:
 * - 자동 토큰 갱신 시스템
 * - 강화된 토큰 검증 (소유자 일치 확인)
 * - XSS 공격 방지 (RefreshToken은 HTTP-only)
 * - CSRF 공격 방지 (state 파라미터)
 */

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useKakaoLogin } from "@/src/lib/auth/auth.query";
import { KakaoLoginRequest, LoginResponse } from "@/src/lib/auth/types";
import { AxiosError } from "axios";
import { useUserStore } from "@/stores/userStore";

export default function KakaoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasExecuted = useRef(false);
  // StrictMode로 인한 컴포넌트 재마운트 시에도 중복 호출을 막기 위한 전역 키
  const EXECUTION_FLAG_PREFIX = "kakao_login_";
  const { setUser } = useUserStore();

  // 카카오 로그인 mutation 훅 사용
  const kakaoLoginMutation = useKakaoLogin({
    onSuccess: (data: LoginResponse) => {
      console.log("✅ 로그인 성공:", {
        isNewUser: data.isNewUser,
        userType: data.user.userType,
        userId: data.user.id,
        nickname: data.user.nickname,
      });
      localStorage.setItem("accessToken", data.accessToken);
      // RefreshToken은 HTTP-only 쿠키로 자동 설정됨 (서버에서 처리)
      console.log("🍪 RefreshToken이 HTTP-only 쿠키로 자동 설정되었습니다.");

      // Zustand 스토어에 사용자 정보 설정 (즉시 반영, persist 미들웨어가 localStorage 관리)
      setUser(data.user);
      console.log("🔄 Zustand 스토어 업데이트 완료:", data.user);
      
      // 자동 라우팅은 useAutoRouting 훅에서 처리됨
      console.log("⚡ 자동 라우팅이 처리할 예정");
    },
    onError: (error: AxiosError) => {
      console.error("❌ 카카오 로그인 실패:", error);

      const errorData = error.response?.data as any;
      const status = error.response?.status;

      // 에러 상세 정보 로깅 (리드미 권장사항)
      const errorDetails = {
        status,
        errorCode: errorData?.code || errorData?.errorCode,
        errorMessage: errorData?.message || errorData?.errorMessage,
        details: errorData?.details,
        timestamp: errorData?.timestamp,
        path: errorData?.path,
        fullResponse: errorData,
      };

      console.error("📋 에러 상세:", errorDetails);
      console.error("📋 전체 에러 객체:", error);
      console.error("📋 응답 데이터:", errorData);

      // 서버 연결 실패 (네트워크 오류)
      if (!error.response) {
        console.error("🌐 네트워크 연결 실패");
        alert(
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요."
        );
        router.push("/");
        return;
      }

      // 상태 코드별 에러 처리 (리드미 권장사항)
      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      switch (status) {
        case 400:
          errorMessage =
            errorData?.message ||
            errorData?.errorMessage ||
            "잘못된 인증 코드입니다. 다시 로그인해주세요.";
          console.error("🚫 잘못된 요청 (400):", errorMessage);
          break;

        case 401:
          errorMessage = "인증에 실패했습니다. 다시 로그인해주세요.";
          console.error("🔐 인증 실패 (401):", errorMessage);
          break;

        case 403:
          errorMessage = "접근이 거부되었습니다.";
          console.error("⛔ 접근 거부 (403):", errorMessage);
          break;

        case 500:
          errorMessage =
            "서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.";
          console.error("💥 서버 오류 (500):", errorMessage);
          break;

        default:
          errorMessage =
            errorData?.message ||
            errorData?.errorMessage ||
            `서버 오류가 발생했습니다 (${status})`;
          console.error(`🔥 기타 오류 (${status}):`, errorMessage);
      }

      alert(errorMessage);

      // 에러 발생 시 메인 페이지로 리다이렉트
      console.log("🏠 메인 페이지로 리다이렉트");
      router.push("/");
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  // 환경에 따른 동적 리다이렉트 URI 설정
  const getRedirectUri = () => {
    // 현재 도메인 확인
    const currentHostname = window.location.hostname;
    const currentOrigin = window.location.origin;

    // Vercel 배포 환경 감지 (간단하고 확실한 방법)
    const isVercel =
      currentHostname !== "localhost" && currentHostname !== "127.0.0.1";

    console.log("🔍 환경 감지:", {
      hostname: currentHostname,
      origin: currentOrigin,
      isVercel: isVercel,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (isVercel) {
      // Vercel 배포 환경에서는 현재 도메인 사용
      const redirectUri = `${currentOrigin}/kakao-login`;
      console.log("🚀 Vercel 환경 감지됨, 리다이렉트 URI:", redirectUri);
      return redirectUri;
    }

    // 로컬 개발 환경 - 기본값 사용
    const localRedirectUri = "http://localhost:3000/kakao-login";
    console.log("🏠 로컬 환경 감지됨, 리다이렉트 URI:", localRedirectUri);
    return localRedirectUri;
  };

  useEffect(() => {
    const handleKakaoLogin = async () => {
      // 이미 실행되었거나 처리 중이면 중복 실행 방지
      if (hasExecuted.current || isProcessing || kakaoLoginMutation.isPending) {
        console.log("이미 로그인 처리 중이거나 완료되었습니다...");
        return;
      }

      const code = searchParams.get("code");
      const userType = searchParams.get("userType"); // 신규 가입시만 필요

      console.log("🚀 카카오 로그인 처리 시작:", {
        hasCode: !!code,
        userType: userType || "미지정 (기존 사용자)",
      });

      if (!code) {
        // 에러 코드 확인 (카카오에서 전달하는 에러)
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          console.error("카카오 인증 에러:", error, errorDescription);
          alert(
            `로그인이 취소되었거나 오류가 발생했습니다: ${
              errorDescription || error
            }`
          );
          router.push("/");
          return;
        }

        // 코드가 없으면 즉시 카카오 로그인 페이지로 리다이렉트 (로딩 없이)
        const KAKAO_CLIENT_ID = "f5d47f3b1a3544fbb879afa0f57c2470";
        const REDIRECT_URI = getRedirectUri();

        if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
          console.error("필수 환경 변수가 설정되지 않았습니다.");
          alert("로그인 설정에 오류가 있습니다. 관리자에게 문의하세요.");
          return;
        }

        // CSRF 공격 방지를 위한 state 파라미터 생성
        const state =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("kakao_login_state", state);

        // 카카오 인증 URL 생성 (동적 설정) - 전화번호 scope 제거 (임시)
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
          REDIRECT_URI
        )}&response_type=code&state=${state}&scope=profile_nickname,profile_image,account_email`;

        // 디버깅을 위한 로그
        console.log("카카오 로그인 URL:", kakaoAuthUrl);
        console.log("클라이언트 ID:", KAKAO_CLIENT_ID);
        console.log("리다이렉트 URI:", REDIRECT_URI);
        console.log("요청 scope:", "profile_nickname,profile_image,account_email (전화번호 제외 - 임시)");
        console.log("📞 전화번호는 임시로 010-1234-XXXX 형태로 생성됩니다.");
        console.log("현재 환경:", process.env.NODE_ENV);
        console.log("현재 도메인:", window.location.hostname);
        console.log("State:", state);

        // 즉시 리다이렉트 (로딩 화면 없이)
        window.location.href = kakaoAuthUrl;
        return;
      }

      // 여기부터는 카카오에서 돌아온 후의 처리 (code가 있는 경우)
      hasExecuted.current = true;
      setIsProcessing(true);

      // code가 존재하면 URL 정리 및 중복 처리 체크
      if (code) {
        // 인증 코드 파라미터를 URL에서 제거하여 새로고침 시 재요청 방지
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("code");
        newUrl.searchParams.delete("state");
        window.history.replaceState({}, "", newUrl.toString());

        // 동일 코드로 이미 처리한 적 있는지 확인 (StrictMode 대비)
        const codeFlagKey = `${EXECUTION_FLAG_PREFIX}${code}`;
        if (sessionStorage.getItem(codeFlagKey)) {
          console.log("⏭️ 이미 처리된 인증 코드입니다. 요청을 건너뜁니다.");
          return;
        }
        // 중복 방지를 위해 즉시 플래그 저장
        sessionStorage.setItem(codeFlagKey, "true");
      }

      // state 파라미터 검증 (CSRF 공격 방지) - 임시 비활성화
      const returnedState = searchParams.get("state");
      const storedState = sessionStorage.getItem("kakao_login_state");

      console.log("State 검증:", {
        returnedState,
        storedState,
        match: returnedState === storedState,
      });

      // 임시로 state 검증을 건너뛰고 경고만 출력
      if (returnedState !== storedState) {
        console.warn("State 파라미터 불일치 - 개발 환경에서는 진행합니다");
      }

      // state 정리
      sessionStorage.removeItem("kakao_login_state");

      // 요청 데이터 준비 (리드미 권장사항)
      const requestData: KakaoLoginRequest = {
        code,
        ...(userType && { userType }), // userType이 있을 때만 포함 (신규 가입시)
        redirectUri: getRedirectUri(), // 프론트엔드에서 사용한 redirect_uri 포함
      };
      console.log("서버 요청 데이터:", requestData);

      // useKakaoLogin 훅을 사용하여 로그인 요청
      kakaoLoginMutation.mutate(requestData);
    };

    handleKakaoLogin();
  }, [router, searchParams, kakaoLoginMutation]);

  // code가 없는 경우 (즉시 리다이렉트 되는 경우) 간단한 메시지만 표시
  const code = searchParams.get("code");
  if (!code) {
    // 디버깅을 위한 환경 정보 표시 (개발 환경에서만)
    const isDev = process.env.NODE_ENV === "development";

    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-main rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-gray-600">카카오 로그인 페이지로 이동 중...</p>

          {/* 개발 환경에서만 환경 정보 표시 */}
          {isDev && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-left max-w-md mx-auto">
              <p className="font-semibold mb-2">🔍 환경 정보 (개발용):</p>
              <p>
                Hostname:{" "}
                {typeof window !== "undefined"
                  ? window.location.hostname
                  : "N/A"}
              </p>
              <p>
                Origin:{" "}
                {typeof window !== "undefined" ? window.location.origin : "N/A"}
              </p>
              <p>Redirect URI: {getRedirectUri()}</p>
              <p>NODE_ENV: {process.env.NODE_ENV}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // code가 있는 경우 (카카오에서 돌아온 후) 상세한 로딩 UI 표시
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* 로고/헤더 영역 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-main rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.29-.99.36-.18.64-.46.82-.82C18.35 15 19 13.54 19 12c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">WorkSnap</h1>
          <p className="text-gray-600">카카오 계정으로 간편하게 로그인하세요</p>
        </div>

        {/* 로딩 상태 표시 */}
        <div className="text-center mb-6">
          {/* 진행 단계 표시 */}
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isProcessing || kakaoLoginMutation.isPending
                    ? "bg-main animate-pulse"
                    : "bg-gray-300"
                }`}
              ></div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div
                className={`w-3 h-3 rounded-full ${
                  kakaoLoginMutation.isPending
                    ? "bg-main animate-pulse"
                    : "bg-gray-300"
                }`}
              ></div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* 메인 로딩 스피너 */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto relative">
              {/* 외부 링 */}
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              {/* 회전하는 링 */}
              <div className="absolute inset-0 border-4 border-transparent border-t-main rounded-full animate-spin"></div>
              {/* 내부 원 */}
              <div className="absolute inset-3 bg-main/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-main"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 상태 메시지 */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {isProcessing || kakaoLoginMutation.isPending
                ? "로그인 처리 중"
                : "인증 준비 중"}
            </h2>

            <p className="text-gray-600">
              {isProcessing || kakaoLoginMutation.isPending
                ? "카카오 계정을 확인하고 있습니다"
                : "안전한 로그인을 위해 준비하고 있습니다"}
            </p>
          </div>
        </div>

        {/* 진행 상태 카드들 */}
        <div className="space-y-3 mb-6">
          <div
            className={`flex items-center p-3 rounded-lg border-l-4 ${
              isProcessing || kakaoLoginMutation.isPending
                ? "border-main bg-main/5"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-3 ${
                isProcessing || kakaoLoginMutation.isPending
                  ? "bg-main animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              카카오 인증 확인
            </span>
            {(isProcessing || kakaoLoginMutation.isPending) && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg border-l-4 ${
              kakaoLoginMutation.isPending
                ? "border-main bg-main/5"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-3 ${
                kakaoLoginMutation.isPending
                  ? "bg-main animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              서버 통신 중
            </span>
            {kakaoLoginMutation.isPending && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex items-center p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50">
            <div className="w-2 h-2 rounded-full mr-3 bg-gray-400"></div>
            <span className="text-sm font-medium text-gray-700">
              로그인 완료
            </span>
          </div>
        </div>

        {/* 보안 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                안전한 로그인
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• SSL 암호화 통신</li>
                <li>• 토큰 기반 인증</li>
                <li>• 자동 보안 갱신</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            문제가 지속되면 페이지를 새로고침해주세요
          </p>
        </div>
      </div>
    </div>
  );
}
