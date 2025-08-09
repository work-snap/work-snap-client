# 실시간 시간 동기화 및 표시 훅

이 모듈은 실시간 시간 표시 및 서버 시간 동기화 기능을 제공하는 React 훅들을 포함합니다.

## 주요 기능

- 🕐 실시간 시간 업데이트 (1초마다)
- 🔄 서버 시간 자동 동기화 (30초마다)
- 🌐 네트워크 지연 보정
- 📍 다양한 시간대 지원
- 📱 페이지 포커스 시 즉시 동기화
- 🎨 다양한 시간 포맷 제공
- ⚡ 성능 최적화된 상태 관리

## 기본 사용법

### 1. useCurrentTime (기본 훅)

```tsx
import { useCurrentTime } from '@/hooks/useCurrentTime';

function TimeDisplay() {
  const { 
    currentTime, 
    formattedTime, 
    formattedDate,
    isServerSynced,
    syncWithServer 
  } = useCurrentTime();

  return (
    <div>
      <div>{formattedTime}</div>
      <div>{formattedDate}</div>
      <div>{isServerSynced ? '서버 동기화됨' : '로컬 시간'}</div>
      <button onClick={syncWithServer}>수동 동기화</button>
    </div>
  );
}
```

### 2. EnhancedTimeProvider (향상된 컨텍스트)

```tsx
import { EnhancedTimeProvider, useEnhancedTime } from '@/hooks';

function App() {
  return (
    <EnhancedTimeProvider 
      enableAutoSync={true}
      syncInterval={30000}
      showSyncStatus={true}
    >
      <TimeApp />
    </EnhancedTimeProvider>
  );
}

function TimeApp() {
  const { 
    currentTime, 
    formattedTime, 
    syncAccuracy,
    syncStatus 
  } = useEnhancedTime();

  return (
    <div>
      <h1>{formattedTime}</h1>
      <p>동기화 정확도: {syncAccuracy}%</p>
      <p>상태: {syncStatus}</p>
    </div>
  );
}
```

### 3. useFormattedTime (다양한 포맷)

```tsx
import { useFormattedTime } from '@/hooks/useCurrentTime';

function FormattedTimeDisplay() {
  const {
    time24Hour,    // "14:30:45"
    time12Hour,    // "2:30:45 PM"
    date,          // "2025년 1월 14일 (월)"
    dateTime,      // "2025. 1. 14. 오후 2:30:45"
    iso,           // "2025-01-14T14:30:45.123Z"
    timestamp      // 1705304645123
  } = useFormattedTime();

  return (
    <div>
      <div>24시간: {time24Hour}</div>
      <div>12시간: {time12Hour}</div>
      <div>날짜: {date}</div>
      <div>ISO: {iso}</div>
    </div>
  );
}
```

### 4. useTimeZone (시간대 지원)

```tsx
import { useTimeZone } from '@/hooks/useCurrentTime';

function WorldClock() {
  const seoul = useTimeZone('Asia/Seoul');
  const newYork = useTimeZone('America/New_York');
  const london = useTimeZone('Europe/London');

  return (
    <div>
      <div>서울: {seoul.formattedTime}</div>
      <div>뉴욕: {newYork.formattedTime}</div>
      <div>런던: {london.formattedTime}</div>
    </div>
  );
}
```

## 훅 옵션

### useCurrentTime 옵션

```tsx
interface UseCurrentTimeOptions {
  syncInterval?: number;      // 서버 동기화 간격 (기본: 30000ms)
  updateInterval?: number;    // 시간 업데이트 간격 (기본: 1000ms)
  enableServerSync?: boolean; // 서버 동기화 사용 여부 (기본: true)
}
```

### EnhancedTimeProvider 옵션

```tsx
interface EnhancedTimeProviderProps {
  enableAutoSync?: boolean;    // 자동 동기화 활성화 (기본: true)
  syncInterval?: number;       // 동기화 간격 (기본: 30000ms)
  enableServerSync?: boolean;  // 서버 동기화 사용 (기본: true)
  showSyncStatus?: boolean;    // 동기화 상태 표시 (기본: false)
}
```

## 시간 유틸리티 함수

```tsx
import { 
  formatTime, 
  formatDate, 
  formatRelativeTime,
  getDateLabel,
  calculateWorkingHours,
  getAttendanceStatus 
} from '@/utils/timeUtils';

// 시간 포맷팅
const formatted = formatTime(new Date(), { 
  showSeconds: true, 
  hour12: false 
});

// 상대 시간 ("2분 전", "1시간 후")
const relative = formatRelativeTime(pastDate, new Date());

// 날짜 라벨 ("오늘", "어제", "내일")
const label = getDateLabel(new Date());

// 근무시간 계산
const workTime = calculateWorkingHours(
  new Date('2025-01-14T09:00:00'),
  new Date('2025-01-14T18:00:00'),
  60 // 점심시간 60분
);

// 출근 상태 판단
const status = getAttendanceStatus(
  new Date('2025-01-14T09:05:00'), // 실제 출근시간
  new Date('2025-01-14T09:00:00'), // 예정 출근시간
  30, // 조기출근 기준 (30분)
  10  // 지각 기준 (10분)
); // 'EARLY' | 'NORMAL' | 'LATE'
```

## 서버 API 연동

이 훅들은 다음 API 엔드포인트를 사용합니다:

```
GET /api/v1/time/current     - 현재 서버 시간 조회
POST /api/v1/time/sync       - 시간 동기화 수행
GET /api/v1/time/sync/stats  - 동기화 통계 조회
```

API가 없는 경우 자동으로 로컬 시간으로 폴백됩니다.

## 성능 최적화

- **메모이제이션**: 모든 계산된 값은 메모이제이션되어 불필요한 재계산을 방지
- **타이머 정리**: 컴포넌트 언마운트 시 모든 타이머 자동 정리
- **네트워크 최적화**: 페이지 포커스 시에만 즉시 동기화 수행
- **에러 핸들링**: 네트워크 오류 시 로컬 시간으로 자동 폴백

## 테스트

```bash
npm test -- useCurrentTime
```

테스트는 다음을 검증합니다:
- 시간 업데이트 정확성
- 서버 동기화 동작
- 네트워크 지연 보정
- 에러 핸들링
- 페이지 visibility 이벤트 처리

## 브라우저 호환성

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 라이선스

MIT License