"use client";

import { ThemeToggle, ThemeToggleIcon } from "./components/ThemeToggle";
import { DesignSystemExample } from "./components/DesignSystemExample";
import ClientOnly from "./components/ClientOnly";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* 헤더 */}
      <header className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Work Snap App</h1>
            <div className="flex items-center gap-4">
              <ClientOnly fallback={<div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>}>
                <ThemeToggleIcon />
              </ClientOnly>
              <ClientOnly fallback={<div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>}>
                <ThemeToggle />
              </ClientOnly>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* 새로운 디자인 시스템 색상 섹션 */}
          <section className="bg-fill-neutral-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors duration-300">
            <DesignSystemExample />
          </section>

          {/* 구분선 */}
          <div className="border-t border-line-neutral-secondary"></div>

          {/* 기존 색상 팔레트 테스트 섹션 */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              기존 색상 테마 미리보기
            </h2>

            {/* Primary 색상 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                Primary 색상
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-primary-100 p-4 rounded-lg text-center">
                  <div className="w-full h-16 bg-primary-500 rounded mb-2"></div>
                  <p className="text-sm text-primary-700">Primary</p>
                </div>
                <div className="bg-secondary-100 p-4 rounded-lg text-center">
                  <div className="w-full h-16 bg-secondary-500 rounded mb-2"></div>
                  <p className="text-sm text-secondary-700">Secondary</p>
                </div>
                <div className="bg-accent-100 p-4 rounded-lg text-center">
                  <div className="w-full h-16 bg-accent-500 rounded mb-2"></div>
                  <p className="text-sm text-accent-700">Accent</p>
                </div>
                <div className="bg-success-100 p-4 rounded-lg text-center">
                  <div className="w-full h-16 bg-success-500 rounded mb-2"></div>
                  <p className="text-sm text-success-700">Success</p>
                </div>
                <div className="bg-warning-100 p-4 rounded-lg text-center">
                  <div className="w-full h-16 bg-warning-500 rounded mb-2"></div>
                  <p className="text-sm text-warning-700">Warning</p>
                </div>
              </div>
            </div>

            {/* 디자인 시스템과 기존 색상 비교 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                새 디자인 시스템 vs 기존 색상 비교
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 새 디자인 시스템 */}
                <div className="bg-fill-neutral-white border border-line-brand-default rounded-lg p-6">
                  <h4 className="text-text-brand-default font-semibold mb-4">새 디자인 시스템</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-button-fill-brand-default hover:bg-button-fill-brand-default-pressed text-button-text-neutral-white rounded transition-colors duration-200">
                      브랜드 버튼
                    </button>
                    <button className="w-full px-4 py-2 bg-button-fill-neutral-default hover:bg-button-fill-neutral-default-pressed text-button-text-neutral-default border border-line-neutral-default rounded transition-colors duration-200">
                      중성 버튼
                    </button>
                    <p className="text-text-brand-default">브랜드 텍스트</p>
                    <p className="text-text-neutral-secondary">중성 보조 텍스트</p>
                  </div>
                </div>

                {/* 기존 색상 시스템 */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6">
                  <h4 className="text-text-primary-light dark:text-text-primary-dark font-semibold mb-4">
                    기존 색상 시스템
                  </h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors duration-200">
                      Primary 버튼
                    </button>
                    <button className="w-full px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded transition-colors duration-200">
                      Secondary 버튼
                    </button>
                    <p className="text-primary-500">Primary 텍스트</p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">보조 텍스트</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 버튼 예시 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                통합 버튼 스타일 가이드
              </h3>
              <div className="flex flex-wrap gap-4">
                {/* 새 디자인 시스템 버튼들 */}
                <button className="px-6 py-3 bg-button-fill-brand-default hover:bg-button-fill-brand-default-pressed text-button-text-neutral-white rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  디자인 시스템 Primary
                </button>
                <button className="px-6 py-3 bg-button-fill-brand-secondary hover:bg-button-fill-brand-secondary-pressed text-button-text-brand-default border border-line-brand-secondary rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  디자인 시스템 Secondary
                </button>

                {/* 기존 색상 버튼들 */}
                <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  기존 Primary
                </button>
                <button className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  기존 Accent
                </button>
                <button className="px-6 py-3 bg-success-500 hover:bg-success-600 text-white rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  Success Button
                </button>
                <button className="px-6 py-3 bg-warning-500 hover:bg-warning-600 text-white rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  Warning Button
                </button>
                <button className="px-6 py-3 bg-error-500 hover:bg-error-600 text-white rounded-lg shadow-soft transition-all duration-200 hover:shadow-medium">
                  Error Button
                </button>
              </div>
            </div>

            {/* 카드 예시 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                카드 레이아웃
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6 shadow-soft">
                  <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                    기존 시스템 카드
                  </h4>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                    기존 색상 시스템을 사용한 카드입니다.
                  </p>
                  <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors duration-200">
                    더 보기
                  </button>
                </div>

                <div className="bg-fill-brand-default border border-line-brand-secondary rounded-lg p-6 shadow-medium">
                  <h4 className="text-lg font-semibold text-text-brand-default mb-2">디자인 시스템 카드</h4>
                  <p className="text-text-neutral-secondary mb-4">새로운 디자인 시스템 색상을 사용한 카드입니다.</p>
                  <button className="px-4 py-2 bg-button-fill-brand-default hover:bg-button-fill-brand-default-pressed text-button-text-neutral-white rounded transition-colors duration-200">
                    액션
                  </button>
                </div>

                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6 shadow-strong">
                  <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                    혼합 카드
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-fill-brand-transparent rounded animate-fade-in">
                      <p className="text-text-brand-default">브랜드 투명 배경</p>
                    </div>
                    <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded animate-slide-up">
                      <p className="text-text-etc-coral">코랄 텍스트</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
