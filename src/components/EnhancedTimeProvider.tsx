"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { AutoTimeSyncManager, TimeSyncResponse } from "@/api/timeApi";

// 컨텍스트 타입 정의
interface EnhancedTimeContextType {
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  isServerSynced: boolean;
  lastSyncTime: Date | null;
  timeDifference: number;
  syncAccuracy: number;
  syncWithServer: () => Promise<void>;
  toggleAutoSync: () => void;
  isAutoSyncEnabled: boolean;
  syncStatus: "idle" | "syncing" | "success" | "error";
  syncError: string | null;
}

// 시간 제공자 props
interface EnhancedTimeProviderProps {
  children: React.ReactNode;
  enableAutoSync?: boolean;
  syncInterval?: number;
  enableServerSync?: boolean;
  showSyncStatus?: boolean;
}

// 컨텍스트 생성
const EnhancedTimeContext = createContext<EnhancedTimeContextType | undefined>(undefined);

// 향상된 시간 제공자 컴포넌트
export const EnhancedTimeProvider: React.FC<EnhancedTimeProviderProps> = ({
  children,
  enableAutoSync = true,
  syncInterval = 30000,
  enableServerSync = true,
  showSyncStatus = false,
}) => {
  // 기본 시간 훅 사용
  const {
    currentTime,
    formattedTime,
    formattedDate,
    isServerSynced,
    lastSyncTime,
    timeDifference,
    syncWithServer,
  } = useCurrentTime({
    enableServerSync,
    syncInterval,
  });

  // 추가 상태 관리
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(enableAutoSync);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncAccuracy, setSyncAccuracy] = useState<number>(0);
  const [autoSyncManager] = useState<AutoTimeSyncManager>(() => 
    new AutoTimeSyncManager(
      syncInterval,
      (result: TimeSyncResponse) => {
        setSyncStatus("success");
        setSyncAccuracy(result.accuracy);
        setSyncError(null);
        
        if (showSyncStatus) {
          console.log("자동 시간 동기화 성공:", result);
        }
      },
      (error: Error) => {
        setSyncStatus("error");
        setSyncError(error.message);
        setSyncAccuracy(0);
        
        if (showSyncStatus) {
          console.error("자동 시간 동기화 실패:", error);
        }
      }
    )
  );

  // 서버 동기화 래퍼 함수
  const handleSyncWithServer = useCallback(async () => {
    setSyncStatus("syncing");
    setSyncError(null);
    
    try {
      await syncWithServer();
      setSyncStatus("success");
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error instanceof Error ? error.message : "동기화 실패");
    }
  }, [syncWithServer]);

  // 자동 동기화 토글
  const toggleAutoSync = useCallback(() => {
    setIsAutoSyncEnabled(prev => {
      const newState = !prev;
      
      if (newState) {
        autoSyncManager.start();
      } else {
        autoSyncManager.stop();
      }
      
      return newState;
    });
  }, [autoSyncManager]);

  // 자동 동기화 초기화
  useEffect(() => {
    if (enableAutoSync && enableServerSync) {
      autoSyncManager.start();
    }
    
    return () => {
      autoSyncManager.stop();
    };
  }, [enableAutoSync, enableServerSync, autoSyncManager]);

  // 동기화 상태 업데이트
  useEffect(() => {
    if (isServerSynced) {
      setSyncStatus("success");
      setSyncAccuracy(95); // 기본 정확도
    }
  }, [isServerSynced]);

  // 페이지 포커스 시 즉시 동기화
  useEffect(() => {
    const handleFocus = () => {
      if (enableServerSync && isAutoSyncEnabled) {
        handleSyncWithServer();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enableServerSync, isAutoSyncEnabled, handleSyncWithServer]);

  // 컨텍스트 값 메모이제이션
  const contextValue = useMemo(() => ({
    currentTime,
    formattedTime,
    formattedDate,
    isServerSynced,
    lastSyncTime,
    timeDifference,
    syncAccuracy,
    syncWithServer: handleSyncWithServer,
    toggleAutoSync,
    isAutoSyncEnabled,
    syncStatus,
    syncError,
  }), [
    currentTime,
    formattedTime,
    formattedDate,
    isServerSynced,
    lastSyncTime,
    timeDifference,
    syncAccuracy,
    handleSyncWithServer,
    toggleAutoSync,
    isAutoSyncEnabled,
    syncStatus,
    syncError,
  ]);

  return (
    <EnhancedTimeContext.Provider value={contextValue}>
      {children}
      {showSyncStatus && <TimeSyncStatusIndicator />}
    </EnhancedTimeContext.Provider>
  );
};

// 시간 동기화 상태 표시 컴포넌트
const TimeSyncStatusIndicator: React.FC = () => {
  const context = useContext(EnhancedTimeContext);
  
  if (!context) {
    return null;
  }
  
  const { syncStatus, syncError, syncAccuracy, isServerSynced } = context;
  
  if (!isServerSynced) {
    return null;
  }
  
  const getStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const getStatusText = () => {
    switch (syncStatus) {
      case "syncing":
        return "동기화 중...";
      case "success":
        return `동기화 완료 (정확도: ${syncAccuracy}%)`;
      case "error":
        return `동기화 실패: ${syncError}`;
      default:
        return "대기 중";
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${getStatusColor()} text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2`}>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
};

// 향상된 시간 훅
export const useEnhancedTime = (): EnhancedTimeContextType => {
  const context = useContext(EnhancedTimeContext);
  if (!context) {
    throw new Error("useEnhancedTime must be used within an EnhancedTimeProvider");
  }
  return context;
};

// 기존 호환성을 위한 기본 시간 훅
export const useTime = () => {
  const context = useContext(EnhancedTimeContext);
  if (context) {
    return {
      currentTime: context.currentTime,
      formattedTime: context.formattedTime,
    };
  }
  
  // 컨텍스트가 없는 경우 기본 훅 사용
  const { currentTime, formattedTime } = useCurrentTime();
  return { currentTime, formattedTime };
};

// 시간 동기화 제어 훅
export const useTimeSyncControl = () => {
  const context = useContext(EnhancedTimeContext);
  if (!context) {
    throw new Error("useTimeSyncControl must be used within an EnhancedTimeProvider");
  }
  
  return {
    syncWithServer: context.syncWithServer,
    toggleAutoSync: context.toggleAutoSync,
    isAutoSyncEnabled: context.isAutoSyncEnabled,
    syncStatus: context.syncStatus,
    syncError: context.syncError,
    syncAccuracy: context.syncAccuracy,
    isServerSynced: context.isServerSynced,
    lastSyncTime: context.lastSyncTime,
  };
};

// 시간 정보 전용 훅
export const useTimeInfo = () => {
  const context = useContext(EnhancedTimeContext);
  if (!context) {
    throw new Error("useTimeInfo must be used within an EnhancedTimeProvider");
  }
  
  return {
    currentTime: context.currentTime,
    formattedTime: context.formattedTime,
    formattedDate: context.formattedDate,
    timeDifference: context.timeDifference,
  };
};