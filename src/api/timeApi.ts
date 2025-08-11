/**
 * 시간 동기화 API 관련 함수들
 */

import { api } from "@/services/api";

// 서버 시간 응답 타입
export interface ServerTimeResponse {
  currentTime: string;
  timestamp: number;
  serverTimeZone: string;
  serverOffset: number;
}

// 시간 동기화 요청 타입
export interface TimeSyncRequest {
  clientTimestamp: number;
  clientTimeZone: string;
}

// 시간 동기화 응답 타입
export interface TimeSyncResponse {
  serverTime: string;
  serverTimestamp: number;
  clientServerDiff: number;
  networkDelay: number;
  accuracy: number;
  isAccurate: boolean;
}

// 시간 동기화 통계 타입
export interface TimeSyncStats {
  lastSyncTime: string;
  syncCount: number;
  averageDelay: number;
  maxDelay: number;
  minDelay: number;
  successRate: number;
}

/**
 * 현재 서버 시간 조회
 */
export const getCurrentServerTime = async (): Promise<ServerTimeResponse> => {
  try {
    const response = await api.get<ServerTimeResponse>("/api/v1/time/current");
    return response.data;
  } catch (error) {
    console.error("서버 시간 조회 실패:", error);
    
    // 실패 시 클라이언트 시간으로 폴백
    const now = new Date();
    return {
      currentTime: now.toISOString(),
      timestamp: now.getTime(),
      serverTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverOffset: now.getTimezoneOffset(),
    };
  }
};

/**
 * 시간 동기화 수행 (네트워크 지연 보정 포함)
 */
export const syncTimeWithServer = async (
  request: TimeSyncRequest
): Promise<TimeSyncResponse> => {
  const requestStartTime = Date.now();
  
  try {
    const response = await api.post<TimeSyncResponse>("/api/v1/time/sync", {
      ...request,
      requestStartTime,
    });
    
    const requestEndTime = Date.now();
    const networkDelay = Math.round((requestEndTime - requestStartTime) / 2);
    
    // 네트워크 지연을 고려한 정확한 동기화 데이터 반환
    return {
      ...response.data,
      networkDelay,
      accuracy: calculateSyncAccuracy(
        response.data.clientServerDiff,
        networkDelay
      ),
    };
  } catch (error) {
    console.error("시간 동기화 실패:", error);
    
    // 실패 시 기본 응답 반환
    const now = new Date();
    return {
      serverTime: now.toISOString(),
      serverTimestamp: now.getTime(),
      clientServerDiff: 0,
      networkDelay: 0,
      accuracy: 0,
      isAccurate: false,
    };
  }
};

/**
 * 시간 동기화 통계 조회
 */
export const getTimeSyncStats = async (): Promise<TimeSyncStats> => {
  try {
    const response = await api.get<TimeSyncStats>("/api/v1/time/sync/stats");
    return response.data;
  } catch (error) {
    console.error("시간 동기화 통계 조회 실패:", error);
    
    // 실패 시 기본 통계 반환
    return {
      lastSyncTime: new Date().toISOString(),
      syncCount: 0,
      averageDelay: 0,
      maxDelay: 0,
      minDelay: 0,
      successRate: 0,
    };
  }
};

/**
 * 다중 시간 동기화 (정확도 향상을 위해 여러 번 요청)
 */
