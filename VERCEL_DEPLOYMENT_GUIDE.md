# Vercel 배포 가이드 - API 연결 문제 해결

## 🔍 현재 문제 상황

Vercel 배포 후 API 요청 시 403 Forbidden 에러가 발생하는 문제가 있습니다.

### 에러 로그

```
POST https://work-snap-client.vercel.app/api/auth/dev-token/nickname/%EB%B0%95%EC%95%8C%EB%B0%94 403 (Forbidden)
```

## 🛠️ 해결 방법

### 1. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

#### 필수 환경 변수

```
NEXT_PUBLIC_API_BASE_URL=https://31106af31d6e.ngrok-free.app
```

#### 선택적 환경 변수

```
NEXT_PUBLIC_FRONTEND_URL=https://work-snap-client.vercel.app
NODE_ENV=production
```

### 2. 환경 변수 설정 방법

1. **Vercel 대시보드 접속**

   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings 탭으로 이동**

   - Environment Variables 섹션

3. **환경 변수 추가**

   ```
   Name: NEXT_PUBLIC_API_BASE_URL
   Value: https://31106af31d6e.ngrok-free.app
   Environment: Production, Preview, Development
   ```

4. **재배포**
   - 환경 변수 추가 후 자동으로 재배포됩니다
   - 또는 수동으로 재배포 버튼 클릭

### 3. API 엔드포인트 확인

현재 수정된 API 엔드포인트:

- ✅ `/api/auth/dev-token/nickname/{nickname}`
- ✅ `/api/auth/dev-token/{userId}`

### 4. Next.js Rewrites 설정

`next.config.ts`에서 API 요청을 백엔드로 올바르게 리다이렉트합니다:

```typescript
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://89a8626716db.ngrok.app";

  return [
    {
      source: "/api/:path*",
      destination: `${apiUrl}/api/:path*`,
    },
  ];
}
```

### 5. CORS 설정 확인

백엔드에서 Vercel 도메인을 허용해야 합니다:

```javascript
// 백엔드 CORS 설정
app.use(
  cors({
    origin: ["https://work-snap-client.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);
```

## 🔧 문제 해결 체크리스트

- [ ] Vercel 환경 변수 `NEXT_PUBLIC_API_BASE_URL` 설정
- [ ] ngrok URL이 올바른지 확인
- [ ] 백엔드 CORS 설정에 Vercel 도메인 추가
- [ ] API 엔드포인트 경로 일치 확인
- [ ] 재배포 후 테스트

## 🚨 주의사항

1. **ngrok URL 변경 시**: ngrok URL이 변경되면 Vercel 환경 변수도 업데이트해야 합니다
2. **CORS 설정**: 백엔드에서 Vercel 도메인을 허용하지 않으면 403 에러가 발생합니다
3. **환경 변수**: `NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능합니다

## 📞 추가 지원

문제가 지속되면 다음을 확인하세요:

1. 브라우저 개발자 도구의 Network 탭에서 실제 요청 URL 확인
2. 백엔드 로그에서 요청 수신 여부 확인
3. ngrok 터널 상태 확인
