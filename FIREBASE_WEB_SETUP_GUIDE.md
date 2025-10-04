# 🔥 Firebase 웹 앱 설정 가이드

## 📋 개요
클라이언트에서 FCM(Firebase Cloud Messaging) 푸시 알림을 사용하기 위해서는 Firebase Console에서 웹 앱 설정 정보를 가져와야 합니다.

## ✅ 완료된 작업
- ✅ VAPID 키가 이미 `.env.local`에 추가되었습니다
- ✅ FCM 토큰 자동 등록 훅(`useFcmToken.ts`)이 생성되었습니다
- ✅ Service Worker(`firebase-messaging-sw.js`)가 생성되었습니다
- ✅ `UserProvider`에 FCM 초기화가 추가되었습니다

## 🔑 나머지 Firebase 웹 앱 설정 값 가져오기

현재 `.env.local` 파일에는 다음 값들이 placeholder로 설정되어 있습니다:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=workspace-5453e.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=workspace-5453e
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=workspace-5453e.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=113489114728731298984
NEXT_PUBLIC_FIREBASE_APP_ID=1:113489114728731298984:web:xxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BG164YDRzhKZX817qIcG8SY6ZTgmXpW63alo3cCvM3fnQliU_fhD_dmlXJYrOy8BpzDiZ3U4O3NS2wGIBd-pyNw
```

### 📍 Firebase Console에서 웹 앱 설정 값 찾기

#### 1️⃣ Firebase Console 접속
- https://console.firebase.google.com 접속
- `workspace-5453e` 프로젝트 선택

#### 2️⃣ 프로젝트 설정 접근
1. 좌측 상단의 **⚙️ 톱니바퀴 아이콘** 클릭
2. **프로젝트 설정** 선택

#### 3️⃣ 웹 앱 설정 정보 확인
1. **일반** 탭 선택
2. 아래로 스크롤하여 **내 앱** 섹션 찾기
3. 웹 앱 아이콘(`</>`)이 있는 앱 선택
4. **SDK 설정 및 구성** 아래에 있는 설정 값 복사

다음과 같은 형식으로 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "workspace-5453e.firebaseapp.com",
  projectId: "workspace-5453e",
  storageBucket: "workspace-5453e.firebasestorage.app",
  messagingSenderId: "113489114728731298984",
  appId: "1:113489114728731298984:web:xxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};
```

#### 4️⃣ .env.local 파일 업데이트
위에서 복사한 값들을 `.env.local` 파일의 각 환경변수에 입력하세요:

```bash
# Firebase 설정 (FCM 푸시 알림용)
NEXT_PUBLIC_FIREBASE_API_KEY=여기에_apiKey_붙여넣기
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=여기에_authDomain_붙여넣기
NEXT_PUBLIC_FIREBASE_PROJECT_ID=여기에_projectId_붙여넣기
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_붙여넣기
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_붙여넣기
NEXT_PUBLIC_FIREBASE_APP_ID=여기에_appId_붙여넣기
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=여기에_measurementId_붙여넣기
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BG164YDRzhKZX817qIcG8SY6ZTgmXpW63alo3cCvM3fnQliU_fhD_dmlXJYrOy8BpzDiZ3U4O3NS2wGIBd-pyNw
```

> **⚠️ 주의:** VAPID 키는 이미 올바르게 설정되어 있으므로 변경하지 마세요!

## 🚀 테스트 방법

### 1️⃣ 개발 서버 재시작
환경변수를 업데이트한 후에는 반드시 개발 서버를 재시작해야 합니다:

```bash
# 서버 종료 (Ctrl + C)
# 다시 시작
npm run dev
```

### 2️⃣ 브라우저에서 알림 권한 허용
1. 앱 실행 후 브라우저에서 알림 권한 요청 팝업이 나타나면 **허용** 클릭
2. 또는 브라우저 설정에서 수동으로 알림 권한 허용:
   - Chrome: 설정 > 개인정보 및 보안 > 사이트 설정 > 알림
   - Safari: 환경설정 > 웹사이트 > 알림

### 3️⃣ FCM 토큰 등록 확인
1. 브라우저 개발자 도구(F12) → Console 탭 열기
2. 다음 메시지가 나타나는지 확인:
   ```
   ✅ FCM 토큰이 서버에 등록되었습니다: [토큰 값]
   ```

### 4️⃣ 엔드투엔드 테스트
1. **사업자 등록증 제출**
   - 사업자 계정으로 로그인
   - 사업자 등록증 이미지 업로드 및 제출

2. **관리자 승인/거부 처리**
   - 관리자 계정으로 로그인
   - 대기 중인 사업자 승인 또는 거부

3. **알림 수신 확인**
   - 사업자 계정의 브라우저/디바이스에서 푸시 알림이 표시되는지 확인
   - 알림 클릭 시 `/business-owner/dashboard` 페이지로 이동하는지 확인

## 🔧 트러블슈팅

### ❌ "FCM 토큰을 가져올 수 없습니다" 에러
**원인:**
- 브라우저가 알림을 지원하지 않음
- VAPID 키가 잘못 설정됨
- Firebase 설정 값이 잘못됨

**해결방법:**
1. 최신 Chrome/Firefox/Edge 브라우저 사용
2. `.env.local`의 모든 Firebase 설정 값 재확인
3. 개발 서버 재시작

### ❌ Service Worker 등록 실패
**원인:**
- `firebase-messaging-sw.js` 파일이 `/public` 폴더에 없음
- Service Worker가 HTTPS가 아닌 환경에서 실행 (localhost는 예외)

**해결방법:**
1. `public/firebase-messaging-sw.js` 파일 존재 확인
2. localhost 또는 HTTPS 환경에서 테스트

### ❌ 알림이 오지 않음
**원인:**
- 서버에서 FCM 알림 전송 실패
- FCM 토큰이 서버에 등록되지 않음
- 브라우저 알림 권한이 차단됨

**해결방법:**
1. 서버 로그에서 FCM 전송 성공 메시지 확인:
   ```
   ✅ FCM 알림 전송 성공 (사업자 인증 결과): APPROVED
   ```
2. 브라우저 Console에서 FCM 토큰 등록 확인
3. 브라우저 설정에서 알림 권한 상태 확인

## 📚 관련 문서
- [Firebase Console](https://console.firebase.google.com)
- [FCM Web Setup Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Notifications](https://web.dev/notifications/)
- Server FCM Setup: `/work-snap-server/FCM_SETUP_GUIDE.md`

## ✅ 완료 체크리스트
- [ ] Firebase Console에서 웹 앱 설정 값 복사
- [ ] `.env.local` 파일에 모든 환경변수 업데이트
- [ ] 개발 서버 재시작
- [ ] 브라우저에서 알림 권한 허용
- [ ] 브라우저 Console에서 FCM 토큰 등록 확인
- [ ] 사업자 등록 → 관리자 승인 → 알림 수신 테스트
