# LCP (Largest Contentful Paint) 최적화 가이드

## 📊 현재 상황

- **페이지**: `/user/business/add-business/page.tsx`
- **현재 LCP**: 9.7초
- **목표 LCP**: 2.5초 이하
- **문제**: 클라이언트 사이드 데이터 패칭으로 인한 지연

## 🎯 최적화 방법

### 1. Server Components + Streaming (최고 효과) ⭐⭐⭐⭐⭐

서버에서 데이터를 미리 패치하여 초기 HTML에 포함하는 방법입니다.

#### 📁 `app/user/business/add-business/page.tsx`

```tsx
import { Suspense } from "react";
import { getWorkPlaces } from "@/src/lib/api/getWP";
import Benner from "@/src/app/components/benner";
import WorkplaceList from "./WorkplaceList";
import WorkplaceListSkeleton from "./WorkplaceListSkeleton";

// ✅ Server Component로 변경 ("use client" 제거)
export default async function AddBusiness() {
  // 서버에서 데이터 패치
  const data = await getWorkPlaces();
  const workplaces = data?.workplaces ?? [];

  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      <div className="flex-shrink-0">
        <Benner />
      </div>

      <Suspense fallback={<WorkplaceListSkeleton />}>
        <WorkplaceList initialData={workplaces} />
      </Suspense>
    </div>
  );
}
```

#### 📁 `app/user/business/add-business/WorkplaceList.tsx` (새로 생성)

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteWP } from "@/src/lib/queries/useDeleteWP";
import ToastModal from "@/app/components/ToastModal";
import type { Workplace } from "@/src/lib/api/getWP";

interface WorkplaceListProps {
  initialData: Workplace[];
}

