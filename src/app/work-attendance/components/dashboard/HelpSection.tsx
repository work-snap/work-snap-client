"use client";

import React, { useState } from "react";

interface HelpSectionProps {
  className?: string;
}

/**
 * HelpSection - 사용 가이드 및 도움말 컴포넌트
 * 
 * Features:
 * - 사용 가이드 표시
 * - 확장/축소 가능한 인터페이스
 * - FAQ 섹션
 * - 문의 방법 안내
 */
export const HelpSection: React.FC<HelpSectionProps> = ({
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-sub1/10 rounded-2xl border border-sub1/20 ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-sub1/5 transition-colors rounded-2xl"
        onClick={toggleExpansion}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-sub2 flex items-center">
            <span className="mr-2">💡</span>
            사용 가이드
          </h3>
          <span className={`text-sub2 transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}>
            ⌄
          </span>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4">
          {/* Quick Guide */}
          <div className="space-y-3 text-sm text-sub2 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sub1">🎯 주요 기능</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>메인 버튼</strong>: 선택된 타입으로 출근/퇴근 처리</li>
                  <li>• <strong>우측 버튼</strong>: 상황별 빠른 액션 (조기출근, 조퇴 등)</li>
                  <li>• <strong>타입 변경</strong>: "다른 타입 선택" 버튼으로 출근/퇴근 타입 변경</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sub1">📋 근무 유형</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>일반 근무</strong>: 정규 근무 시간에 따른 출퇴근</li>
                  <li>• <strong>야간 근무</strong>: 시작일과 종료일에 각각 카드 표시</li>
                  <li>• <strong>추가 근무</strong>: 정규 근무와 별도로 관리되는 업무</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-6">
            <h4 className="font-semibold text-sub1 mb-3 flex items-center">
              <span className="mr-2">❓</span>
              자주 묻는 질문
            </h4>
            <div className="space-y-3">
              <FAQItem
                question="출근 시간을 잘못 기록했어요"
                answer="관리자에게 문의하여 출근 시간 수정을 요청하세요. 직접 수정은 불가능합니다."
              />
              <FAQItem
                question="추가 근무는 어떻게 등록하나요?"
                answer="하단의 '추가근무 +' 버튼을 클릭하여 새로운 추가 근무를 등록할 수 있습니다."
              />
              <FAQItem
                question="야간 근무 시 퇴근은 언제 처리하나요?"
                answer="야간 근무의 경우 다음날에 퇴근 카드가 나타나며, 해당 카드에서 퇴근 처리할 수 있습니다."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-sub1/20 pt-4">
            <h4 className="font-semibold text-sub1 mb-3 flex items-center">
              <span className="mr-2">📞</span>
              문의 및 지원
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-sub2">
              <div>
                <p className="font-medium mb-1">기술 지원</p>
                <ul className="space-y-1">
                  <li>• 앱 사용 관련 문의</li>
                  <li>• 오류 및 버그 신고</li>
                  <li>• 기능 개선 제안</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">근무 관리</p>
                <ul className="space-y-1">
                  <li>• 출퇴근 시간 수정 요청</li>
                  <li>• 근무 일정 변경</li>
                  <li>• 권한 관련 문의</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div className="px-4 pb-4">
          <div className="text-sm text-sub2 opacity-70">
            출근 관리 앱 사용법, FAQ, 문의 방법을 확인하세요
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * FAQItem - FAQ 개별 아이템 컴포넌트
 */
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-sub1/10 rounded-lg">
      <button
        className="w-full p-3 text-left hover:bg-sub1/5 transition-colors rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-sub1">{question}</span>
          <span className={`text-xs text-sub2 transform transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}>
            ⌄
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="px-3 pb-3">
          <p className="text-xs text-sub2 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};