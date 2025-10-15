# 🚨 LCP 최적화 문제 해결 가이드

## 현재 상황

- **최적화 전**: 5.9초
- **최적화 후**: 6.0초
- **문제**: 최적화가 오히려 역효과

---

## ✅ 적용된 최적화 (2차)

### 1. 이미지 Preload 제거

**이유**: 리소스 경쟁으로 오히려 지연 발생 가능

```diff
- <link rel="preload" href="/benner.png" as="image" />
```

### 2. loading.tsx 추가

**효과**: Next.js 자동 Suspense 경계 생성

```typescript
// src/app/user/business/add-business/loading.tsx
```

### 3. 불필요한 디버그 로그 제거

**효과**: 메인 스레드 부하 감소

```diff
- console.log("🌐 API 요청:", {...})
- console.log("✅ API 응답:", {...})
```

### 4. 페이지 구조 개선

**효과**: 불필요한 조기 리턴 제거, 단일 렌더 트리

```typescript
// Before: 3개의 early return
// After: 조건부 렌더링
```

---

## 🔍 필수 확인 사항

### 1. API 응답 시간 확인 ⭐⭐⭐⭐⭐

콘솔에서 다음을 확인하세요:

```
📊 API 성능 측정: {
  duration: "???ms"  ← 이 값이 중요!
}
```

**판정 기준**:

- ✅ < 500ms → API는 정상
- ⚠️ 500ms ~ 1000ms → API 개선 권장
- ❌ > 1000ms → **API가 병목! 백엔드 최적화 필수**

---

### 2. Network 탭에서 워터폴 분석

#### Chrome DevTools에서 확인:

```bash
1. F12 → Network 탭
2. 페이지 새로고침 (Ctrl + Shift + R)
3. "Waterfall" 컬럼 확인
```

**확인할 항목**:

```
benner.png          ← 이미지 로딩 시간
/api/.../workplaces ← API 요청 시간 ⭐
```

#### 워터폴 예시 분석:

```
|--- HTML (0-100ms)
  |--- benner.png (100-300ms)    ← 200ms
    |--- API (300-1300ms)        ← 1000ms ⚠️ 병목!
      |--- 렌더링 (1300-1500ms)
```

만약 API가 **1초 이상**이면 → **백엔드 최적화 필수**

---

### 3. Lighthouse 상세 분석

```bash
1. F12 → Lighthouse 탭
2. "Performance" 체크
3. "Analyze page load" 클릭
4. "View Trace" 클릭
```

**확인할 지표**:

- **LCP Element**: 어떤 요소가 LCP인지 확인
- **LCP Phases**:
  - Time to first byte (TTFB)
  - Resource load delay
  - Resource load time
  - Element render delay

---

## 🎯 근본 원인 분석

### 원인 1: API 응답이 느림 (가장 가능성 높음)

**증상**:

- 콘솔에서 API duration > 1000ms
- Network 탭에서 API 요청이 오래 걸림

**해결**:

```kotlin
// work-snap-server 최적화 필요
// 1. 데이터베이스 쿼리 최적화
// 2. 불필요한 JOIN 제거
// 3. 캐싱 적용
```

---

### 원인 2: 클라이언트 사이드 렌더링 지연

**증상**:

- API는 빠른데 화면 표시가 느림
- React Query가 데이터를 가져온 후 렌더링 지연

**해결**:

```typescript
// 서버 컴포넌트 전환 (근본 해결책)
// 하지만 localStorage 문제로 현재 불가능
```

---

### 원인 3: customProvider의 isClient 체크

**증상**:

- 초기 렌더링 시 아무것도 표시 안 됨
- hydration 후에야 컨텐츠 표시

**현재 상태**:

```typescript
if (!isClient) {
  return null; // 최적화됨
}
```

---

## 🚀 추가 최적화 방안

### 방안 1: API 병렬 처리 (즉시 적용 가능)

현재 문제가 **여러 API 호출**이라면:

```typescript
// Before: 순차 호출
const data1 = await api1();
const data2 = await api2();

// After: 병렬 호출
const [data1, data2] = await Promise.all([api1(), api2()]);
```

---

### 방안 2: 백엔드 캐싱 (효과 ⭐⭐⭐⭐⭐)

