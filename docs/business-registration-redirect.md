# 사업자 등록 페이지 리다이렉트 기능

## 개요

사업자등록증을 이미 등록한 사용자가 다시 로그인할 때, 사업자 등록 페이지 대신 메인페이지로 자동 리다이렉트하는 기능을 구현하였습니다.

## 요구사항

- 사업자등록증이 이미 등록된 사용자는 사업자 등록 페이지(`/signup/business/signup-1`)에 접근하지 않음
- 자동으로 메인페이지(`/user/business/mainpage`)로 이동
- 사업자 정보 확인 중에는 별도의 로딩 화면 표시

## 구현 내용

### 1. 사업자 정보 확인 로직

#### API 사용

- **Primary**: `businessOwnerTestApis.getVerificationStatus()` - 사업자 검증 상태 확인
- **Fallback**: `businessOwnerTestApis.getBusinessOwner()` - 사업자 정보 존재 여부 확인

#### 확인 프로세스

```javascript
const checkBusinessOwnerStatus = async () => {
  try {
    // 1차: 사업자 검증 상태 확인
    const verificationResponse =
      await businessOwnerTestApis.getVerificationStatus();
    if (verificationResponse?.data) {
      router.replace("/user/business/mainpage");
      return;
    }
  } catch (verificationError) {
    // 2차: 사업자 정보 존재 여부 확인
    try {
      const businessOwnerResponse =
        await businessOwnerTestApis.getBusinessOwner();
      if (businessOwnerResponse?.data) {
        router.replace("/user/business/mainpage");
        return;
      }
    } catch (error) {
      // 모든 확인 실패 시 등록 페이지 유지
    }
  }
};
```

### 2. 상태 관리

#### 상태 변수

- `isCheckingBusinessOwner`: 사업자 정보 확인 중 상태
- `isPending`: 사업자등록증 업로드/분석 중 상태

#### 조건부 렌더링

```javascript
return (
  <>
    {isPending ? (
      // 사업자등록증 분석 중
      <LoadingAuthentication />
    ) : isCheckingBusinessOwner ? (
      // 사업자 정보 확인 중
      <Loading />
    ) : (
      // 일반 등록 페이지
      <BusinessRegistrationForm />
    )}
  </>
);
```

### 3. 로딩 컴포넌트

#### LoadingAuthentication

- **용도**: 사업자등록증 업로드 후 서버 분석 중
- **특징**: 사업자등록증 확인 관련 특화된 메시지 및 UI
- **파일**: `/src/app/components/loadingAuthentication.tsx`

#### Loading (새로 생성)

- **용도**: 일반적인 정보 확인 중
- **특징**: 심플한 로딩 스피너와 범용적인 메시지
- **파일**: `/src/app/components/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
      <div className="mb-6">
        <svg className="animate-spin h-12 w-12 text-main" /* ... */>
          {/* 로딩 스피너 */}
        </svg>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-[18px] font-semibold text-gray5 leading-tight mb-2">
          정보를 확인하고 있습니다
        </span>
        <span className="text-[14px] text-gray-400">잠시만 기다려주세요</span>
      </div>
    </div>
  );
}
```

## 사용자 플로우

### 시나리오 1: 신규 사업자

1. 로그인 → 사업자 등록 페이지 접근
2. 토큰 확인 → 사업자 정보 확인 API 호출 → 404/에러 응답
3. 사업자 등록 페이지 표시
4. 사업자등록증 업로드 및 등록 진행

### 시나리오 2: 기존 사업자 (등록증 이미 등록됨)

1. 로그인 → 사업자 등록 페이지 접근 시도
2. `Loading` 컴포넌트 표시 (사업자 정보 확인 중)
3. 사업자 정보 확인 API 호출 → 데이터 존재
4. **자동으로 메인페이지로 리다이렉트** (`/user/business/mainpage`)

### 시나리오 3: 로그인하지 않은 사용자

1. 사업자 등록 페이지 접근
2. 토큰 없음 → API 호출 건너뜀
3. 사업자 등록 페이지 표시

## 기술적 세부사항

### API 엔드포인트

- `GET /api/business-owner/verification-status` - 사업자 검증 상태 조회
- `GET /api/business-owner/info` - 사업자 정보 조회

### 에러 처리

- **404 에러**: 사업자 정보 없음 → 등록 페이지 유지
- **네트워크 에러**: 안전하게 등록 페이지 표시
- **인증 에러**: 토큰 확인 후 적절한 처리

### 라우팅

- `router.replace()` 사용으로 브라우저 히스토리에 등록 페이지 기록 남기지 않음
- 백버튼으로 등록 페이지 재접근 방지

## 개선 사항

### 성능 최적화

- React Query 캐싱 활용으로 중복 API 호출 방지
- 로딩 상태 최소화

### 사용자 경험

- 명확한 로딩 메시지로 현재 상태 안내
- 빠른 리다이렉트로 불필요한 페이지 노출 방지

### 보안

- 토큰 유효성 검사
- API 응답 데이터 검증

## 파일 구조

```
src/app/
├── components/
│   ├── loadingAuthentication.tsx  # 사업자등록증 분석 전용 로딩
│   └── loading.tsx               # 일반 정보 확인 로딩
├── signup/business/signup-1/
│   └── page.tsx                  # 사업자 등록 페이지 (리다이렉트 로직 포함)
└── user/business/mainpage/
    └── page.tsx                  # 사업자 메인페이지 (리다이렉트 대상)
```

## 테스트 시나리오

### 기능 테스트

1. [ ] 신규 사업자: 등록 페이지 정상 표시
2. [ ] 기존 사업자: 메인페이지로 자동 리다이렉트
3. [ ] 비로그인 사용자: 등록 페이지 정상 표시
4. [ ] 네트워크 오류 시: 등록 페이지 안전하게 표시

### UI/UX 테스트

1. [ ] 로딩 화면 적절한 시간 표시
2. [ ] 리다이렉트 시 깜빡임 없이 자연스러운 전환
3. [ ] 에러 상황에서도 사용자 경험 저해 없음

## 향후 개선 방향

1. **캐시 전략**: React Query로 사업자 정보 캐싱 개선
2. **오프라인 대응**: 네트워크 상태에 따른 fallback 처리
3. **성능 모니터링**: 리다이렉트 성능 지표 추가
4. **A/B 테스트**: 로딩 화면 최적화

---

_작성일: 2024년 12월_  
_작성자: WorkSnap 개발팀_