export default function WorkplaceList({ initialData }: WorkplaceListProps) {
  const router = useRouter();
  const [workplaces, setWorkplaces] = useState(initialData);
  const deleteMutation = useDeleteWP();
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const handleDelete = (idx: number) => {
    const workplaceId = workplaces[idx]?.id;
    const workplaceName = workplaces[idx]?.workplaceName;

    deleteMutation.mutate(workplaceId, {
      onSuccess: () => {
        setWorkplaces((prev) => prev.filter((_, i) => i !== idx));
        setToastMessage(`${workplaceName}이(가) 성공적으로 삭제되었습니다.`);
        setIsToastVisible(true);
      },
      onError: () => {
        setToastMessage("삭제에 실패했습니다. 다시 시도해주세요.");
        setIsToastVisible(true);
      },
    });
  };

  return (
    <>
      <div
        className={`flex-1 overflow-y-auto ${
          workplaces.length === 0
            ? "flex justify-center items-center"
            : "flex flex-col gap-4 pb-4"
        }`}
      >
        {workplaces.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            등록된 사업장이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4 px-4 pb-4">
            {workplaces.map((b, idx) => (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow p-4 border border-gray2 flex items-start justify-between gap-2 cursor-pointer"
                onClick={() =>
                  router.push(`/user/business/add-business/detail?idx=${b.id}`)
                }
              >
                <div>
                  <div className="text-main font-bold text-lg mb-1">
                    {b.workplaceName}
                  </div>
                  <div className="text-gray3 text-sm mb-1">
                    {b.workplacePhone}
                  </div>
                  <div className="text-gray4 text-md font-bold">
                    {b.workplaceDescription}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                  className="ml-2 p-2 rounded text-main2"
                  aria-label="사업장 삭제"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6 text-main"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full px-4 py-4 bg-white">
        <button
          onClick={() => router.push("/user/business/add-business/add")}
          className="w-full flex items-center justify-center gap-2 bg-main text-gray1 font-semibold rounded-xl h-[60px] text-base"
        >
          <span className="font-semibold text-lg">사업장 등록</span>
        </button>
      </div>

      <ToastModal
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </>
  );
}
```

#### 📁 `app/user/business/add-business/WorkplaceListSkeleton.tsx` (새로 생성)

```tsx
export default function WorkplaceListSkeleton() {
  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-4 px-4 pb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 border border-gray2 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
      <div className="w-full px-4 py-4 bg-white">
        <div className="w-full h-[60px] bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </>
  );
}
```

---

### 2. React Query Prefetching (빠른 적용) ⭐⭐⭐⭐

서버 컴포넌트로 전환이 어려운 경우 프리패칭으로 개선할 수 있습니다.

#### 📁 `app/user/business/add-business/layout.tsx` (새로 생성)

```tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getWorkPlaces } from "@/src/lib/api/getWP";

export default async function AddBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  // 서버에서 프리패치
  await queryClient.prefetchQuery({
    queryKey: ["useGetWP"],
    queryFn: getWorkPlaces,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
```

---

### 3. Skeleton UI 개선 (즉시 적용 가능) ⭐⭐⭐

현재 페이지에서 로딩 상태를 개선하여 체감 속도를 향상시킵니다.

#### 기존 코드 수정

```tsx
// 기존 Loading 컴포넌트 대신 Skeleton UI 사용
if (isLoading) {
  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      <div className="flex-shrink-0">
        <Benner />
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-4 px-4 pb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 border border-gray2 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
      <div className="w-full px-4 py-4 bg-white">
        <div className="w-full h-[60px] bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
}
```

---

### 4. 이미지 최적화

#### 📁 `app/components/benner.tsx` 수정

```tsx
"use client";

import Image from "next/image";

export default function Benner() {
  return (
    <div className="flex justify-center items-center w-full h-40 overflow-hidden px-4">
      <Image
        src="/benner.png"
        alt="배너 일러스트"
        width={400}
        height={160}
        priority
        quality={85}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

---

### 5. API 서버 최적화 체크리스트

백엔드 성능도 확인이 필요합니다:

- [ ] `/api/business-owner/workplaces` 응답 시간 확인 (Network 탭)
- [ ] 데이터베이스 쿼리 최적화
  - [ ] 적절한 인덱스 설정
  - [ ] N+1 쿼리 문제 해결
  - [ ] 불필요한 JOIN 제거
- [ ] 캐싱 구현 (Redis)
- [ ] 응답 데이터 최소화 (필요한 필드만 반환)

#### 백엔드 예시 (참고)

```kotlin
// 기존: 모든 필드 로드
@GetMapping("/workplaces")
fun getWorkplaces(): WorkPlacesResponse

// 개선: 필요한 필드만 로드 (DTO Projection)
@Query("""
    SELECT new WorkplaceListDto(
        w.id, w.workplaceName, w.workplacePhone,
        w.workplaceDescription
    )
    FROM WorkplaceEntity w
    WHERE w.businessOwnerId = :businessOwnerId
    AND w.isActive = true
""")
fun findWorkplacesByBusinessOwnerId(businessOwnerId: Long): List<WorkplaceListDto>
```

---

## 📊 예상 개선 효과

| 방법                  | 예상 LCP       | 난이도    | 효과       | 구현 시간 |
| --------------------- | -------------- | --------- | ---------- | --------- |
| **Server Components** | **1.5~2.5초**  | 중간      | ⭐⭐⭐⭐⭐ | 2~3시간   |
| Prefetching           | 2.5~4초        | 쉬움      | ⭐⭐⭐⭐   | 30분      |
| Skeleton UI           | 3~5초 (체감↑)  | 매우 쉬움 | ⭐⭐⭐     | 15분      |
| 이미지 최적화         | 0.2~0.5초 개선 | 매우 쉬움 | ⭐⭐       | 5분       |
| API 최적화            | 상황에 따라    | 어려움    | ⭐⭐⭐⭐⭐ | 1~2시간   |

---

## 🚀 권장 구현 순서

### Phase 1: 즉시 적용 (30분 이내)

1. ✅ **Skeleton UI 적용** (체감 속도 개선)
2. ✅ **이미지 최적화** (작은 개선)

### Phase 2: 중기 개선 (2~3시간)

3. ✅ **Server Components 전환** (근본적 해결)
4. ✅ **API 응답 시간 측정** (병목 지점 파악)

### Phase 3: 장기 최적화 (필요시)

5. ✅ **백엔드 쿼리 최적화**
6. ✅ **캐싱 전략 구현**

---

## 🔍 성능 측정 방법

### Chrome DevTools

```bash
# Lighthouse 실행
1. Chrome DevTools 열기 (F12)
2. Lighthouse 탭 선택
3. "Performance" 체크
4. "Analyze page load" 클릭
```

### 웹에서 측정

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

---

## 📝 체크리스트

- [ ] Skeleton UI 적용
- [ ] Server Components로 전환
- [ ] 이미지 최적화 완료
- [ ] API 응답 시간 2초 이하
- [ ] LCP 2.5초 이하 달성
- [ ] 모바일 환경 테스트 완료

---

## 🎯 목표 Core Web Vitals

| 지표    | 목표    | 현재 | 개선 후 예상 |
| ------- | ------- | ---- | ------------ |
| **LCP** | < 2.5s  | 9.7s | **1.5~2.5s** |
| **FID** | < 100ms | -    | < 100ms      |
| **CLS** | < 0.1   | -    | < 0.1        |

---

## 📚 참고 자료

- [Next.js App Router 공식 문서](https://nextjs.org/docs/app)
- [React Query Server Components](https://tanstack.com/query/latest/docs/react/guides/advanced-ssr)
- [Web.dev - LCP 최적화](https://web.dev/optimize-lcp/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**작성일**: 2024년 12월  
**대상 페이지**: `/user/business/add-business/page.tsx`  
**작성자**: WorkSnap Development Team
