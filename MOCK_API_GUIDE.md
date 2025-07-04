# 🧪 출근 기록 Mock API 가이드

출근 기록 기능을 테스트하기 위한 Mock API가 구현되었습니다.

## ⚡ 빠른 시작

### 1. Mock API 활성화
```bash
# 터미널에서 환경변수 설정
export NEXT_PUBLIC_USE_MOCK_API=true

# 또는 .env.local 파일에 추가
echo "NEXT_PUBLIC_USE_MOCK_API=true" >> .env.local
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
- http://localhost:3000/work-attendance 접속
- 개발자 도구(F12) → 콘솔 탭 열기

## 🎮 브라우저 콘솔 명령어

### API 모드 확인 및 전환
```javascript
// 현재 상태 확인 (Mock API 사용 중인지 확인)
printAttendanceApiStatus()

// Mock ↔ Real API 전환
toggleAttendanceApiMode()
```

### 테스트 시나리오 실행
```javascript
// 사용 가능한 시나리오 목록 보기
listTestScenarios()

// 정상적인 하루 근무 시뮬레이션
runTestScenario('normal-work-day')

// 조기 출근 시나리오
runTestScenario('early-arrival')

// 야간 근무 시나리오 (23:00-07:00)
runTestScenario('overnight-work')

// 추가 근무 시나리오
runTestScenario('additional-work')

// 데이터 초기화
cleanupScenarios()
```

## 📱 UI 테스트 항목

### ✅ 확인할 기능들

1. **카드별 독립 우측 버튼**
   - 예정 상태: "조기출근" 버튼
   - 진행 상태: "퇴근하기" 버튼  
   - 완료 상태: "완료됨" (비활성화)

2. **야간 근무 다중 카드**
   - 시작일: "야간 근무 (시작)" 카드
   - 종료일: "야간 근무 (종료)" 카드

3. **추가 근무 전용 버튼**
   - "추가근무 시작" → "추가근무 종료"

4. **메인 vs 우측 버튼 구분**
   - 메인: 선택된 타입으로 출근/퇴근 처리
   - 우측: 상황별 빠른 액션

## 🐛 문제 해결

### Mock API가 작동하지 않을 때
```javascript
// 1. 현재 상태 확인
printAttendanceApiStatus()

// 2. Mock API로 강제 전환
localStorage.setItem('work-snap-use-mock', 'true')
location.reload()
```

### 데이터가 없을 때
```javascript
// 기본 시나리오 실행
runTestScenario('complex-day')
```

### 버튼이 동작하지 않을 때
```javascript
// 데이터 초기화 후 재시도
cleanupScenarios()
runTestScenario('normal-work-day')
```

## 📊 제공되는 테스트 데이터

- **정규 근무**: 09:00-18:00 (예정/진행/완료 상태)
- **야간 근무**: 23:00-07:00 (다중 카드 표시)
- **추가 근무**: 19:00-22:00 (전용 버튼)
- **조기 출근**: 08:30 출근
- **조퇴/연장**: 다양한 퇴근 시간

---

💡 **팁**: 모든 Mock API 기능은 실제 서버 없이 동작하며, 페이지 새로고침 시 데이터가 초기화됩니다. AI 추천 기능은 제거되었으며, 모든 출근/퇴근 타입은 사용자가 직접 선택합니다.