export const multiSyncTimeWithServer = async (
  attempts: number = 3
): Promise<TimeSyncResponse> => {
  const results: TimeSyncResponse[] = [];
  
  for (let i = 0; i < attempts; i++) {
    const request: TimeSyncRequest = {
      clientTimestamp: Date.now(),
      clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    try {
      const result = await syncTimeWithServer(request);
      results.push(result);
    } catch (error) {
      console.warn(`시간 동기화 시도 ${i + 1} 실패:`, error);
    }
  }
  
  if (results.length === 0) {
    throw new Error("모든 시간 동기화 시도 실패");
  }
  
  // 가장 정확한 결과 선택 (네트워크 지연이 가장 적은 것)
  const bestResult = results.reduce((best, current) => {
    return current.networkDelay < best.networkDelay ? current : best;
  });
  
  return bestResult;
};

/**
 * 시간 동기화 정확도 계산
 */
const calculateSyncAccuracy = (
  clientServerDiff: number,
  networkDelay: number
): number => {
  // 절대 차이값 계산
  const absoluteDiff = Math.abs(clientServerDiff);
  
  // 네트워크 지연을 고려한 정확도 계산
  const adjustedDiff = absoluteDiff - networkDelay;
  
  // 1초 이내: 100점, 5초 이내: 80점, 10초 이내: 60점, 그 이상: 비례 감소
  if (adjustedDiff <= 1000) {
    return 100;
  } else if (adjustedDiff <= 5000) {
    return 80;
  } else if (adjustedDiff <= 10000) {
    return 60;
  } else {
    return Math.max(0, 60 - ((adjustedDiff - 10000) / 1000 * 5));
  }
};

/**
 * 시간 동기화 재시도 로직
 */
export const retryTimeSync = async (
  maxRetries: number = 3,
  delay: number = 1000
): Promise<TimeSyncResponse> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const request: TimeSyncRequest = {
        clientTimestamp: Date.now(),
        clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      const result = await syncTimeWithServer(request);
      
      if (result.isAccurate) {
        return result;
      }
      
      // 정확하지 않으면 다시 시도
      if (attempt < maxRetries) {
        console.warn(`시간 동기화 정확도 부족 (${result.accuracy}%), 재시도 중...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`시간 동기화 시도 ${attempt} 실패:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error(`${maxRetries}번 시도 후 시간 동기화 실패`);
};

/**
 * 시간 동기화 상태 확인
 */
export const checkTimeSyncStatus = async (): Promise<{
  isHealthy: boolean;
  lastSyncTime: string;
  timeDifference: number;
  message: string;
}> => {
  try {
    const serverTime = await getCurrentServerTime();
    const clientTime = new Date();
    const timeDifference = Math.abs(
      new Date(serverTime.currentTime).getTime() - clientTime.getTime()
    );
    
    const isHealthy = timeDifference <= 5000; // 5초 이내면 정상
    
    return {
      isHealthy,
      lastSyncTime: serverTime.currentTime,
      timeDifference,
      message: isHealthy 
        ? "시간 동기화 상태 정상" 
        : "시간 동기화 상태 불안정",
    };
  } catch (error) {
    console.error("시간 동기화 상태 확인 실패:", error);
    
    return {
      isHealthy: false,
      lastSyncTime: new Date().toISOString(),
      timeDifference: 0,
      message: "시간 동기화 상태 확인 불가",
    };
  }
};

/**
 * 자동 시간 동기화 매니저
 */
export class AutoTimeSyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private syncIntervalMs: number = 30000; // 30초
  private onSyncCallback?: (result: TimeSyncResponse) => void;
  private onErrorCallback?: (error: Error) => void;
  
  constructor(
    syncIntervalMs: number = 30000,
    onSyncCallback?: (result: TimeSyncResponse) => void,
    onErrorCallback?: (error: Error) => void
  ) {
    this.syncIntervalMs = syncIntervalMs;
    this.onSyncCallback = onSyncCallback;
    this.onErrorCallback = onErrorCallback;
  }
  
  start(): void {
    if (this.isRunning) {
      console.warn("자동 시간 동기화가 이미 실행 중입니다.");
      return;
    }
    
    this.isRunning = true;
    
    // 즉시 한 번 실행
    this.performSync();
    
    // 주기적 동기화 시작
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.syncIntervalMs);
    
    console.log(`자동 시간 동기화 시작 (간격: ${this.syncIntervalMs}ms)`);
  }
  
  stop(): void {
    if (!this.isRunning) {
      console.warn("자동 시간 동기화가 실행 중이 아닙니다.");
      return;
    }
    
    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    console.log("자동 시간 동기화 중지");
  }
  
  private async performSync(): Promise<void> {
    try {
      const request: TimeSyncRequest = {
        clientTimestamp: Date.now(),
        clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      const result = await syncTimeWithServer(request);
      
      if (this.onSyncCallback) {
        this.onSyncCallback(result);
      }
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error(String(error));
      
      if (this.onErrorCallback) {
        this.onErrorCallback(syncError);
      } else {
        console.error("자동 시간 동기화 실패:", syncError);
      }
    }
  }
  
  isActive(): boolean {
    return this.isRunning;
  }
  
  updateInterval(newIntervalMs: number): void {
    this.syncIntervalMs = newIntervalMs;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}