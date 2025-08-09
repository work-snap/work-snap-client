import { renderHook, act } from '@testing-library/react';
import { useCurrentTime, useFormattedTime, useTimeZone } from '../useCurrentTime';

// Mock fetch
global.fetch = jest.fn();

describe('useCurrentTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return current time and formatted time', () => {
    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: false,
    }));

    expect(result.current.currentTime).toBeInstanceOf(Date);
    expect(result.current.formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(result.current.formattedDate).toBeTruthy();
    expect(result.current.isServerSynced).toBe(false);
  });

  it('should update time every second', () => {
    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: false,
      updateInterval: 1000,
    }));

    const initialTime = result.current.currentTime;
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.currentTime.getTime()).toBeGreaterThan(initialTime.getTime());
  });

  it('should attempt server sync when enabled', async () => {
    const mockServerResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: {
          currentTime: new Date().toISOString(),
          timestamp: Date.now(),
        },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockServerResponse);

    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    await act(async () => {
      await result.current.syncWithServer();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/time/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle server sync failure gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    await act(async () => {
      await result.current.syncWithServer();
    });

    // Should still provide local time even if sync fails
    expect(result.current.currentTime).toBeInstanceOf(Date);
    expect(result.current.isServerSynced).toBe(false);
  });

  it('should calculate time difference correctly', async () => {
    const serverTime = new Date();
    const clientTime = new Date(serverTime.getTime() + 5000); // 5초 차이
    
    const mockServerResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: {
          currentTime: serverTime.toISOString(),
          timestamp: serverTime.getTime(),
        },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockServerResponse);

    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    await act(async () => {
      await result.current.syncWithServer();
    });

    expect(result.current.timeDifference).toBeLessThan(0); // 클라이언트가 빠름
  });

  it('should sync periodically when enabled', () => {
    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
      syncInterval: 30000,
    }));

    const syncSpy = jest.spyOn(result.current, 'syncWithServer');

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(syncSpy).toHaveBeenCalled();
  });
});

describe('useFormattedTime', () => {
  it('should provide various time formats', () => {
    const { result } = renderHook(() => useFormattedTime());

    expect(result.current.currentTime).toBeInstanceOf(Date);
    expect(result.current.time24Hour).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(result.current.time12Hour).toMatch(/^\d{1,2}:\d{2}:\d{2}/);
    expect(result.current.date).toBeTruthy();
    expect(result.current.dateTime).toBeTruthy();
    expect(result.current.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(typeof result.current.timestamp).toBe('number');
  });
});

describe('useTimeZone', () => {
  it('should provide time in specified timezone', () => {
    const { result } = renderHook(() => useTimeZone('America/New_York'));

    expect(result.current.currentTime).toBeInstanceOf(Date);
    expect(result.current.formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(result.current.formattedDate).toBeTruthy();
    expect(result.current.timeZone).toBe('America/New_York');
  });

  it('should default to Asia/Seoul timezone', () => {
    const { result } = renderHook(() => useTimeZone());

    expect(result.current.timeZone).toBe('Asia/Seoul');
  });
});

describe('time synchronization behavior', () => {
  it('should handle page visibility changes', () => {
    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    const syncSpy = jest.spyOn(result.current, 'syncWithServer');

    // Simulate page becoming visible
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(syncSpy).toHaveBeenCalled();
  });

  it('should cleanup timers on unmount', () => {
    const { unmount } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('network delay compensation', () => {
  it('should calculate network delay correctly', async () => {
    const requestTime = Date.now();
    const responseTime = requestTime + 100; // 100ms network delay
    
    const mockServerResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: {
          currentTime: new Date(requestTime + 50).toISOString(),
          timestamp: requestTime + 50,
        },
      }),
    };

    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve(mockServerResponse);
    });

    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    await act(async () => {
      await result.current.syncWithServer();
    });

    expect(result.current.isServerSynced).toBe(true);
  });
});

describe('error handling', () => {
  it('should handle network timeout gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000)
      )
    );

    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    await act(async () => {
      await result.current.syncWithServer();
    });

    // Should continue working with local time
    expect(result.current.currentTime).toBeInstanceOf(Date);
    expect(result.current.isServerSynced).toBe(false);
  });

  it('should handle invalid server response', async () => {
    const mockServerResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockServerResponse);

    const { result } = renderHook(() => useCurrentTime({
      enableServerSync: true,
    }));

    await act(async () => {
      await result.current.syncWithServer();
    });

    expect(result.current.isServerSynced).toBe(false);
  });
});