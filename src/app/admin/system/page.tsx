"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
} from "@heroui/react";
import {
  Settings,
  Database,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { SchedulerManagementCard, DataCleanupCard } from "../components";

export default function SystemManagementPage() {
  return (
    <div className="h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                시스템 관리
              </h1>
              <p className="text-gray-600 mt-1">스케줄러 및 데이터 관리</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 시스템 관리 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SchedulerManagementCard />
          <DataCleanupCard />
        </div>

        {/* 시스템 상태 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="border-0 shadow-sm">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">출석 스케줄러</p>
                <p className="font-semibold text-lg">정상 동작</p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">계약 만료 스케줄러</p>
                <p className="font-semibold text-lg">정상 동작</p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">데이터 정리</p>
                <p className="font-semibold text-lg">대기 중</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 최근 작업 로그 */}
        <Card className="mt-8 border-0 shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              최근 시스템 작업
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">출석 결석 처리 완료</span>
                </div>
                <span className="text-xs text-gray-500">2분 전</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">계약 만료 사용자 처리 완료</span>
                </div>
                <span className="text-xs text-gray-500">1시간 전</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">데이터 정리 대기 중</span>
                </div>
                <span className="text-xs text-gray-500">3시간 전</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}