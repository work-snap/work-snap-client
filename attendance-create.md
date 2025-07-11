# WorkSnap 근무 기록 시스템 구현 계획

## 1. 데이터 구조

### 스케줄 엔티티

```typescript
interface WorkSchedule {
  id: number;
  workplaceId: number; // 사업장 ID
  workplaceName: string; // 사업장 이름
  scheduleDate: string; // 스케줄 날짜
  startTime: string; // 시작 시간
  endTime: string; // 종료 시간
  isOvernight: boolean; // 야간 근무 여부
  nextDayEndTime?: string; // 다음날 종료 시간 (야간 근무시)
}
```

### 근무 기록 엔티티

```typescript
interface Attendance {
  id: number;
  scheduleId: number; // 연관된 스케줄 ID
  workplaceId: number; // 사업장 ID
  actualStartTime?: string; // 실제 출근 시간
  actualEndTime?: string; // 실제 퇴근 시간
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"; // 근무 상태
  isAdditionalWork: boolean; // 추가 근무 여부
}
```

### 근무 카드 뷰 모델

```typescript
interface AttendanceCardViewModel {
  id: number;
  workplaceName: string; // 사업장 이름
  scheduleDate: string; // 근무 날짜
  scheduleStartTime: string; // 예정 시작 시간
  scheduleEndTime: string; // 예정 종료 시간
  actualStartTime?: string; // 실제 출근 시간
  actualEndTime?: string; // 실제 퇴근 시간
  currentTime?: string; // 현재 시간
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"; // 근무 상태
  isOvernight: boolean; // 야간 근무 여부
  nextDayEndTime?: string; // 다음날 종료 시간
  statusMessage: string; // 상태 메시지
  cardColor: string; // 카드 색상
  isAdditionalWork: boolean; // 추가 근무 여부
}
```

## 2. API 엔드포인트

### 핵심 엔드포인트

```kotlin
// 스케줄 & 근무 기록 통합 엔드포인트
@GetMapping("/api/v1/attendance/daily")
fun getDailyAttendanceWithSchedule(
    @RequestParam date: LocalDate
): List<AttendanceCardViewModel>

@PostMapping("/api/v1/attendance/{scheduleId}/clock-in")
fun clockIn(
    @PathVariable scheduleId: Long,
    @RequestBody request: ClockInRequest
): AttendanceResponse

@PostMapping("/api/v1/attendance/{scheduleId}/clock-out")
fun clockOut(
    @PathVariable scheduleId: Long,
    @RequestBody request: ClockOutRequest
): AttendanceResponse

@PostMapping("/api/v1/attendance/additional")
fun createAdditionalWork(
    @RequestBody request: AdditionalWorkRequest
): AttendanceResponse
```

## 3. 컴포넌트 구조

```
근무페이지/
├── 날짜네비게이션/
├── 근무목록/
│   ├── 근무카드/
│   │   ├── 사업장정보
│   │   ├── 시간표시
│   │   │   ├── 스케줄시간
│   │   │   └── 실제시간
│   │   ├── 상태메시지
│   │   └── 액션버튼
│   └── 빈화면
└── 추가근무모달/
```

## 4. 상태 및 색상 관리

### 상태 로직

```typescript
const determineStatus = (
  schedule: WorkSchedule,
  attendance?: Attendance,
  currentTime: Date
): AttendanceStatus => {
  if (!attendance?.actualStartTime) {
    return "PENDING"; // 근무 전
  }
  if (attendance.actualStartTime && !attendance.actualEndTime) {
    return "IN_PROGRESS"; // 근무 중
  }
  return "COMPLETED"; // 근무 완료
};

const getStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case "COMPLETED":
      return "#FA6956"; // 근무 완료 색상
    case "IN_PROGRESS":
      return "#6994E9"; // 근무 중 색상
    case "PENDING":
      return "#F3F3F3"; // 근무 전 색상
  }
};
```

### 상태 메시지

```typescript
const getStatusMessage = (status: AttendanceStatus): string => {
  switch (status) {
    case "PENDING":
      return "아직 출근 전입니다";
    case "IN_PROGRESS":
      return "열심히 일하고 있어요";
    case "COMPLETED":
      return "오늘 업무 완료";
  }
};
```

## 5. 구현 단계

### 1단계: 핵심 구조

