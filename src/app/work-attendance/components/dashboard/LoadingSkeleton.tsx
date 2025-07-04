"use client";

import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

/**
 * LoadingSkeleton - 로딩 중 스켈레톤 UI 컴포넌트
 * 
 * Features:
 * - 실제 콘텐츠와 유사한 형태의 스켈레톤
 * - 애니메이션 효과
 * - 반응형 디자인
 * - 접근성 고려
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-label="데이터 로딩 중">
      {/* Summary Skeleton */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full mb-4"></div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Card Skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="animate-pulse">
            {/* Status Header */}
            <div className="flex items-center mb-3">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* Title with icon */}
                <div className="flex items-center mb-2">
                  <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                
                {/* Subtitle */}
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                
                {/* Status Badge */}
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              
              {/* Action Button */}
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Time Info */}
            <div className="mb-4">
              {/* Current Time Label */}
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              {/* Current Time */}
              <div className="h-6 bg-gray-200 rounded w-24 mb-3"></div>
              
              {/* Schedule Label */}
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              {/* Schedule Time */}
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Working Time Info (if applicable) */}
            {i === 1 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <div className="h-14 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}

      {/* Help Section Skeleton */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Screen Reader Content */}
      <span className="sr-only">
        출근 기록 데이터를 불러오고 있습니다. 잠시만 기다려주세요.
      </span>
    </div>
  );
};

/**
 * CardSkeleton - 개별 카드 스켈레톤 컴포넌트
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Content */}
        <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
};

/**
 * SummarySkeleton - 요약 정보 스켈레톤 컴포넌트
 */
export const SummarySkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`bg-gray-50 rounded-2xl p-4 border border-gray-200 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};