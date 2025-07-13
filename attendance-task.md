# WorkSnap 근무 기록 시스템 세부 구현 과제표 (attendance-task)

본 문서는 **`attendance-create.md`** 에서 정의한 큰 틀의 로드맵을 세분화하여 _Phase → Epic → Task_ 구조로 문서화한 것입니다. 각 Task 는 명확한 산출물과 우선순위를 가지며, 완료 시 GitHub Issue/PR 과 연동해 관리합니다.

> ⚠️ **기간 기준**: Week 1 = 프로젝트 킥오프 주차 (YYYY-MM-DD 기준).<br/>
> ⚡ **병렬**: 백·프론트 동시에 진행 가능 Task.

---

## Phase 0 : 프로젝트 기반 준비 (D-1 ~ D0) ✅

| Epic            | Task                                                                                                        | 산출물                                         | 우선도 |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| 패키지 & 빌드   | `package.json` 의 dependency 정확 버전 고정 (`next@15.3.3`, `@tanstack/react-query@5`, `axios`, `date-fns`) | 커밋 `chore(deps): lock core package versions` | ★★★    |
|                 | `tsconfig.json` strict 옵션 검수 + `paths` alias 추가                                                       | PR `docs: update tsconfig with path aliases`   | ★★☆    |
| 글로벌 Provider | `customProvider.tsx` 내 `QueryClientProvider` → `ThemeProvider` 순서 확인                                   | 코드 리뷰 승인                                 | ★★★    |
| CI 파이프라인   | GitHub Action: `npm run lint && npm run typecheck && npm run test`                                          | `.github/workflows/ci.yml`                     | ★★☆    |

---

## Phase 1 : 데이터 구조 & 타입 정의 (Week 1) ✅

| Epic                  | Task                                                                                                       | 산출물                                          | 우선도 |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 프론트 타입 통합      | `src/app/attendance/lib/types.ts` 새로 작성 → `WorkSchedule`, `Attendance`, `AttendanceCardViewModel` 정의 | 커밋 `feat(types): add attendance domain types` | ★★★    |
| 백엔드 엔티티 확장 ⚡ | `AttendanceEntity` → `isAdditionalWork` 컬럼                                                               | Migration `V1_1__add_isAdditionalWork.sql`      | ★★★    |
|                       | `WorkScheduleEntity` → `isOvernight`, `nextDayEndTime` 컬럼                                                | 동일 Migration                                  | ★★★    |
| API 스펙 & Swagger    | `/api/v1/attendance/daily` 응답 예시 yaml 작성                                                             | `attendance-api.yaml` + Swagger UI 반영         | ★★☆    |

---

## Phase 2 : 컴포넌트 리팩토링 (Week 1 ~ Week 2) ✅

| Epic            | Task                                                                                        | 산출물                                         | 우선도 |
| --------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| 카드 분리       | `AttendanceCard` 를 `WorkplaceInfo`, `TimeDisplay`, `StatusMessage`, `ActionButton` 로 분리 | PR `refactor(ui): split AttendanceCard`        | ★★★    |
| 시간 관리 유틸  | `useTimeManagement.ts` (HH:mm 포맷, 야간 판별, duration 계산)                               | 커밋 `feat(utils): add useTimeManagement hook` | ★★★    |
| 날짜 네비게이션 | `DateNavigation.tsx` → 달력 팝오버 + 모바일 스와이프                                        | Demo GIF 포함 PR                               | ★★☆    |
| 디자인 시스템   | Tailwind 프리셋 색상만 사용 검증 (ESLint custom rule)                                       | `.eslintrc` 업데이트                           | ★★☆    |

---

## Phase 3 : 상태 관리 & API 연동 (Week 3 ~ Week 4) ✅

| Epic               | Task                                                                                 | 산출물                                           | 우선도 |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------ | ------ |
| Query 세팅         | `useDailyAttendance(date)` 쿼리 작성 (Stale 5m)                                      | 커밋 `feat(query): implement useDailyAttendance` | ★★★    |
| Mutations          | `clockIn`, `clockOut`, `createAdditionalWork` Optimistic Update                      | PR `feat(api): add attendance mutations`         | ★★★    |
| 상태 결정 로직     | `determineStatus`, `getStatusColor`, `getStatusMessage` 를 `utils/status.ts` 로 이동 | 커밋                                             | ★★☆    |
| 실시간 TimeContext | `TimeProvider` + `setInterval(1s)` → context 값 제공                                 | 커밋                                             | ★★☆    |

---

## Phase 4 : 추가 근무(Overtime) 기능 (Week 5) ✅

| Epic                | Task                                                      | 산출물                         | 우선도 |
| ------------------- | --------------------------------------------------------- | ------------------------------ | ------ |
| 모달 구현           | `AdditionalWorkModal` (Formik + Zod 검증)                 | PR `feat(overtime): add modal` | ★★★    |
| 백엔드 중복 검사 ⚡ | `AttendanceService.validateNoOverlap()` 로 시간 겹침 방지 | Unit Test 통과                 | ★★★    |
| 생성 플로우         | 성공 시 React Query invalidate + Toast                    | 커밋                           | ★★☆    |

---

## Phase 5 : 테스트 & 품질 (Week 6)

| Epic        | Task                                         | 산출물                   | 우선도 |
| ----------- | -------------------------------------------- | ------------------------ | ------ |
| 단위 테스트 | `timeUtils`, `determineStatus` 커버리지 100% | Jest 결과 리포트         | ★★★    |
| 통합 테스트 | `AttendanceCard` 렌더 → clock-in 동작        | RTL 테스트 파일          | ★★☆    |
| E2E         | Playwright: 모바일 근무 생성 ~ 종료          | `e2e/attendance.spec.ts` | ★★☆    |

---

## Phase 6 : 성능 & UX 최적화 (Week 7)

| Epic         | Task                                             | 산출물             | 우선도 |
| ------------ | ------------------------------------------------ | ------------------ | ------ |
| 가상 스크롤  | `react-window` 적용 (>1000개 카드)               | Performance report | ★★★    |
| 메모이제이션 | `React.memo`, `useMemo`, `useCallback` 범위 지정 | PR                 | ★★☆    |
| Lighthouse   | 모바일 PWA 점수 ≥ 90                             | 보고서 스크린샷    | ★★☆    |

---

## Phase 7 : 버그 픽스 & 배포 준비 (Week 8)

| Epic        | Task                                | 산출물                    | 우선도 |
| ----------- | ----------------------------------- | ------------------------- | ------ |
| QA & 접근성 | aria-label, 대비비 체크             | Axe 보고서 해결           | ★★★    |
| 빌드 & CI   | `npm run build` 통과 + tag `v1.0.0` | GitHub Release            | ★★★    |
| 문서화      | README, CHANGELOG, Demo GIF         | PR `docs: release v1.0.0` | ★★☆    |
| 배포        | Vercel Production 배포 & Smoke Test | 배포 로그                 | ★★☆    |

---

### 관리 방법

1. **GitHub Projects** 에서 Phase → Epic → Task 카드 트리 구성.<br/>
2. 모든 PR 은 커밋 컨벤션(`feat|fix|docs|refactor|test|chore(scope): message`) 준수.<br/>
3. Task 완료 시 Issue Close, PR Merge, Milestone Progress 갱신.

---

_Last updated: {{DATE}}_
