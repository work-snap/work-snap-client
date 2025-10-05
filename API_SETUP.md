# API 설정 가이드

## 🔧 자동 설정 (환경 변수 불필요)

이제 환경 변수 설정 없이도 자동으로 작동합니다!

### 기본 설정

- **프론트엔드**: `http://localhost:3000`
- **백엔드**: `http://localhost:8080
- **카카오 리다이렉트**: `http://localhost:3000/kakao-login`

## 🚀 시작하기

### 1. 서버 실행

```bash
# 서버 디렉토리로 이동
cd work-snap-server

# 서버 실행 (Gradle 사용)
./gradlew bootRun

# 또는 IDE에서 실행
```

### 2. 클라이언트 실행

```bash
# 클라이언트 디렉토리에서
npm run dev
```

## 🔍 API 엔드포인트 테스트

브라우저에서 다음 URL을 확인하세요:

- `http://localhost:8080/swagger-ui/index.html` - API 문서
- `http://localhost:8080/api/auth/kakao/login` - 카카오 로그인 엔드포인트

## 🚨 문제 해결

### TypeError: setAuthToken is not a function

✅ **해결됨**: API 모듈에 토큰 관리 함수들이 추가되었습니다.

### 404 에러

**원인**: API 엔드포인트를 찾을 수 없음
**해결방법**:

1. 서버가 실행 중인지 확인
2. Next.js 개발 서버 재시작

### 서버가 HTML 반환

**원인**: API 요청이 Next.js 페이지로 라우팅됨
**해결방법**:

1. Next.js rewrites 설정 확인
2. 서버 포트가 올바른지 확인 (8080)

## 🔍 디버깅

### 콘솔 로그 확인

개발 환경에서 브라우저 콘솔에서 다음 로그를 확인하세요:

- `🌐 API 요청`: 요청 URL과 메서드
- `✅ API 응답`: 성공한 응답
- `❌ API 응답 오류`: 실패한 요청 상세 정보

### 네트워크 탭 확인

브라우저 개발자 도구의 Network 탭에서:

1. API 요청이 올바른 URL로 가는지 확인
2. 응답 상태 코드 확인
3. 요청/응답 헤더 확인

## 📝 고급 설정 (선택사항)

### 환경 변수 사용 시

만약 다른 URL을 사용하고 싶다면 `.env.local` 파일을 생성할 수 있습니다:

```bash
# API 설정
NEXT_PUBLIC_API_BASE_URL=http://your-custom-server:8080

# 프론트엔드 URL (선택사항)
NEXT_PUBLIC_FRONTEND_URL=http://your-custom-frontend:3000
```

### ngrok 사용 시

외부 접근이 필요한 경우 ngrok을 사용할 수 있습니다:

```bash
# ngrok 설치 후
ngrok http 8080

# 생성된 URL을 환경 변수에 설정
NEXT_PUBLIC_API_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

### CORS 설정

서버에서 CORS 설정이 올바른지 확인하세요:

```kotlin
// Spring Boot CORS 설정
@CrossOrigin(origins = ["http://localhost:3000"], allowCredentials = true)
```

## 🎯 성공 확인

모든 설정이 완료되면:

1. 카카오 로그인이 정상 작동
2. 콘솔에 API 요청/응답 로그가 정상 출력

## ✨ 자동화된 기능

- **자동 기본값 설정**: 환경 변수 없이도 자동으로 localhost:3000/8080 사용
- **상세한 디버깅 로그**: API 요청/응답 상세 정보
- **자동 토큰 관리**: JWT 토큰 자동 갱신 및 관리
