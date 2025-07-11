"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api";

export default function TestLogin() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post(
        `/api/auth/dev-token/nickname/${nickname}`
      );
      const { accessToken, refreshToken, user } = response.data;

      // 토큰 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // 리프레시 토큰은 서버에서 HTTP-only 쿠키로 설정됨
      console.log("개발자 로그인 성공:", user);

      // /attendance 페이지로 리다이렉트
      router.push("/attendance");
    } catch (error: any) {
      console.error("로그인 실패:", error);

      if (error.response?.status === 404) {
        setError("해당 닉네임을 가진 사용자를 찾을 수 없습니다.");
      } else if (error.response?.status === 500) {
        setError("프로덕션 환경에서는 개발자 토큰을 사용할 수 없습니다.");
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            개발자 테스트 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            개발 환경에서만 사용 가능한 테스트 로그인입니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="사용자 닉네임을 입력하세요"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            ⚠️ 개발 환경 전용 기능입니다. 프로덕션에서는 사용할 수 없습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
