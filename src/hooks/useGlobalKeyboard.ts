"use client";

import { useEffect, useRef } from 'react';

interface KeyboardHandler {
  id: string;
  priority: number; // Higher number = higher priority
  handler: (event: KeyboardEvent) => boolean; // Return true to stop propagation
}

class GlobalKeyboardManager {
  private handlers: Map<string, KeyboardHandler> = new Map();
  private isListening = false;

  register(handler: KeyboardHandler) {
    this.handlers.set(handler.id, handler);
    this.startListening();
  }

  unregister(id: string) {
    this.handlers.delete(id);
    if (this.handlers.size === 0) {
      this.stopListening();
    }
  }

  private startListening() {
    if (this.isListening) return;
    this.isListening = true;
    document.addEventListener('keydown', this.handleKeyDown, { capture: true });
  }

  private stopListening() {
    if (!this.isListening) return;
    this.isListening = false;
    document.removeEventListener('keydown', this.handleKeyDown, { capture: true });
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Check if a modal or overlay is currently open (HeroUI modal detection)
    const hasOpenModal = document.querySelector('[data-slot="backdrop"]') !== null ||
                        document.querySelector('[role="dialog"][aria-modal="true"]') !== null ||
                        document.querySelector('[data-overlay-container="true"]') !== null;

    // If modal is open, only allow escape key for modal closure
    if (hasOpenModal && event.key !== 'Escape') {
      return;
    }

    // Sort handlers by priority (highest first)
    const sortedHandlers = Array.from(this.handlers.values())
      .sort((a, b) => b.priority - a.priority);

    // Execute handlers in priority order
    for (const handler of sortedHandlers) {
      try {
        const shouldStop = handler.handler(event);
        if (shouldStop) {
          event.preventDefault();
          event.stopPropagation();
          break;
        }
      } catch (error) {
        console.error(`Error in keyboard handler ${handler.id}:`, error);
      }
    }
  };
}

// Global singleton instance
const globalKeyboardManager = new GlobalKeyboardManager();

export function useGlobalKeyboard(
  id: string,
  handler: (event: KeyboardEvent) => boolean,
  priority: number = 0,
  enabled: boolean = true
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const keyboardHandler: KeyboardHandler = {
      id,
      priority,
      handler: (event) => handlerRef.current(event),
    };

    globalKeyboardManager.register(keyboardHandler);

    return () => {
      globalKeyboardManager.unregister(id);
    };
  }, [id, priority, enabled]);
}

export default useGlobalKeyboard;