"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ServerTimeResponse {
  currentTime: string;
  serverTimestamp: number;
}

interface UseCurrentTimeOptions {
  syncInterval?: number; // 서버 시간 동기화 간격 (밀리초)
  updateInterval?: number; // 시간 업데이트 간격 (밀리초)
  enableServerSync?: boolean; // 서버 시간 동기화 사용 여부
}

interface UseCurrentTimeReturn {
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  isServerSynced: boolean;
  lastSyncTime: Date | null;
  syncWithServer: () => Promise<void>;
  timeDifference: number; // 서버와 클라이언트 시간 차이 (밀리초)
}

const DEFAULT_OPTIONS: UseCurrentTimeOptions = {
  syncInterval: 30000, // 30초마다 서버 시간 동기화
  updateInterval: 1000, // 1초마다 시간 업데이트
  enableServerSync: true,
};

// 서버 시간 API 호출
const fetchServerTime = async (): Promise<ServerTimeResponse> => {
  try {
    const response = await fetch("/api/v1/time/current", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      currentTime: data.data.currentTime,
      serverTimestamp: data.data.timestamp,
    };
  } catch (error) {
    console.warn("서버 시간 동기화 실패:", error);
    // 서버 시간 가져오기 실패 시 현재 시간 반환
    const now = new Date();
    return {
      currentTime: now.toISOString(),
      serverTimestamp: now.getTime(),
    };
  }
};

// 시간 포맷팅 함수
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

// 네트워크 지연을 고려한 정확한 시간 계산
const calculateNetworkDelay = (requestTime: number, responseTime: number): number => {
  return Math.round((responseTime - requestTime) / 2);
};

export const useCurrentTime = (options: UseCurrentTimeOptions = {}): UseCurrentTimeReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isServerSynced, setIsServerSynced] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [timeDifference, setTimeDifference] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // 서버 시간 동기화 함수
  const syncWithServer = useCallback(async (): Promise<void> => {
    if (!config.enableServerSync) return;

    try {
      const requestTime = Date.now();
      const serverResponse = await fetchServerTime();
      const responseTime = Date.now();
      
      if (!isMountedRef.current) return;

      // 네트워크 지연 계산
      const networkDelay = calculateNetworkDelay(requestTime, responseTime);
      
      // 서버 시간 파싱
      const serverTime = new Date(serverResponse.currentTime);
      const adjustedServerTime = new Date(serverTime.getTime() + networkDelay);
      
      // 클라이언트와 서버 시간 차이 계산
      const clientTime = new Date();
      const timeDiff = adjustedServerTime.getTime() - clientTime.getTime();
      
      setTimeDifference(timeDiff);
      setIsServerSynced(true);
      setLastSyncTime(new Date());
      
      console.log("서버 시간 동기화 성공:", {
        serverTime: adjustedServerTime.toISOString(),
        clientTime: clientTime.toISOString(),
        timeDifference: timeDiff,
        networkDelay,
      });
    } catch (error) {
      console.error("서버 시간 동기화 실패:", error);
      setIsServerSynced(false);
    }
  }, [config.enableServerSync]);

  // 시간 업데이트 함수
  const updateCurrentTime = useCallback(() => {
    if (!isMountedRef.current) return;
    
    const now = new Date();
    
    // 서버 시간 동기화가 되어 있으면 차이를 적용
    if (isServerSynced && config.enableServerSync) {
      const syncedTime = new Date(now.getTime() + timeDifference);
      setCurrentTime(syncedTime);
    } else {
      setCurrentTime(now);
    }
  }, [isServerSynced, timeDifference, config.enableServerSync]);

  // 초기 서버 시간 동기화
  useEffect(() => {
    if (config.enableServerSync) {
      syncWithServer();
    }
  }, [syncWithServer, config.enableServerSync]);

  // 주기적 시간 업데이트
  useEffect(() => {
    updateCurrentTime(); // 즉시 업데이트
    
    timerRef.current = setInterval(updateCurrentTime, config.updateInterval);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [updateCurrentTime, config.updateInterval]);

  // 주기적 서버 시간 동기화
  useEffect(() => {
    if (!config.enableServerSync) return;

    syncTimerRef.current = setInterval(syncWithServer, config.syncInterval);
    
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [syncWithServer, config.syncInterval, config.enableServerSync]);

  // 페이지 visibility 변경 시 즉시 동기화
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && config.enableServerSync) {
        syncWithServer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncWithServer, config.enableServerSync]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, []);

  return {
    currentTime,
    formattedTime: formatTime(currentTime),
    formattedDate: formatDate(currentTime),
    isServerSynced,
    lastSyncTime,
    syncWithServer,
    timeDifference,
  };
};

// 기본 시간 훅 (기존 TimeProvider와 호환)
export const useTime = () => {
  const { currentTime, formattedTime } = useCurrentTime();
  
  return {
    currentTime,
    formattedTime,
  };
};

// 다양한 시간 포맷을 제공하는 훅
export const useFormattedTime = () => {
  const { currentTime } = useCurrentTime();
  
  return {
    currentTime,
    time24Hour: formatTime(currentTime),
    time12Hour: currentTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    date: formatDate(currentTime),
    dateTime: currentTime.toLocaleString("ko-KR"),
    iso: currentTime.toISOString(),
    timestamp: currentTime.getTime(),
  };
};

// 특정 시간대 시간을 제공하는 훅
export const useTimeZone = (timeZone: string = "Asia/Seoul") => {
  const { currentTime } = useCurrentTime();
  
  const timeZoneTime = new Date(currentTime.toLocaleString("en-US", { timeZone }));
  
  return {
    currentTime: timeZoneTime,
    formattedTime: timeZoneTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    formattedDate: timeZoneTime.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    }),
    timeZone,
  };
};