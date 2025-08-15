"use client";

interface DebugLogEntry {
  timestamp: number;
  time: string;
  type: 'MODAL' | 'EVENT' | 'STATE' | 'ERROR' | 'PERFORMANCE';
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
}

class ModalDebugLogger {
  private logs: DebugLogEntry[] = [];
  private listeners: ((logs: DebugLogEntry[]) => void)[] = [];
  private startTime = Date.now();

  private createLogEntry(
    type: DebugLogEntry['type'],
    category: string,
    message: string,
    data?: any
  ): DebugLogEntry {
    const now = Date.now();
    return {
      timestamp: now,
      time: new Date(now).toLocaleTimeString('ko-KR', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      }),
      type,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      stackTrace: new Error().stack
    };
  }

  log(type: DebugLogEntry['type'], category: string, message: string, data?: any) {
    const entry = this.createLogEntry(type, category, message, data);
    this.logs.push(entry);
    
    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Console logging with colors
    const timeFromStart = entry.timestamp - this.startTime;
    const timeStr = `+${timeFromStart}ms`;
    
    switch (type) {
      case 'MODAL':
        console.log(`%c[${entry.time}] ${timeStr} 🎯 MODAL ${category}: ${message}`, 
          'color: #4CAF50; font-weight: bold;', data);
        break;
      case 'EVENT':
        console.log(`%c[${entry.time}] ${timeStr} ⚡ EVENT ${category}: ${message}`, 
          'color: #FF9800; font-weight: bold;', data);
        break;
      case 'STATE':
        console.log(`%c[${entry.time}] ${timeStr} 📊 STATE ${category}: ${message}`, 
          'color: #2196F3; font-weight: bold;', data);
        break;
      case 'ERROR':
        console.error(`%c[${entry.time}] ${timeStr} ❌ ERROR ${category}: ${message}`, 
          'color: #F44336; font-weight: bold;', data);
        break;
      case 'PERFORMANCE':
        console.log(`%c[${entry.time}] ${timeStr} 🚀 PERF ${category}: ${message}`, 
          'color: #9C27B0; font-weight: bold;', data);
        break;
    }

    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  modal(category: string, message: string, data?: any) {
    this.log('MODAL', category, message, data);
  }

  event(category: string, message: string, data?: any) {
    this.log('EVENT', category, message, data);
  }

  state(category: string, message: string, data?: any) {
    this.log('STATE', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('ERROR', category, message, data);
  }

  performance(category: string, message: string, data?: any) {
    this.log('PERFORMANCE', category, message, data);
  }

  subscribe(listener: (logs: DebugLogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.startTime = Date.now();
    console.clear();
    this.log('PERFORMANCE', 'LOGGER', 'Logs cleared');
    this.listeners.forEach(listener => listener([]));
  }

  // Advanced debugging methods
  trackModalLifecycle(modalId: string, phase: string, data?: any) {
    this.modal('LIFECYCLE', `${modalId} - ${phase}`, {
      modalId,
      phase,
      ...data
    });
  }

  trackEventFlow(eventType: string, target: string, data?: any) {
    this.event('FLOW', `${eventType} on ${target}`, {
      eventType,
      target,
      timestamp: Date.now(),
      ...data
    });
  }

  trackStateChange(component: string, from: any, to: any) {
    this.state('CHANGE', `${component} state change`, {
      component,
      from,
      to,
      timestamp: Date.now()
    });
  }

  // Stack trace analysis
  getRecentEventPattern(lastN: number = 10) {
    return this.logs
      .slice(-lastN)
      .map(log => `${log.type}:${log.category}:${log.message}`)
      .join(' -> ');
  }
}

// Global singleton
export const modalDebugLogger = new ModalDebugLogger();

// Browser DevTools integration
if (typeof window !== 'undefined') {
  (window as any).__MODAL_DEBUG__ = modalDebugLogger;
  console.log('%c🔍 Modal Debug Logger activated!', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
  console.log('%cUse window.__MODAL_DEBUG__ to access logger in DevTools', 'color: #2196F3;');
}