1. 기본 데이터 구조 및 API 엔드포인트 설정
2. 정적 데이터를 사용한 기본 카드 컴포넌트 구현
3. 날짜 네비게이션 추가

### 2단계: 시간 관리

1. 스케줄 시간 표시 구현
2. 현재 시간 추적 기능 추가
3. 실제 출/퇴근 시간 처리
4. 야간 근무 로직 구현

### 3단계: 상태 및 액션

1. 상태 결정 로직 추가
2. 색상 스키마 구현
3. 액션 버튼 추가
4. 상태 메시지 처리

### 4단계: 추가 기능

1. 추가 근무 생성 구현
2. 시간 중복 체크 기능 추가
3. 시간순 카드 정렬 구현
4. 사업장 정보 표시 추가

### 5단계: 완성도 향상 및 최적화

1. 로딩 상태 추가
2. 에러 처리 구현
3. 상태 변경 애니메이션 추가
4. 성능 최적화
5. 종합 테스트 추가

## 6. 주요 고려사항

### 시간 처리

- moment.js 또는 date-fns를 사용한 일관된 시간 처리
- UTC 형식으로 시간 저장
- 표시용 로컬 시간 변환
- 시간대 차이 적절히 처리

### 상태 관리

- React Query를 사용한 서버 상태 관리
- 더 나은 사용자 경험을 위한 낙관적 업데이트 구현
- 일일 스케줄 및 근무 데이터 캐싱
- 현재 시간 실시간 업데이트

### 성능

- 대량 목록을 위한 가상 스크롤 구현
- React.memo를 통한 리렌더링 최적화
- 목록 항목을 위한 적절한 key props 사용
- 적절한 로딩 상태 구현

### 에러 처리

- 적절한 에러 경계 구현
- 사용자 친화적인 에러 메시지 표시
- 실패한 API 호출에 대한 재시도 메커니즘 추가
- 네트워크 에러 우아한 처리

## 7. 테스트 전략

### 단위 테스트

- 상태 결정 로직 테스트
- 시간 변환 함수 테스트
- 색상 관리 테스트
- 메시지 생성 테스트

### 통합 테스트

- API 통합 테스트
- 상태 관리 테스트
- 사용자 상호작용 테스트
- 야간 근무 처리 테스트

### E2E 테스트

- 전체 근무 기록 플로우 테스트
- 날짜 네비게이션 테스트
- 추가 근무 생성 테스트
- 에러 시나리오 테스트

## 8. 향후 개선사항

1. 오프라인 지원

   - 서비스 워커 구현
   - 오프라인 데이터 동기화
   - 오프라인 액션 큐 처리

2. 분석 기능

   - 근무 패턴 추적
   - 근무 기록 리포트 생성
   - 지각/조기 퇴근 패턴 모니터링

3. 알림 기능

   - 근무 시작 알림
   - 지각 알림
   - 스케줄 변경 알림

4. 고급 기능
   - 휴식 시간 추적
   - 초과 근무 계산
   - 스케줄 수정 요청
   - 휴가 관리 통합

## 9. 구현 상세 계획

### Phase 1: 데이터 구조 업데이트 (1주차)

1. 엔티티 타입 정의 업데이트

   - WorkSchedule에 야간 근무 관련 필드 추가
   - Attendance에 추가 근무 필드 추가
   - ViewModel 타입 정의 보강

2. API 응답 타입 정의
   - 기존 API 응답 타입 마이그레이션
   - 신규 필드 추가에 따른 타입 업데이트

### Phase 2: 컴포넌트 리팩토링 (2주차)

1. AttendanceCard 컴포넌트 분리

   ```tsx
   // AttendanceCard/index.tsx
   export const AttendanceCard: React.FC<Props> = ({
     workplace,
     schedule,
     attendance,
   }) => (
     <Card>
       <WorkplaceInfo {...workplace} />
       <TimeDisplay schedule={schedule} attendance={attendance} />
       <StatusMessage status={attendance.status} />
       <ActionButton status={attendance.status} onAction={handleAction} />
     </Card>
   );
   ```

2. 시간 표시 컴포넌트 개선
   ```tsx
   // TimeDisplay/index.tsx
   export const TimeDisplay: React.FC<Props> = ({ schedule, attendance }) => {
     const { formatTime, isOvernight } = useTimeManagement();

     return (
       <div>
         <ScheduleTime
           start={schedule.startTime}
           end={schedule.endTime}
           isOvernight={schedule.isOvernight}
         />
         <ActualTime
           start={attendance.actualStartTime}
           end={attendance.actualEndTime}
         />
       </div>
     );
   };
   ```

