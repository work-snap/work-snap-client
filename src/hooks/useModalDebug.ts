"use client";

import { useEffect, useRef, useCallback } from 'react';
import { modalDebugLogger } from '@/utils/modalDebugLogger';

interface UseModalDebugOptions {
  modalId: string;
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function useModalDebug({
  modalId,
  isOpen,
  onOpen,
  onClose,
  onOpenChange
}: UseModalDebugOptions) {
  const prevIsOpenRef = useRef(isOpen);
  const openTimeRef = useRef<number | null>(null);
  const closeReasonRef = useRef<string>('unknown');

  // Track modal state changes
  useEffect(() => {
    const prevState = prevIsOpenRef.current;
    
    if (isOpen !== prevState) {
      modalDebugLogger.trackStateChange(modalId, prevState, isOpen);
      
      if (isOpen && !prevState) {
        // Modal opening
        openTimeRef.current = Date.now();
        modalDebugLogger.trackModalLifecycle(modalId, 'OPENING', {
          previousState: prevState,
          openTime: openTimeRef.current
        });
      } else if (!isOpen && prevState) {
        // Modal closing
        const openDuration = openTimeRef.current ? Date.now() - openTimeRef.current : 0;
        modalDebugLogger.trackModalLifecycle(modalId, 'CLOSING', {
          previousState: prevState,
          openDuration,
          closeReason: closeReasonRef.current
        });
        
        // Check for immediate close (suspicious behavior)
        if (openDuration < 100) {
          modalDebugLogger.error('QUICK_CLOSE', `Modal ${modalId} closed too quickly (${openDuration}ms)`, {
            openDuration,
            closeReason: closeReasonRef.current,
            recentPattern: modalDebugLogger.getRecentEventPattern(5)
          });
        }
        
        openTimeRef.current = null;
        closeReasonRef.current = 'unknown';
      }
    }
    
    prevIsOpenRef.current = isOpen;
  }, [isOpen, modalId]);

  // Enhanced event handlers with logging
  const debugOnOpen = useCallback(() => {
    closeReasonRef.current = 'manual_open';
    modalDebugLogger.event('USER_ACTION', `${modalId} - onOpen triggered`);
    onOpen?.();
  }, [modalId, onOpen]);

  const debugOnClose = useCallback(() => {
    closeReasonRef.current = 'manual_close';
    modalDebugLogger.event('USER_ACTION', `${modalId} - onClose triggered`);
    onClose?.();
  }, [modalId, onClose]);

  const debugOnOpenChange = useCallback((open: boolean) => {
    closeReasonRef.current = open ? 'open_change_true' : 'open_change_false';
    modalDebugLogger.event('HERO_UI', `${modalId} - onOpenChange(${open})`, {
      currentState: isOpen,
      newState: open,
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    });
    onOpenChange?.(open);
  }, [modalId, isOpen, onOpenChange]);

  // DISABLED: Invasive event listener tracking was causing modal issues
  // This was interfering with HeroUI's internal event management

  // DISABLED: Mouse event tracking was adding excessive event listeners
  // This was interfering with HeroUI's modal dismissal functionality

  // DISABLED: Keyboard event tracking was also adding conflicting listeners
  // HeroUI has its own keyboard event management

  // Performance monitoring
  useEffect(() => {
    if (isOpen) {
      const startTime = Date.now();
      modalDebugLogger.performance('RENDER', `Modal ${modalId} rendering started`);
      
      const timeoutId = setTimeout(() => {
        const renderTime = Date.now() - startTime;
        modalDebugLogger.performance('RENDER', `Modal ${modalId} render completed`, {
          renderTime,
          stillOpen: isOpen
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, modalId]);

  return {
    debugOnOpen,
    debugOnClose,
    debugOnOpenChange,
    getLogs: modalDebugLogger.getLogs.bind(modalDebugLogger),
    clearLogs: modalDebugLogger.clear.bind(modalDebugLogger),
    getRecentPattern: () => modalDebugLogger.getRecentEventPattern(10)
  };
}