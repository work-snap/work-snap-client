"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ServerStatusProps {
  className?: string;
}

export default function ServerStatus({ className = "" }: ServerStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline" | "error">("checking");
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        setStatus("checking");
        setDetails("서버 연결 확인 중...");

        // 간단한 헬스체크 엔드포인트 호출
        const response = await api.get("/actuator/health", {
          timeout: 5000, // 5초 타임아웃
        });

        if (response.status === 200) {
          setStatus("online");
          setDetails("서버가 정상적으로 실행 중입니다");
        } else {
          setStatus("error");
          setDetails(`서버 응답: ${response.status}`);
        }
      } catch (error: any) {
        console.error("서버 상태 확인 실패:", error);
        
        if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
          setStatus("offline");
          setDetails("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
        } else if (error.response?.status === 404) {
          setStatus("error");
          setDetails("API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.");
        } else {
          setStatus("error");
          setDetails(`연결 오류: ${error.message}`);
        }
      }
    };

    // 개발 환경에서만 서버 상태 확인
    if (process.env.NODE_ENV === "development") {
      checkServerStatus();
    }
  }, []);

  // 프로덕션 환경에서는 아무것도 표시하지 않음
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-50 border-green-200";
      case "offline":
        return "text-red-600 bg-red-50 border-red-200";
      case "error":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return "🟢";
      case "offline":
        return "🔴";
      case "error":
        return "🟡";
      default:
        return "🔄";
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
        <div className="flex items-center space-x-2">
          <span>{getStatusIcon()}</span>
          <span>서버 상태</span>
        </div>
        <div className="text-xs mt-1 opacity-75">{details}</div>
      </div>
    </div>
  );
}