### Phase 3: 상태 관리 구현 (2주차)

1. 상태 관리 훅 구현

   ```typescript
   // hooks/useAttendance.ts
   export const useAttendance = (scheduleId: number) => {
     const queryClient = useQueryClient();

     const clockInMutation = useMutation({
       mutationFn: (request: ClockInRequest) =>
         attendanceApi.clockIn(scheduleId, request),
       onSuccess: () => {
         queryClient.invalidateQueries(["attendance"]);
       },
     });

     // ... 기타 mutation 및 상태 관리 로직
   };
   ```

2. 시간 관리 유틸리티 구현
   ```typescript
   // utils/timeUtils.ts
   export const timeUtils = {
     isOvernightShift: (start: string, end: string) => {
       // 야간 근무 판단 로직
     },
     formatDisplayTime: (time: string) => {
       // 시간 포맷팅 로직
     },
     calculateDuration: (start: string, end: string) => {
       // 근무 시간 계산 로직
     },
   };
   ```

### Phase 4: 추가 근무 기능 구현 (1주차)

1. 추가 근무 모달 컴포넌트

   ```tsx
   // AdditionalWorkModal/index.tsx
   export const AdditionalWorkModal: React.FC<Props> = ({
     isOpen,
     onClose,
     onSubmit,
   }) => {
     const [formData, setFormData] = useState(initialState);

     const handleSubmit = async () => {
       await onSubmit(formData);
       onClose();
     };

     return (
       <Modal isOpen={isOpen} onClose={onClose}>
         <Form onSubmit={handleSubmit}>{/* 폼 필드 구현 */}</Form>
       </Modal>
     );
   };
   ```

2. 추가 근무 생성 API 연동
   ```typescript
   // hooks/useAdditionalWork.ts
   export const useAdditionalWork = () => {
     const createMutation = useMutation({
       mutationFn: (request: AdditionalWorkRequest) =>
         attendanceApi.createAdditionalWork(request),
       onSuccess: () => {
         // 성공 처리
       },
     });

     return { createAdditionalWork: createMutation.mutate };
   };
   ```

### Phase 5: 테스트 구현 (1주차)

1. 단위 테스트

   ```typescript
   // __tests__/timeUtils.test.ts
   describe("timeUtils", () => {
     describe("isOvernightShift", () => {
       it("should detect overnight shift correctly", () => {
         // 테스트 구현
       });
     });

     describe("calculateDuration", () => {
       it("should calculate work duration correctly", () => {
         // 테스트 구현
       });
     });
   });
   ```

2. 통합 테스트
   ```typescript
   // __tests__/AttendanceCard.test.tsx
   describe("AttendanceCard", () => {
     it("should display correct status for ongoing work", () => {
       // 테스트 구현
     });

     it("should handle clock-in action correctly", () => {
       // 테스트 구현
     });
   });
   ```

### Phase 6: 성능 최적화 (1주차)

1. 메모이제이션 적용

   ```typescript
   // components/AttendanceCard/index.tsx
   export const AttendanceCard = React.memo(({ data }) => {
     // 컴포넌트 구현
   });
   ```

2. 가상 스크롤 구현
   ```typescript
   // components/AttendanceList/index.tsx
   export const AttendanceList: React.FC<Props> = ({ items }) => {
     return (
       <VirtualScroll
         itemCount={items.length}
         itemSize={150}
         renderItem={({ index, style }) => (
           <AttendanceCard
             key={items[index].id}
             data={items[index]}
             style={style}
           />
         )}
       />
     );
   };
   ```

### 구현 일정

총 8주 프로젝트로 계획:

- Week 1-2: Phase 1 & 2 (데이터 구조 및 컴포넌트)
- Week 3-4: Phase 3 (상태 관리)
- Week 5: Phase 4 (추가 근무 기능)
- Week 6: Phase 5 (테스트)
- Week 7: Phase 6 (성능 최적화)
- Week 8: 버그 수정 및 안정화

### 주요 마일스톤

1. Week 2 종료: 기본 UI 완성
2. Week 4 종료: 핵심 기능 구현 완료
3. Week 6 종료: 테스트 완료
4. Week 8 종료: 프로덕션 배포 준비 완료
