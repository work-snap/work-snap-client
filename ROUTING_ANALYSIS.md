# 🗺️ Work-Snap 라우팅 구조 분석

> 작성일: 2025-10-05
> 작성자: Claude Code

---

## 📑 목차

1. [디렉토리 구조](#1-디렉토리-구조)
2. [라우팅 결정 로직](#2-라우팅-결정-로직)
3. [사용자 타입별 접근 권한](#3-사용자-타입별-접근-권한)
4. [자동 라우팅 시스템](#4-자동-라우팅-시스템)
5. [주요 발견 사항](#5-주요-발견-사항)
6. [권장 사항](#6-권장-사항)

---

## 1. 디렉토리 구조

### Next.js App Router 기반 라우팅

```
src/app/
│
├── 📂 / (홈)
│   └── page.tsx                                    # 비로그인 사용자 랜딩 페이지
│
├── 📂 /kakao-login
│   └── page.tsx                                    # 카카오 로그인 OAuth 콜백
│
├── 📂 /signup (회원가입 플로우)
│   ├── page.tsx                                    # 사용자 타입 선택 (PENDING 사용자)
│   │
│   ├── 📂 /business (사업자 회원가입)
│   │   ├── /signup-1                              # 1단계: 사업자 등록번호 입력
│   │   ├── /info                                  # 2단계: 사업자 정보 입력
│   │   ├── /success-signup                        # 3단계: 가입 완료
│   │   ├── /reviewing                             # 검토 중 안내 페이지
│   │   └── /re-authentication                     # 재인증 페이지 (REJECTED 상태)
│   │
│   └── 📂 /ptjob (알바생 회원가입)
│       └── page.tsx                                # 알바생 가입 완료
│
├── 📂 /user (로그인 사용자 전용)
│   │
│   ├── 📂 /business (사업자 전용 - APPROVED/VERIFIED)
│   │   ├── /add-business                          # 사업장 관리 (기본 페이지)
│   │   │   ├── /add                               # 신규 사업장 추가
│   │   │   └── /detail                            # 사업장 상세
│   │   │       └── /register-parttimer            # 알바생 등록
│   │   ├── /mainpage                              # 사업자 메인 대시보드
│   │   ├── /edit-employee                         # 직원 정보 수정
│   │   └── /mypage                                # 사업자 마이페이지
│   │       └── /change/user_type                  # 사용자 타입 변경
│   │
│   └── 📂 /ptjob (알바생 전용)
│       ├── /job-list                              # 구인 공고 목록 (기본 페이지)
│       ├── /add-work                              # 근무 추가
│       └── /mypage                                # 알바생 마이페이지
│           └── /change/user_type                  # 사용자 타입 변경
│
├── 📂 /admin (관리자 전용)
│   ├── page.tsx                                    # 관리자 대시보드
│   ├── /users                                     # 사용자 관리
│   └── /system                                    # 시스템 설정
│
└── 📂 /attendance (근태 관리)
    ├── page.tsx                                    # 근태 메인
    ├── /check-in                                  # 출퇴근 체크
    ├── /calendar                                  # 근무 캘린더
    ├── /records                                   # 근무 기록
    └── /add-work                                  # 근무 추가
```

---

## 2. 라우팅 결정 로직

### 2.1 라우팅 결정 흐름도

```mermaid
graph TD
    A[사용자 접속] --> B{로그인 여부}

    B -->|비로그인| C[/ 홈페이지]

    B -->|로그인| D{userRole 확인}

    D -->|ADMIN/SUPER_ADMIN| E[모든 경로 접근 가능]
    E --> E1[기본: /admin]

    D -->|USER| F{userType 확인}

    F -->|PENDING| G[/signup]

    F -->|BUSINESS_OWNER| H{businessVerificationStatus}

    H -->|null/NOT_REQUESTED/PENDING| I{현재 경로}
    I -->|/signup/business/**| I1[현재 경로 유지]
    I -->|그 외| I2[/signup/business/signup-1]

    H -->|REJECTED| J[/signup/business/re-authentication]

    H -->|REVIEWING| K[/signup/business/reviewing]

    H -->|APPROVED/VERIFIED| L{현재 경로}
    L -->|/user/business/**| L1[현재 경로 유지]
    L -->|그 외| L2[/user/business/add-business]

    F -->|PART_TIME_WORKER| M{현재 경로}
    M -->|/user/ptjob/** or /signup/ptjob| M1[현재 경로 유지]
    M -->|그 외| M2[/user/ptjob/job-list]
```

### 2.2 코드 구현 위치

| 기능 | 파일 경로 | 함수/메서드 |
|------|----------|------------|
| 라우팅 결정 로직 | `src/stores/userStore.ts` | `getRequiredRoute()` |
| 자동 리다이렉트 실행 | `src/stores/userStore.ts` | `handleRouting()` |
| 라우팅 트리거 관리 | `src/hooks/useAutoRouting.ts` | `useAutoRouting()` |

---

## 3. 사용자 타입별 접근 권한

### 3.1 권한 매트릭스

| 사용자 타입 | 인증 상태 | 허용 경로 | 기본 리다이렉트 | 설명 |
|------------|---------|----------|----------------|------|
| **비로그인** | - | `/`<br>`/kakao-login` | `/` | 로그인 전 접근 가능 |
| **PENDING** | - | `/signup` | `/signup` | 사용자 타입 미선택 |
| **BUSINESS_OWNER** | `NOT_REQUESTED` | `/signup/business/**` | `/signup/business/signup-1` | 사업자 인증 신청 전 |
| **BUSINESS_OWNER** | `PENDING` | `/signup/business/**` | `/signup/business/signup-1` | 사업자 인증 대기 중 |
| **BUSINESS_OWNER** | `REJECTED` | `/signup/business/re-authentication` | `/signup/business/re-authentication` | 사업자 인증 거부됨 |
| **BUSINESS_OWNER** | `REVIEWING` | `/signup/business/reviewing` | `/signup/business/reviewing` | 사업자 인증 검토 중 |
| **BUSINESS_OWNER** | `APPROVED`<br>`VERIFIED` | `/user/business/**` | `/user/business/add-business` | 사업자 인증 완료 |
| **PART_TIME_WORKER** | - | `/user/ptjob/**`<br>`/signup/ptjob` | `/user/ptjob/job-list` | 알바생 |
| **ADMIN**<br>**SUPER_ADMIN** | - | `**` (모든 경로) | `/admin` | 관리자 |

### 3.2 사업자 인증 상태 플로우

```
1. 회원가입 (카카오 로그인)
   ↓
2. userType 선택 → BUSINESS_OWNER
   ↓
3. businessVerificationStatus = NOT_REQUESTED
   → /signup/business/signup-1 (사업자 등록번호 입력)
   ↓
4. /signup/business/info (사업자 정보 입력)
   ↓
5. /signup/business/success-signup (제출 완료)
   ↓
6. businessVerificationStatus = PENDING → REVIEWING
   → /signup/business/reviewing (관리자 검토 대기)
   ↓
7-A. APPROVED/VERIFIED
   → /user/business/add-business (사업장 등록)

7-B. REJECTED
   → /signup/business/re-authentication (재인증 필요)
```

---

## 4. 자동 라우팅 시스템

### 4.1 트리거 조건 (`useAutoRouting.ts`)

```typescript
// useEffect dependencies
[user, isLoading, pathname]

// 라우팅 실행 조건
shouldRoute =
  userChanged ||                    // ✅ 사용자 정보가 변경됨
  (!prevUserRef.current && user) || // ✅ 로그인됨
  (prevUserRef.current && !user)    // ✅ 로그아웃됨

// shouldRoute === true일 때만 handleRouting() 호출
```

### 4.2 리다이렉트 방지 로직 (`userStore.handleRouting`)

```typescript
// 1️⃣ 디바운싱 (300ms)
if (now - lastRedirectTime < 300) return;

// 2️⃣ 현재 경로 === 필요한 경로
if (pathname === requiredRoute) return;

// 3️⃣ 현재 경로가 필요한 경로의 하위 경로
if (pathname.startsWith(requiredRoute + "/")) return;

// 4️⃣ 리다이렉트 실행
router.push(requiredRoute);
set({ lastRedirectTime: now });
```

### 4.3 최근 수정 사항 (무한 루프 방지)

#### ❌ 수정 전 (문제 발생)
```typescript
// pathname이 변경될 때마다 무조건 handleRouting() 호출
handleRouting(); // ← 무한 루프 원인!

if (shouldRoute) {
  // 500ms 후 재체크
  setTimeout(() => handleRouting(), 500);
}
```

#### ✅ 수정 후 (해결)
```typescript
// shouldRoute가 true일 때만 호출
if (shouldRoute) {
  handleRouting();

  // 500ms 후 재체크
  setTimeout(() => handleRouting(), 500);
} else {
  console.log("라우팅 체크 스킵");
}
```

---

## 5. 주요 발견 사항

### ✅ 정상 동작 확인

1. **경로 허용 로직 개선됨**
   - `/signup/business/**` 하위 경로들 정상 인식
   - `/user/business/**`, `/user/ptjob/**` 하위 경로 유지

2. **디바운싱 적용**
   - 300ms 내 중복 리다이렉트 방지
   - `shouldRoute` 조건 개선으로 무한 루프 방지

3. **관리자 권한 분리**
   - `ADMIN`, `SUPER_ADMIN`은 모든 경로 접근 가능

### ⚠️ 잠재적 문제점

#### 1. **사업자 등록 플로우 경로 접근 제어 미흡**

현재 `NOT_REQUESTED` 상태에서 `/signup/business/**` 모든 경로 접근 가능:

```typescript
// 현재 로직
if (currentPath?.startsWith("/signup/business/")) {
  return currentPath; // 모든 하위 경로 허용
}
```

**문제:**
- 사용자가 URL을 직접 입력하면 순서를 건너뛸 수 있음
- 예: `signup-1` 건너뛰고 `/signup/business/success-signup` 직접 접근 가능

**권장:**
```typescript
// 상태별 허용 경로 명시
const allowedPaths = {
  NOT_REQUESTED: ['/signup/business/signup-1', '/signup/business/info'],
  PENDING: ['/signup/business/reviewing']
};
```

#### 2. **하위 경로 체크 로직의 일관성 문제**

```typescript
// userStore.ts:352
if (pathname.startsWith(requiredRoute + "/")) {
  return; // 리다이렉트 안함
}
```

**예시:**
- `pathname = /user/business/mypage`
- `requiredRoute = /user/business/add-business`
- → `startsWith` 조건 불일치 → 리다이렉트 발생

**의도한 동작인지 확인 필요:**
- 사업자는 `/user/business/add-business`를 거쳐야만 다른 페이지 접근 가능?
- 아니면 `/user/business/**` 모든 경로 자유 접근?

#### 3. **알바생 `/signup/ptjob` 처리**

- 허용 경로로 설정되어 있으나 실제 플로우 불명확
- `PART_TIME_WORKER` 타입 선택 후 즉시 `/user/ptjob/job-list`로 이동하는지?

---

## 6. 권장 사항

### 6.1 사업자 등록 플로우 순서 명확화

```typescript
getRequiredRoute: (currentPath?: string): string => {
  // ...

  case "BUSINESS_OWNER":
    const status = user.businessVerificationStatus;

    // ✅ 상태별 허용 경로 명시
    if (status === "NOT_REQUESTED") {
      const signupFlowPaths = [
        "/signup/business/signup-1",
        "/signup/business/info",
        "/signup/business/success-signup"
      ];

      if (signupFlowPaths.includes(currentPath)) {
        return currentPath;
      }
      return "/signup/business/signup-1";
    }

    if (status === "PENDING" || status === "REVIEWING") {
      return "/signup/business/reviewing";
    }

    // ...
}
```

### 6.2 페이지 레벨 권한 체크 추가

각 `page.tsx`에서 추가 검증:

```typescript
// app/signup/business/success-signup/page.tsx
"use client";

import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuccessSignupPage() {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // 사업자 정보 제출 전이면 리다이렉트
    if (!user?.businessRegistrationNumber) {
      router.push("/signup/business/signup-1");
    }
  }, [user, router]);

  // ...
}
```

### 6.3 라우팅 문서화 자동화

```typescript
// src/lib/routing/routes.ts
export const ROUTES = {
  HOME: "/",
  SIGNUP: {
    INDEX: "/signup",
    BUSINESS: {
      STEP1: "/signup/business/signup-1",
      INFO: "/signup/business/info",
      SUCCESS: "/signup/business/success-signup",
      REVIEWING: "/signup/business/reviewing",
      RE_AUTH: "/signup/business/re-authentication"
    },
    PTJOB: "/signup/ptjob"
  },
  USER: {
    BUSINESS: {
      ADD_BUSINESS: "/user/business/add-business",
      MAINPAGE: "/user/business/mainpage",
      // ...
    },
    PTJOB: {
      JOB_LIST: "/user/ptjob/job-list",
      // ...
    }
  },
  ADMIN: "/admin"
} as const;
```

### 6.4 디버깅 콘솔 로그 정리

현재 과도한 로그 출력 → 프로덕션 빌드에서 제거 필요:

```typescript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === "development") {
  console.log("[ZUSTAND] 🔄 라우팅 체크");
}
```

---

## 📌 요약

### 현재 상태
- ✅ 기본 라우팅 시스템 정상 동작
- ✅ 무한 루프 문제 해결 완료
- ✅ 사용자 타입별 기본 권한 분리

### 개선 필요
- ⚠️ 사업자 등록 플로우 순서 강제 필요
- ⚠️ 페이지 레벨 권한 검증 추가
- ⚠️ 하위 경로 접근 정책 명확화

### 다음 단계
1. 상태별 허용 경로 화이트리스트 구현
2. 페이지 레벨 가드 추가
3. 라우팅 상수 정의 및 타입 안정성 확보
4. E2E 테스트로 라우팅 플로우 검증

---

**문서 버전:** 1.0
**마지막 업데이트:** 2025-10-05
**담당:** Claude Code
