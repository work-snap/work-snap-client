# 출근 기록 Mock API 가이드

이 폴더는 출근 기록 기능의 개발 및 테스트를 위한 Mock API와 테스트 데이터를 포함합니다.

## 🚀 빠른 시작

### 1. Mock API 활성화

Mock API를 사용하는 방법은 두 가지입니다:

#### 방법 1: 환경변수 설정
```bash
# .env.local 파일에 추가
NEXT_PUBLIC_USE_MOCK_API=true
```

#### 방법 2: 브라우저 콘솔에서 동적 변경
```javascript
// Mock API로 전환
toggleAttendanceApiMode()

// 현재 상태 확인
printAttendanceApiStatus()
```

### 2. 개발 서버 실행
```bash
npm run dev
```

## 📊 테스트 데이터

### 기본 제공 데이터

Mock API는 다음과 같은 테스트 데이터를 제공합니다:

#### 오늘의 출근 기록
- **정규 근무 (예정)**: 09:00-18:00 (정상출근 선택됨)
- **정규 근무 (진행중)**: 09:15에 출근 완료
- **야간 근무 (예정)**: 23:00-07:00 
- **야간 근무 (진행중)**: 23:00에 출근 완료
- **추가 근무 (예정)**: 19:00-22:00
- **추가 근무 (진행중)**: 19:15에 시작

#### 어제의 출근 기록 (완료)
- **정규 근무**: 09:00-18:00 (정상 출근/퇴근)
- **추가 근무**: 19:00-22:30 (연장 근무)
- **조퇴**: 09:00-15:00 (정상 출근/조퇴)

## 🎭 테스트 시나리오

브라우저 콘솔에서 다양한 시나리오를 실행할 수 있습니다:

### 시나리오 목록 확인
```javascript
listTestScenarios()
```

### 시나리오 실행
```javascript
// 정상적인 하루 근무
runTestScenario('normal-work-day')

// 조기 출근 시나리오
runTestScenario('early-arrival')

// 조퇴 시나리오  
runTestScenario('early-departure')

// 연장 근무 시나리오
runTestScenario('overtime')

// 추가 근무 시나리오
runTestScenario('additional-work')

// 야간 근무 시나리오
runTestScenario('overnight-work')

// 복잡한 하루 (정규 + 추가 근무)
runTestScenario('complex-day')
```

### 데이터 초기화
```javascript
cleanupScenarios()
```

## 🛠️ 개발자 도구

### API 상태 관리
```javascript
// 현재 API 모드 확인
printAttendanceApiStatus()

// Mock/Real API 전환
toggleAttendanceApiMode()

// API 팩토리 인스턴스 접근
attendanceApiFactory.getConfig()
```

### Mock 데이터 조작
```javascript
// Mock API 인스턴스 접근
mockAttendanceApi

// 데이터 초기화
mockAttendanceApi.resetMockData()

// 현재 데이터 상태 확인
mockAttendanceApi.getMockDataState()

// 특정 출근 기록 상태 강제 변경
mockAttendanceApi.forceUpdateAttendanceStatus(1, 'COMPLETED')
```

## 📋 API 엔드포인트

Mock API는 실제 API와 동일한 인터페이스를 제공합니다:

### 기본 조회
- `getTodayAttendance()`: 오늘의 출근 기록
- `getDailyAttendance(date)`: 일별 출근 현황
- `getActiveAttendance()`: 진행 중인 출근 기록
- `getAttendanceById(id)`: 특정 출근 기록

### 출근/퇴근 처리
- `clockIn(id, request)`: 출근 처리
- `clockOut(id, request)`: 퇴근 처리

### 추가 근무
- `createAdditionalWork(request)`: 추가 근무 등록

## 🧪 테스트 케이스

### 1. 기본 플로우 테스트
```javascript
// 1. 정상 출근
await mockAttendanceApi.clockIn(1, {
  actualTime: '2024-12-01T09:00:00',
  notes: '정시 출근'
})

// 2. 정상 퇴근  
await mockAttendanceApi.clockOut(1, {
  actualTime: '2024-12-01T18:00:00',
  notes: '정시 퇴근'
})
```

### 2. 조기 출근/조퇴 테스트
```javascript
// 조기 출근
await mockAttendanceApi.clockIn(1, {
  actualTime: '2024-12-01T08:30:00',
  manualClockInType: 'EARLY_ARRIVAL',
  notes: '회의 준비를 위한 조기 출근'
})

// 조퇴
await mockAttendanceApi.clockOut(1, {
  actualTime: '2024-12-01T15:00:00', 
  manualClockOutType: 'EARLY_DEPARTURE',
  notes: '개인 사정으로 조퇴'
})
```

### 3. 야간 근무 테스트
```javascript
// 야간 근무 시작 (23:00)
await mockAttendanceApi.clockIn(5, {
  actualTime: '2024-12-01T23:00:00'
})

// 야간 근무 종료 (다음날 07:00)
await mockAttendanceApi.clockOut(5, {
  actualTime: '2024-12-02T07:00:00'
})
```

## 🎯 카드 표시 테스트

### 야간 근무 다중 카드
야간 근무(23:00-07:00)는 두 개의 카드로 표시됩니다:
- 시작일: "야간 근무 (시작)" 카드
- 종료일: "야간 근무 (종료)" 카드

### 추가 근무 카드  
추가 근무는 전용 카드로 표시됩니다:
- 예정: "추가근무 시작" 버튼
- 진행중: "추가근무 종료" 버튼
- 완료: "추가근무 완료" 상태

### 상태별 버튼 동작
- **메인 버튼**: 선택된 타입으로 출근/퇴근 처리
- **우측 버튼**: 상황별 빠른 액션 (조기출근, 조퇴 등)
- **타입 변경**: "다른 타입 선택" 버튼으로 출근/퇴근 타입 변경

## 🚨 주의사항

1. **데이터 영속성**: Mock 데이터는 페이지 새로고침 시 초기화됩니다.
2. **API 지연**: 실제 API와 유사한 응답 지연을 시뮬레이션합니다.
3. **에러 처리**: 잘못된 요청에 대해 적절한 에러를 반환합니다.
4. **개발 전용**: Mock API는 개발 환경에서만 사용하세요.

## 🔧 문제 해결

### Mock API가 작동하지 않는 경우
1. 환경변수 확인: `NEXT_PUBLIC_USE_MOCK_API=true`
2. 브라우저 콘솔에서 `printAttendanceApiStatus()` 실행
3. 캐시 초기화 후 페이지 새로고침

### 데이터가 표시되지 않는 경우
1. Mock 데이터 초기화: `mockAttendanceApi.resetMockData()`
2. 시나리오 실행: `runTestScenario('normal-work-day')`
3. 네트워크 탭에서 API 호출 확인

### 버튼이 동작하지 않는 경우
1. 출근 기록 상태 확인: `mockAttendanceApi.getMockDataState()`
2. 강제 상태 변경: `mockAttendanceApi.forceUpdateAttendanceStatus(1, 'SCHEDULED')`
3. 컴포넌트 재렌더링 확인