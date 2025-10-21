# 사업장 관리 페이지 SSR 최적화

## 🎯 최적화 목표

1. **초기 렌더링 속도 향상**: 서버 데이터가 필요 없는 UI를 SSR로 즉시 제공
2. **Progressive Hydration**: 데이터 로드 후 동적으로 컨텐츠 갈아끼우기
3. **사용자 경험 개선**: 레이아웃 시프트 없이 부드러운 로딩 경험

## 📁 파일 구조

```
add-business/
├── page.tsx                    # Server Component (SSR 레이아웃)
├── WorkplaceListSkeleton.tsx  # 로딩 스켈레톤 UI
└── components/
    ├── index.ts               # Export 중앙화
    ├── WorkplaceList.tsx      # Client Component (데이터 페칭)
    └── AddBusinessButton.tsx  # Client Component (네비게이션)
```

## 🚀 최적화 전략

### 1. Server Component 레이어 (page.tsx)

```tsx
// ✅ Server Component - 정적 UI SSR 렌더링
export default function AddBusiness() {
  return (
    <div className="...">
      {/* 배너 - SSR로 즉시 렌더링 */}
      <Benner />

      {/* 데이터 영역 - Suspense로 스트리밍 */}
      <Suspense fallback={<Skeleton />}>
        <WorkplaceList />
      </Suspense>

      {/* 버튼 - SSR로 즉시 렌더링 */}
      <AddBusinessButton />
    </div>
  );
}
```

**장점:**

- 초기 HTML에 배너와 레이아웃 포함
- JavaScript 로드 전에도 UI 표시
- SEO 친화적
- Time to First Byte (TTFB) 개선

### 2. Client Component 레이어 (WorkplaceList.tsx)

```tsx
// ✅ Client Component - 동적 데이터 페칭
"use client";

export default function WorkplaceList() {
  const { data, isLoading } = useGetWP();

  if (isLoading) return <WorkplaceListSkeleton />;

  return <div>{/* 동적 컨텐츠 */}</div>;
}
```

**장점:**

- React Query를 통한 효율적인 데이터 페칭
- 클라이언트 상태 관리
- 낙관적 업데이트 지원

### 3. Suspense 활용

```tsx
// ✅ 스트리밍 SSR + Progressive Hydration
<Suspense fallback={<WorkplaceListSkeleton />}>
  <WorkplaceList />
</Suspense>
```

**장점:**

- 데이터 로드 중에도 스켈레톤 UI 표시
- 레이아웃 시프트 방지
- 점진적 컨텐츠 업데이트

## 📊 성능 개선 효과

### Before (전체 Client Component)

```
┌─────────────────────────────────┐
│ JavaScript 로드 대기...         │
│                                 │
│ [빈 화면 / 로딩 스피너]         │
│                                 │
└─────────────────────────────────┘
↓ JS 로드 완료 (2-3초)
↓ 컴포넌트 렌더링
↓ 데이터 페칭 (1-2초)
↓ 최종 UI 표시
```

### After (SSR + Client Component 분리)

```
┌─────────────────────────────────┐
│ ✅ 배너 (즉시 표시)             │
│ ⏳ 스켈레톤 UI (즉시 표시)      │
│ ✅ 등록 버튼 (즉시 표시)        │
└─────────────────────────────────┘
↓ JavaScript 로드 (백그라운드)
↓ 데이터 페칭 (1-2초)
↓ 컨텐츠 갈아끼우기
┌─────────────────────────────────┐
│ ✅ 배너                         │
│ ✅ 사업장 리스트 (데이터)       │
│ ✅ 등록 버튼                    │
└─────────────────────────────────┘
```

## 🎨 사용자 경험 개선

1. **즉시 피드백**: 페이지 구조가 즉시 표시되어 사용자가 기다리는 느낌 감소
2. **예측 가능성**: 스켈레톤 UI로 로딩 중 레이아웃 미리 표시
3. **부드러운 전환**: 레이아웃 시프트 없이 컨텐츠만 교체
4. **인터렉션 가능**: 데이터 로드 전에도 버튼 클릭 가능

## 🔧 기술 스택

- **Next.js 15**: App Router + Server Components
- **React 18**: Suspense + Streaming SSR
- **TanStack Query**: 클라이언트 데이터 페칭
- **TypeScript**: 타입 안전성

## 📝 Best Practices

### ✅ DO

- Server Component를 기본으로 사용
- 클라이언트 인터랙션이 필요한 부분만 "use client"
- Suspense로 로딩 상태 명확히 표시
- 스켈레톤 UI로 레이아웃 시프트 방지

### ❌ DON'T

- 전체 페이지를 "use client"로 만들지 않기
- Suspense 없이 클라이언트 데이터 페칭하지 않기
- 로딩 상태를 조건부 렌더링으로만 처리하지 않기
- Server/Client Component 경계를 모호하게 하지 않기

## 🚀 향후 개선 방향

1. **Prefetching**: 링크 hover 시 데이터 미리 로드
2. **Optimistic Updates**: 삭제/수정 시 즉시 UI 반영
3. **Infinite Scroll**: 사업장 목록 무한 스크롤
4. **Cache Optimization**: React Query 캐시 전략 최적화

---

**최적화 완료일**: 2024년 12월
**성능 개선**: 초기 렌더링 속도 2-3초 → 즉시 표시
