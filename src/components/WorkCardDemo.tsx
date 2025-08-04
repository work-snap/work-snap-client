"use client";

import React, { useState } from "react";
import { DateNavigationProvider } from "@/context/DateContext";
import { EnhancedTimeProvider } from "./EnhancedTimeProvider";
import { WorkCard, WorkInfo, WorkStatsCard, WorkCardList, calculateWorkStats } from "./WorkCard";
import { AttendanceStatus } from "./StatusChip";
import { DateNavigation } from "./DateNavigation";

// 샘플 데이터 생성
const createSampleWorkInfos = (): WorkInfo[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "김철수",
      workDate: today,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      actualStartTime: "08:45",
      status: "EARLY_ARRIVAL",
      department: "개발팀",
      position: "시니어 개발자",
      workLocation: "본사",
      isFlexTime: true,
      notes: "프로젝트 마감으로 인한 조기 출근",
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "이영희",
      workDate: today,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      actualStartTime: "09:15",
      status: "LATE",
      department: "디자인팀",
      position: "UI/UX 디자이너",
      workLocation: "본사",
      notes: "교통 지연으로 인한 지각",
    },
    {
      id: "3",
      employeeId: "EMP003",
      employeeName: "박민수",
      workDate: today,
      scheduledStartTime: "10:00",
      scheduledEndTime: "19:00",
      actualStartTime: "10:00",
      actualEndTime: "21:30",
      status: "OVERTIME",
      department: "개발팀",
      position: "주니어 개발자",
      workLocation: "본사",
      overtimeHours: 2.5,
      notes: "긴급 버그 수정 작업",
    },
    {
      id: "4",
      employeeId: "EMP004",
      employeeName: "정수진",
      workDate: today,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      status: "REMOTE_WORK",
      department: "마케팅팀",
      position: "마케팅 매니저",
      workLocation: "재택",
      remoteWorkApproved: true,
      notes: "재택근무 승인",
    },
    {
      id: "5",
      employeeId: "EMP005",
      employeeName: "최동현",
      workDate: today,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      status: "LEAVE",
      department: "인사팀",
      position: "인사담당자",
      notes: "연차 휴가",
    },
    {
      id: "6",
      employeeId: "EMP006",
      employeeName: "송미란",
      workDate: yesterday,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      actualStartTime: "09:05",
      actualEndTime: "18:10",
      status: "NORMAL",
      department: "영업팀",
      position: "영업 대표",
      workLocation: "본사",
    },
    {
      id: "7",
      employeeId: "EMP007",
      employeeName: "임태웅",
      workDate: tomorrow,
      scheduledStartTime: "09:00",
      scheduledEndTime: "18:00",
      status: "NORMAL",
      department: "개발팀",
      position: "팀장",
      workLocation: "본사",
      notes: "내일 근무 예정",
    },
  ];
};

/**
 * 근무 카드 데모 컴포넌트
 * WorkCard 컴포넌트의 다양한 사용 예시를 보여줍니다
 */
export const WorkCardDemo: React.FC = () => {
  const [workInfos, setWorkInfos] = useState<WorkInfo[]>(createSampleWorkInfos());
  const [selectedSize, setSelectedSize] = useState<"sm" | "md" | "lg">("md");
  const [selectedVariant, setSelectedVariant] = useState<"default" | "compact" | "detailed">("default");

  // 출근 처리
  const handleCheckIn = (workInfo: WorkInfo) => {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setWorkInfos(prev => 
      prev.map(info => 
        info.id === workInfo.id 
          ? { 
              ...info, 
              actualStartTime: timeString,
              status: "NORMAL" as AttendanceStatus // 실제로는 시간에 따라 계산되어야 함
            }
          : info
      )
    );
    
    alert(`${workInfo.employeeName}님이 ${timeString}에 출근하였습니다.`);
  };

  // 퇴근 처리
  const handleCheckOut = (workInfo: WorkInfo) => {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setWorkInfos(prev => 
      prev.map(info => 
        info.id === workInfo.id 
          ? { 
              ...info, 
              actualEndTime: timeString,
            }
          : info
      )
    );
    
    alert(`${workInfo.employeeName}님이 ${timeString}에 퇴근하였습니다.`);
  };

  // 수정 처리
  const handleEdit = (workInfo: WorkInfo) => {
    alert(`${workInfo.employeeName}님의 근무 정보를 수정합니다.`);
  };

  // 상세보기 처리
  const handleViewDetails = (workInfo: WorkInfo) => {
    alert(`${workInfo.employeeName}님의 상세 정보를 확인합니다.`);
  };

  // 통계 계산
  const stats = calculateWorkStats(workInfos);

  return (
    <DateNavigationProvider>
      <EnhancedTimeProvider>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                근무 카드 UI 데모
              </h1>
              <p className="text-gray-600">
                다양한 출석 상태별 칩 버튼과 근무 카드 UI를 확인해보세요.
              </p>
            </div>

            {/* 날짜 네비게이션 */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">날짜 선택</h2>
              <DateNavigation />
            </div>

            {/* 컨트롤 패널 */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">표시 옵션</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 크기 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카드 크기
                  </label>
                  <div className="flex space-x-2">
                    {(["sm", "md", "lg"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${selectedSize === size
                            ? "bg-toss-blue text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        `}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 변형 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카드 변형
                  </label>
                  <div className="flex space-x-2">
                    {(["default", "compact", "detailed"] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${selectedVariant === variant
                            ? "bg-toss-blue text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        `}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="mb-6">
              <WorkStatsCard 
                stats={stats}
                title="오늘의 근무 현황"
                size={selectedSize}
                className="max-w-md"
              />
            </div>

            {/* 근무 카드 리스트 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">근무 카드 목록</h2>
              
              <WorkCardList
                workInfos={workInfos}
                size={selectedSize}
                variant={selectedVariant}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
              />
            </div>

            {/* 개별 카드 예시들 */}
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                상태별 카드 예시
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* 오늘 근무자들만 표시 */}
                {workInfos
                  .filter(info => {
                    const today = new Date();
                    return info.workDate.toDateString() === today.toDateString();
                  })
                  .map((workInfo) => (
                    <WorkCard
                      key={workInfo.id}
                      workInfo={workInfo}
                      size={selectedSize}
                      variant={selectedVariant}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onEdit={handleEdit}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                }
              </div>
            </div>

            {/* 컴팩트 카드 예시 */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                컴팩트 카드 예시
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {workInfos.slice(0, 4).map((workInfo) => (
                  <WorkCard
                    key={`compact-${workInfo.id}`}
                    workInfo={workInfo}
                    variant="compact"
                    size="sm"
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                  />
                ))}
              </div>
            </div>

            {/* 상태 정보 */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">구현된 기능</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">상태 종류</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 정상 출근/퇴근</li>
                    <li>• 지각</li>
                    <li>• 조기 출근</li>
                    <li>• 연장 근무</li>
                    <li>• 결근</li>
                    <li>• 휴가/병가/반차</li>
                    <li>• 재택근무</li>
                    <li>• 출장</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">주요 기능</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 실시간 출근/퇴근 처리</li>
                    <li>• 근무시간 자동 계산</li>
                    <li>• 상태별 칩 버튼</li>
                    <li>• 반응형 디자인</li>
                    <li>• 키보드 접근성</li>
                    <li>• 다양한 카드 크기/변형</li>
                    <li>• 통계 정보 표시</li>
                    <li>• 날짜 네비게이션 연동</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnhancedTimeProvider>
    </DateNavigationProvider>
  );
};