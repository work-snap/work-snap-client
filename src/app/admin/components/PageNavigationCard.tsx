import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Tab,
  Tabs,
  Button,
  Chip,
} from "@heroui/react";
import {
  Globe,
  Users,
  Building2,
  ExternalLink,
  Home,
  UserPlus,
  Briefcase,
  Calendar,
  DollarSign,
  Settings,
  BarChart,
  MessageSquare,
  Shield
} from "lucide-react";

interface PageInfo {
  name: string;
  path: string;
  description: string;
  icon: React.ComponentType<any>;
  status?: "active" | "beta" | "new";
}

export default function PageNavigationCard() {
  const [activeTab, setActiveTab] = useState("guest");

  // 페이지 정보 정의
  const pageCategories = {
    guest: {
      title: "비회원 페이지",
      icon: Globe,
      color: "text-gray-600",
      pages: [
        {
          name: "홈페이지",
          path: "/",
          description: "메인 랜딩 페이지",
          icon: Home
        },
        {
          name: "로그인",
          path: "/login",
          description: "카카오 소셜 로그인",
          icon: UserPlus
        },
        {
          name: "회원가입",
          path: "/signup",
          description: "사용자 타입 선택",
          icon: UserPlus
        }
      ] as PageInfo[]
    },
    worker: {
      title: "알바생 페이지",
      icon: Users,
      color: "text-blue-600",
      pages: [
        {
          name: "알바 목록",
          path: "/user/ptjob/job-list",
          description: "사용 가능한 알바 목록 조회",
          icon: Briefcase
        },
        {
          name: "내 알바",
          path: "/user/ptjob/my-jobs",
          description: "지원한 알바 관리",
          icon: Calendar
        },
        {
          name: "출석 체크",
          path: "/user/ptjob/attendance",
          description: "출근/퇴근 체크 및 기록",
          icon: Calendar
        },
        {
          name: "급여 관리",
          path: "/user/ptjob/salary",
          description: "급여 내역 및 정산",
          icon: DollarSign
        },
        {
          name: "프로필 설정",
          path: "/user/ptjob/profile",
          description: "개인정보 및 설정 관리",
          icon: Settings
        },
        {
          name: "알바 신청",
          path: "/signup/ptjob",
          description: "알바생 회원가입 프로세스",
          icon: UserPlus,
          status: "new"
        }
      ] as PageInfo[]
    },
    business: {
      title: "사업자 페이지",
      icon: Building2,
      color: "text-green-600",
      pages: [
        {
          name: "사업장 추가",
          path: "/user/business/add-business",
          description: "새로운 사업장 등록",
          icon: Building2
        },
        {
          name: "사업장 관리",
          path: "/user/business/manage-business",
          description: "등록된 사업장 관리",
          icon: Settings
        },
        {
          name: "직원 관리",
          path: "/user/business/employee-management",
          description: "직원 채용 및 관리",
          icon: Users
        },
        {
          name: "출석 관리",
          path: "/user/business/attendance-management",
          description: "직원 출석 현황 관리",
          icon: Calendar
        },
        {
          name: "급여 관리",
          path: "/user/business/salary-management",
          description: "직원 급여 계산 및 지급",
          icon: DollarSign
        },
        {
          name: "통계 분석",
          path: "/user/business/analytics",
          description: "사업장 운영 통계",
          icon: BarChart
        },
        {
          name: "피드백",
          path: "/user/business/feedback",
          description: "시스템 피드백 제공",
          icon: MessageSquare
        },
        {
          name: "사업자 인증 1단계",
          path: "/signup/business/signup-1",
          description: "사업자 정보 입력",
          icon: Building2
        },
        {
          name: "사업자 인증 2단계",
          path: "/signup/business/signup-2",
          description: "사업자등록증 업로드",
          icon: Shield
        },
        {
          name: "사업자 인증 3단계",
          path: "/signup/business/signup-3",
          description: "추가 정보 입력",
          icon: Settings
        },
        {
          name: "인증 성공",
          path: "/signup/business/success-signup",
          description: "사업자 인증 완료 페이지",
          icon: Shield,
          status: "active"
        },
        {
          name: "재인증",
          path: "/signup/business/re-authentication",
          description: "사업자 재인증 페이지",
          icon: Shield,
          status: "beta"
        }
      ] as PageInfo[]
    },
    admin: {
      title: "관리자 페이지",
      icon: Shield,
      color: "text-purple-600",
      pages: [
        {
          name: "관리자 대시보드",
          path: "/admin",
          description: "전체 시스템 관리 대시보드",
          icon: BarChart
        },
        {
          name: "시스템 관리",
          path: "/admin/system",
          description: "스케줄러 및 데이터 관리",
          icon: Settings
        },
        {
          name: "사용자 관리",
          path: "/admin/users",
          description: "전체 사용자 관리",
          icon: Users
        }
      ] as PageInfo[]
    }
  };

  const handlePageOpen = (path: string) => {
    window.open(path, '_blank');
  };

  const getStatusChip = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      active: { color: "success", label: "활성" },
      beta: { color: "warning", label: "베타" },
      new: { color: "primary", label: "신규" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip size="sm" color={config.color as any} variant="flat">
        {config.label}
      </Chip>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          페이지 네비게이션
        </h3>
      </CardHeader>
      <CardBody>
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
          color="primary"
        >
          {Object.entries(pageCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <Tab
                key={key}
                title={
                  <span className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${category.color}`} />
                    {category.title}
                  </span>
                }
              >
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                  {category.pages.map((page, index) => {
                    const PageIcon = page.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg bg-gray-50`}>
                            <PageIcon className={`w-4 h-4 ${category.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {page.name}
                              </h4>
                              {getStatusChip(page.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {page.description}
                            </p>
                            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {page.path}
                            </code>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<ExternalLink className="w-3 h-3" />}
                          onClick={() => handlePageOpen(page.path)}
                          className="ml-3 flex-shrink-0"
                        >
                          이동
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* 카테고리별 요약 정보 */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      총 {category.pages.length}개 페이지
                    </span>
                    <div className="flex gap-2">
                      {category.pages.some(p => p.status === "new") && (
                        <Chip size="sm" color="primary" variant="flat">
                          신규 {category.pages.filter(p => p.status === "new").length}개
                        </Chip>
                      )}
                      {category.pages.some(p => p.status === "beta") && (
                        <Chip size="sm" color="warning" variant="flat">
                          베타 {category.pages.filter(p => p.status === "beta").length}개
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </CardBody>
    </Card>
  );
}