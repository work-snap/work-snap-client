# TimePicker 컴포넌트 사용법

## 개요
TimePicker는 시작 시간과 종료 시간을 선택할 수 있는 컴포넌트입니다. **클라이언트에서는 검증을 하지 않고**, 사용자가 설정한 시간을 그대로 서버로 전송합니다. 서버에서 검증 후 에러가 발생하면 토스트로 표시합니다.

## 기본 사용법

```tsx
import TimePicker, { handleTimeValidationError } from "./TimePicker";
import toast from "react-hot-toast";

function MyComponent() {
  const [timeData, setTimeData] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  const handleTimeChange = (times: { startTime: string; endTime: string }) => {
    setTimeData(times);
  };

  const handleSubmit = async () => {
    try {
      // 클라이언트에서 검증하지 않고 바로 서버로 전송
      const response = await api.createSchedule({
        startTime: timeData.startTime,  // "09:00" 형식
        endTime: timeData.endTime,      // "18:00" 형식
        // 기타 필요한 데이터...
      });

      toast.success("시간 설정이 완료되었습니다!");
      
    } catch (error) {
      // 서버에서 반환하는 에러를 토스트로 표시
      handleTimeValidationError(error, toast);
    }
  };

  return (
    <div>
      <TimePicker onChange={handleTimeChange} />
      <button onClick={handleSubmit}>저장</button>
    </div>
  );
}
```

## 서버 에러 처리

`handleTimeValidationError` 함수는 서버에서 반환하는 시간 관련 에러 메시지를 자동으로 토스트로 표시합니다:

### 지원하는 에러 메시지
- **시작 시간 > 종료 시간**: "종료 시간이 시작 시간보다 늦어야 합니다."
- **최소 시간 미달**: "최소 30분 이상의 근무 시간이 필요합니다."
- **최대 시간 초과**: "최대 12시간을 초과할 수 없습니다."
- **기타 에러**: 일반적인 에러 토스트로 표시

### 에러 응답 형식
서버에서 다음과 같은 형식으로 에러를 반환해야 합니다:

```json
{
  "response": {
    "data": {
      "message": "시작 시간은 종료 시간보다 빨라야 합니다."
    }
  }
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onChange` | `(times: { startTime: string; endTime: string }) => void` | ❌ | 시간 변경 시 호출되는 콜백 |
| `className` | `string` | ❌ | 추가 CSS 클래스 |
| `debug` | `boolean` | ❌ | 디버그 모드 (기본값: false) |

## 반환되는 시간 형식

TimePicker는 24시간 형식의 문자열을 반환합니다:
- `startTime`: "09:00" (오전 9시)
- `endTime`: "18:00" (오후 6시)

## 특징

1. **클라이언트 검증 없음**: 사용자가 설정한 시간을 그대로 서버로 전송
2. **서버 중심 검증**: 모든 비즈니스 로직은 서버에서 처리
3. **자동 에러 처리**: 서버 에러를 자동으로 토스트로 표시
4. **12시간제 UI**: 사용자 친화적인 오전/오후 선택
5. **스크롤 휠**: 모바일 친화적인 스크롤 휠 인터페이스

## 서버 측 검증 예시 (Kotlin)

```kotlin
// 서버에서 시간 검증
fun validateTimeRange(startTime: LocalTime, endTime: LocalTime): ValidationResult {
    val errors = mutableListOf<String>()
    
    if (!startTime.isBefore(endTime)) {
        errors.add("시작 시간은 종료 시간보다 빨라야 합니다.")
    }
    
    val duration = Duration.between(startTime, endTime)
    if (duration.toMinutes() < 30) {
        errors.add("최소 30분 이상의 근무 시간이 필요합니다.")
    }
    
    if (duration.toHours() > 12) {
        errors.add("최대 12시간을 초과할 수 없습니다.")
    }
    
    return ValidationResult(
        isValid = errors.isEmpty(),
        errors = errors
    )
}
```
