"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseLightModalDebugOptions {
  modalId: string;
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  enableLogging?: boolean;
}

export function useLightModalDebug({
  modalId,
  isOpen,
  onOpen,
  onClose,
  onOpenChange,
  enableLogging = true
}: UseLightModalDebugOptions) {
  const prevIsOpenRef = useRef(isOpen);
  const openTimeRef = useRef<number | null>(null);
  const logRef = useRef<string[]>([]);

  const addLog = useCallback((message: string) => {
    if (!enableLogging) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${modalId}: ${message}`;
    
    logRef.current = [...logRef.current.slice(-9), logEntry]; // Keep last 10
    console.log(`🔸 LIGHT DEBUG: ${logEntry}`);
  }, [modalId, enableLogging]);

  // Track only modal state changes (no invasive event listening)
  useEffect(() => {
    const prevState = prevIsOpenRef.current;
    
    if (isOpen !== prevState) {
      if (isOpen && !prevState) {
        // Modal opening
        openTimeRef.current = Date.now();
        addLog('🟢 모달 열림');
      } else if (!isOpen && prevState) {
        // Modal closing
        const openDuration = openTimeRef.current ? Date.now() - openTimeRef.current : 0;
        addLog(`🔴 모달 닫힘 (지속시간: ${openDuration}ms)`);
        
        // Check for immediate close (potential issue)
        if (openDuration < 100) {
          addLog(`⚠️ 빠른 닫힘 감지! (${openDuration}ms)`);
        }
        
        openTimeRef.current = null;
      }
    }
    
    prevIsOpenRef.current = isOpen;
  }, [isOpen, addLog]);

  // Enhanced event handlers with minimal logging
  const debugOnOpen = useCallback(() => {
    addLog('🎯 onOpen 호출됨');
    onOpen?.();
  }, [addLog, onOpen]);

  const debugOnClose = useCallback(() => {
    addLog('❌ onClose 호출됨');
    onClose?.();
  }, [addLog, onClose]);

  const debugOnOpenChange = useCallback((open: boolean) => {
    addLog(`🔄 onOpenChange(${open}) 호출됨`);
    onOpenChange?.(open);
  }, [addLog, onOpenChange]);

  const getLogs = useCallback(() => {
    return [...logRef.current];
  }, []);

  const clearLogs = useCallback(() => {
    logRef.current = [];
    addLog('🧹 로그 지워짐');
  }, [addLog]);

  return {
    debugOnOpen,
    debugOnClose,
    debugOnOpenChange,
    getLogs,
    clearLogs,
    isQuickClose: openTimeRef.current !== null && (Date.now() - openTimeRef.current) < 100
  };
}