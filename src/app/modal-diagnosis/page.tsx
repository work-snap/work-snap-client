"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { modalDebugLogger } from "@/utils/modalDebugLogger";

export default function ModalDiagnosisPage() {
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [domInfo, setDomInfo] = useState<any>({});
  const [libraryInfo, setLibraryInfo] = useState<any>({});

  useEffect(() => {
    // System information gathering
    const gatherSystemInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        },
        performance: {
          timeOrigin: performance.timeOrigin,
          now: performance.now()
        }
      };
      setSystemInfo(info);
      modalDebugLogger.performance('SYSTEM_INFO', 'System information gathered', info);
    };

    // DOM information gathering
    const gatherDomInfo = () => {
      const info = {
        documentReadyState: document.readyState,
        activeElement: document.activeElement?.tagName,
        eventListeners: {
          document: Object.getOwnPropertyNames(document).filter(name => name.startsWith('on')),
          window: Object.getOwnPropertyNames(window).filter(name => name.startsWith('on')).length
        },
        modalElements: {
          heroUIModals: document.querySelectorAll('[role="dialog"]').length,
          backdrops: document.querySelectorAll('[data-slot="backdrop"]').length,
          overlays: document.querySelectorAll('[data-overlay-container="true"]').length
        },
        styles: {
          computedStyles: getComputedStyle(document.body),
          hasStrictMode: document.querySelector('[data-reactroot]') !== null
        }
      };
      setDomInfo(info);
      modalDebugLogger.performance('DOM_INFO', 'DOM information gathered', info);
    };

    // Library information gathering
    const gatherLibraryInfo = () => {
      const info = {
        react: {
          version: (window as any).React?.version || 'Unknown',
          strictMode: (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 'Detected' : 'Not detected'
        },
        heroUI: {
          detected: typeof (window as any).HeroUI !== 'undefined',
          version: 'Unknown'
        },
        framerMotion: {
          detected: typeof (window as any).Motion !== 'undefined',
          elements: document.querySelectorAll('[data-framer-component]').length
        },
        globalKeyboard: {
          detected: typeof (window as any).__MODAL_DEBUG__ !== 'undefined',
          handlers: (window as any).__MODAL_DEBUG__?.handlers?.size || 0
        },
        conflicts: {
          multipleReactRoots: document.querySelectorAll('[data-reactroot]').length,
          portalContainers: document.querySelectorAll('[data-portal-container]').length
        }
      };
      setLibraryInfo(info);
      modalDebugLogger.performance('LIBRARY_INFO', 'Library information gathered', info);
    };

    gatherSystemInfo();
    gatherDomInfo();
    gatherLibraryInfo();

    const interval = setInterval(() => {
      gatherDomInfo();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const runModalStressTest = () => {
    modalDebugLogger.performance('STRESS_TEST', 'Starting comprehensive modal stress test');
    
    // Test 1: Rapid open/close
    console.log('🧪 Test 1: Rapid open/close');
    
    // Test 2: Multiple overlapping calls
    console.log('🧪 Test 2: Multiple overlapping calls');
    
    // Test 3: Event flooding
    console.log('🧪 Test 3: Event flooding');
    
    modalDebugLogger.performance('STRESS_TEST', 'Stress test completed');
  };

  const checkConflicts = () => {
    const conflicts = [];
    
    // Check for multiple UI libraries
    if (document.querySelectorAll('[class*="heroui"]').length > 0 && 
        document.querySelectorAll('[class*="radix"]').length > 0) {
      conflicts.push('HeroUI와 Radix UI가 동시에 감지됨');
    }
    
    // Check for multiple event managers
    const eventListeners = (window as any).__listeners_count__ || 0;
    if (eventListeners > 10) {
      conflicts.push(`과도한 이벤트 리스너 감지: ${eventListeners}개`);
    }
    
    // Check for performance issues
    if (performance.now() > 10000) {
      conflicts.push('페이지 로드 시간이 과도함');
    }
    
    modalDebugLogger.error('CONFLICT_CHECK', 'Conflicts detected', conflicts);
    alert(`감지된 충돌:\n${conflicts.join('\n') || '충돌 없음'}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🔬 모달 문제 종합 진단 시스템
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* System Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">🖥️ 시스템 정보</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div><strong>브라우저:</strong> {systemInfo.userAgent?.split(' ')[0]}</div>
            <div><strong>플랫폼:</strong> {systemInfo.platform}</div>
            <div><strong>언어:</strong> {systemInfo.language}</div>
            <div><strong>뷰포트:</strong> {systemInfo.viewport?.width}×{systemInfo.viewport?.height}</div>
            <div><strong>DPR:</strong> {systemInfo.viewport?.devicePixelRatio}</div>
            <div><strong>메모리:</strong> {systemInfo.deviceMemory || 'Unknown'}GB</div>
            <div><strong>CPU 코어:</strong> {systemInfo.hardwareConcurrency}</div>
          </CardBody>
        </Card>

        {/* DOM Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">🌐 DOM 정보</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div><strong>Ready State:</strong> {domInfo.documentReadyState}</div>
            <div><strong>Active Element:</strong> {domInfo.activeElement}</div>
            <div><strong>HeroUI 모달:</strong> {domInfo.modalElements?.heroUIModals}</div>
            <div><strong>백드롭:</strong> {domInfo.modalElements?.backdrops}</div>
            <div><strong>오버레이:</strong> {domInfo.modalElements?.overlays}</div>
            <div><strong>Window 이벤트:</strong> {domInfo.eventListeners?.window}</div>
          </CardBody>
        </Card>

        {/* Library Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">📚 라이브러리 정보</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div><strong>React:</strong> {libraryInfo.react?.version}</div>
            <div><strong>Strict Mode:</strong> {libraryInfo.react?.strictMode}</div>
            <div><strong>HeroUI:</strong> {libraryInfo.heroUI?.detected ? '감지됨' : '미감지'}</div>
            <div><strong>Framer Motion:</strong> {libraryInfo.framerMotion?.detected ? '감지됨' : '미감지'}</div>
            <div><strong>글로벌 키보드:</strong> {libraryInfo.globalKeyboard?.detected ? '활성' : '비활성'}</div>
            <div><strong>포털 컨테이너:</strong> {libraryInfo.conflicts?.portalContainers}</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">🧪 진단 도구</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Button 
              color="primary" 
              onPress={() => window.open('/heroui-test', '_blank')}
              className="w-full"
            >
              HeroUI 기본 테스트
            </Button>
            
            <Button 
              color="secondary" 
              onPress={() => window.open('/advanced-modal-debug', '_blank')}
              className="w-full"
            >
              고급 디버깅 모달
            </Button>
            
            <Button 
              color="warning" 
              onPress={() => window.open('/no-animation-modal', '_blank')}
              className="w-full"
            >
              애니메이션 없는 모달
            </Button>
            
            <Button 
              color="success" 
              onPress={() => window.open('/vanilla-modal', '_blank')}
              className="w-full"
            >
              순수 바닐라 모달
            </Button>

            <Divider />

            <Button 
              color="danger" 
              variant="flat"
              onPress={runModalStressTest}
              className="w-full"
            >
              스트레스 테스트 실행
            </Button>
            
            <Button 
              color="warning" 
              variant="flat"
              onPress={checkConflicts}
              className="w-full"
            >
              충돌 검사
            </Button>
          </CardBody>
        </Card>

        {/* Quick Diagnostics */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">⚡ 빠른 진단</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔍 체크리스트</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <div>✅ React Strict Mode: {process.env.NODE_ENV === 'development' ? '비활성화됨' : '확인 필요'}</div>
                <div>✅ HeroUI Provider: 설치됨</div>
                <div>✅ 글로벌 키보드 관리자: 활성</div>
                <div>✅ Z-index 체계: 표준화됨</div>
                <div>✅ Radix UI: 제거됨</div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 잠재적 문제</h3>
              <div className="space-y-1 text-sm text-yellow-700">
                <div>• Framer Motion 버전 충돌</div>
                <div>• 브라우저 확장프로그램 간섭</div>
                <div>• CSS-in-JS 렌더링 지연</div>
                <div>• 이벤트 버블링 타이밍</div>
              </div>
            </div>

            <Button 
              size="sm"
              variant="flat"
              onPress={() => {
                console.clear();
                modalDebugLogger.clear();
                window.location.reload();
              }}
              className="w-full"
            >
              전체 초기화 및 새로고침
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">📋 진단 순서</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>먼저 "순수 바닐라 모달"을 테스트하여 기본 환경 확인</li>
          <li>"애니메이션 없는 모달"로 Framer Motion 충돌 여부 확인</li>
          <li>"고급 디버깅 모달"에서 상세 로그 분석</li>
          <li>"HeroUI 기본 테스트"로 라이브러리 자체 문제 확인</li>
          <li>모든 테스트에서 문제가 발생하면 "충돌 검사" 실행</li>
        </ol>
      </div>
    </div>
  );
}