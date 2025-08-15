"use client";

import React, { useEffect } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";

export default function AdvancedModalDebugPage() {
  // 침습적 디버깅 때문에 이 페이지는 비활성화됨
  useEffect(() => {
    // 자동으로 simple-modal-test로 리다이렉트
    window.location.href = '/simple-modal-test';
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-red-600">⚠️ 페이지 비활성화됨</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h2 className="font-semibold text-red-800 mb-2">침습적 디버깅 감지</h2>
            <p className="text-sm text-red-700 mb-3">
              이 페이지의 고급 디버깅 시스템이 HeroUI 모달의 이벤트 관리와 충돌을 일으켜서 
              모달이 열렸다가 바로 닫히는 문제를 발생시켰습니다.
            </p>
            <p className="text-sm text-red-700">
              안전한 테스트를 위해 자동으로 간단한 모달 테스트 페이지로 리다이렉트됩니다.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              color="primary"
              onPress={() => window.location.href = '/simple-modal-test'}
            >
              간단한 모달 테스트로 이동
            </Button>
            
            <Button 
              color="secondary"
              variant="flat"
              onPress={() => window.location.href = '/vanilla-modal'}
            >
              바닐라 모달 테스트로 이동
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}