```kotlin
// work-snap-server/src/main/kotlin/.../BusinessOwnerController.kt

@GetMapping("/workplaces")
@Cacheable(
    value = ["workplaces"],
    key = "#businessOwnerId",
    unless = "#result == null"
)
fun getWorkplaces(
    @AuthenticationPrincipal businessOwnerId: Long
): ResponseEntity<WorkPlacesResponse> {
    val workplaces = workplaceService.getWorkplaces(businessOwnerId)
    return ResponseEntity.ok(workplaces)
}
```

**설정 필요**:

```kotlin
// application.yml
spring:
  cache:
    type: simple  # 또는 redis
```

**예상 효과**: API 응답 시간 **80~95% 감소** (1000ms → 50~200ms)

---

### 방안 3: DTO Projection (백엔드 최적화)

**문제**: 불필요한 데이터까지 로드

```kotlin
// Before: 모든 필드 로드
interface WorkplaceRepository : JpaRepository<WorkplaceEntity, Long> {
    fun findByBusinessOwnerId(id: Long): List<WorkplaceEntity>
}

// After: 필요한 필드만 로드
@Query("""
    SELECT new WorkplaceListDto(
        w.id,
        w.workplaceName,
        w.workplacePhone,
        w.workplaceDescription
    )
    FROM WorkplaceEntity w
    WHERE w.businessOwnerId = :businessOwnerId
    AND w.isActive = true
""")
fun findWorkplaceSummariesByBusinessOwnerId(
    @Param("businessOwnerId") businessOwnerId: Long
): List<WorkplaceListDto>
```

**예상 효과**: 쿼리 시간 30~50% 감소

---

### 방안 4: 데이터베이스 인덱스 (백엔드 최적화)

```kotlin
@Entity
@Table(
    name = "workplaces",
    indexes = [
        Index(name = "idx_business_owner_id", columnList = "businessOwnerId"),
        Index(name = "idx_is_active", columnList = "isActive"),
        Index(name = "idx_composite", columnList = "businessOwnerId, isActive")
    ]
)
class WorkplaceEntity { ... }
```

**예상 효과**: 쿼리 시간 50~80% 감소

---

## 📊 실제 측정 결과 공유 요청

다음 정보를 공유해주세요:

### 1. 콘솔 로그

```
📊 API 성능 측정: {
  duration: "???ms"  ← 이 값
}
```

### 2. Network 탭 스크린샷

- `/api/business-owner/workplaces` 요청의 **Timing** 탭

### 3. Lighthouse 점수

- LCP 상세 분석 결과

---

## ✅ 체크리스트

현재 상황을 체크해주세요:

- [ ] API 응답 시간 확인 완료 (콘솔 로그)
- [ ] Network 워터폴 분석 완료
- [ ] Lighthouse 상세 분석 완료
- [ ] API 응답 시간 < 500ms
- [ ] 백엔드 서버가 localhost:8080에서 실행 중
- [ ] 인터넷 연결 상태 양호
- [ ] 다른 탭에서 무거운 작업 없음

---

## 🔧 즉시 테스트할 수 있는 것

### 테스트 1: 캐싱 효과 확인

```bash
1. 페이지 첫 방문 (시간 측정)
2. 다른 페이지로 이동
3. 5분 이내 다시 방문 (시간 측정)
```

**예상 결과**: 2번째 방문은 훨씬 빨라야 함 (캐시 적용)

---

### 테스트 2: 백엔드 응답 직접 확인

```bash
# 터미널에서 실행
curl -X GET "http://localhost:8080/api/business-owner/workplaces" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

**판정**:

- < 0.5초 → 백엔드는 정상
- > 1초 → 백엔드 최적화 필수

---

## 💡 최종 권장 사항

### 즉시 시도:

1. ✅ API 응답 시간 확인
2. ✅ 백엔드 로그 확인 (쿼리 시간)
3. ✅ 데이터베이스 쿼리 분석

### 단기 (1~2시간):

4. ✅ 백엔드 캐싱 적용
5. ✅ 데이터베이스 인덱스 추가

### 장기 (1~2일):

6. ⏳ DTO Projection으로 전환
7. ⏳ 쿠키 기반 인증으로 전환 (서버 컴포넌트 가능)

---

**다음 단계**: 위 체크리스트를 확인하고 API 응답 시간을 알려주세요!
