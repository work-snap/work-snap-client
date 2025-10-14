"use client";

import { useEffect, useState } from "react";
import { getFCMToken } from "@/services/firebaseConfig";
import { api } from "@/services/api";

/**
 * FCM 토큰 자동 등록 훅
 *
 * 로그인한 사용자의 FCM 토큰을 자동으로 서버에 등록합니다.
 */
export const useFcmToken = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerFcmToken = async () => {
      try {
        // 클라이언트 사이드에서만 실행
        if (typeof window === "undefined") return;

        // 알림 권한 확인
        if (!("Notification" in window)) {
          console.warn("이 브라우저는 알림을 지원하지 않습니다.");
          return;
        }

        // 권한이 없으면 요청하지 않음 (사용자가 직접 권한 허용 버튼 클릭해야 함)
        if (Notification.permission !== "granted") {
          console.log("알림 권한이 허용되지 않았습니다. 설정에서 권한을 허용해주세요.");
          return;
        }

        // FCM 토큰 가져오기
        const token = await getFCMToken();

        if (!token) {
          console.warn("FCM 토큰을 가져올 수 없습니다.");
          return;
        }

        setFcmToken(token);

        // 서버에 토큰 등록
        const response = await api.post("/notifications/fcm-token", {
          fcmToken: token,
        });

        if (response.data.success) {
          setIsRegistered(true);
          console.log("✅ FCM 토큰이 서버에 등록되었습니다:", token);
        } else {
          setError("FCM 토큰 등록 실패");
          console.error("FCM 토큰 등록 실패:", response.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "FCM 토큰 등록 중 오류 발생";
        setError(errorMessage);
        console.error("FCM 토큰 등록 중 오류:", err);
      }
    };

    registerFcmToken();
  }, []);

  return {
    fcmToken,
    isRegistered,
    error,
  };
};
