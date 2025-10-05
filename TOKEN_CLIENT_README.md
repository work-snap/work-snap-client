# 토큰 관리 API - 클라이언트 개발자 가이드

## 🔐 인증 시스템 개요

WorkSnap은 **JWT 기반의 이중 토큰 시스템**을 사용합니다:

- **AccessToken**: API 요청 시 사용하는 짧은 수명의 토큰 (15분)
- **RefreshToken**: AccessToken 갱신용 긴 수명의 토큰 (7일)

### 🛡️ 보안 특징

1. **자동 토큰 갱신**: AccessToken 만료 시 자동으로 새 토큰 발급
2. **강화된 검증**: 토큰 소유자 일치 여부를 엄격하게 검증
3. **HTTP-only 쿠키**: RefreshToken은 XSS 공격으로부터 안전하게 보호
4. **이중 검증**: AccessToken과 RefreshToken 모두에서 사용자 정보 일치성 확인

---

## 📋 API 엔드포인트

### 1. 카카오 로그인

**POST** `/api/auth/kakao/login`

#### 📝 요청

```json
{
  "code": "카카오에서 받은 인증 코드",
  "userType": "BUSINESS_OWNER" // 또는 "PART_TIME_WORKER" (신규 가입시만 필요)
}
```

#### ✅ 성공 응답 (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "사용자",
    "profileImageUrl": "https://...",
    "userType": "BUSINESS_OWNER"
  },
  "isNewUser": false
}
```

#### 🍪 자동 설정 쿠키

- `refreshToken`: HTTP-only 쿠키로 자동 설정 (7일 만료)

#### ❌ 에러 응답

- `400`: 잘못된 요청 (유효하지 않은 코드 등)
- `500`: 서버 오류

#### 👤 동의항목 설정

1. **테스트 환경 권장 설정** ⭐ **간소화된 설정**

   ```
   제품 설정 > 카카오 로그인 > 동의항목

   🔹 필수 동의 (테스트용 최소 설정):
   - 닉네임 (profile_nickname): 필수 동의 ⭐ 사용자 식별용
   - 프로필 사진 (profile_image): 필수 동의 ⭐ UI 테스트용

   🔹 선택 동의 (테스트 환경에서는 불필요):
   - 카카오계정(이메일) (account_email): 사용 안함
   - CI(연결정보) (account_ci): 사용 안함
   - 기타 개인정보: 사용 안함
   ```

2. **테스트 환경의 장점** 🧪

   ```
   간소화된 동의항목 사용 이유:

   ✅ 테스트 용이성:
   - 최소한의 정보만 수집하여 빠른 테스트 가능
   - 복잡한 개인정보 처리 절차 불필요
   - 닉네임 기반으로 사용자 구분 용이

   ✅ 개발 효율성:
   - 이메일 인증 등 복잡한 로직 제거
   - 프로필 사진으로 UI 테스트 가능
   - 간단한 사용자 관리

   ✅ 개인정보 최소화:
   - 테스트에 필요한 최소 정보만 수집
   - 개인정보보호 규정 준수 용이
   ```

3. **동의항목 설정 상세 가이드**

   ```
   📋 카카오 개발자 콘솔 설정 단계:

   1. 제품 설정 > 카카오 로그인 > 동의항목

   2. 테스트용 최소 설정:

   ┌─────────────────┬──────────────┬────────────────┐
   │     항목명      │   설정값     │     용도       │
   ├─────────────────┼──────────────┼────────────────┤
   │ 닉네임          │ 필수 동의    │ 사용자 식별    │
   │ 프로필 사진     │ 필수 동의    │ UI 테스트      │
   │ 카카오계정      │ 사용 안함    │ 테스트 불필요  │
   │ CI(연결정보)    │ 사용 안함    │ 테스트 불필요  │
   └─────────────────┴──────────────┴────────────────┘

   3. 개인정보 처리방침 URL 등록 (필수)
   ```

4. **개인정보 보호정책**

   ```
   개인정보 처리방침 URL 입력 (필수)
   - 개발환경: http://localhost:3000/privacy
   - 프로덕션: https://yourdomain.com/privacy

   ⚠️ 주의: 닉네임과 프로필 사진 수집에 대한 내용 명시 필요
   ```

---

### 2. 토큰 갱신 (강화된 검증)

**POST** `/api/auth/refresh`

#### 📝 요청

- **헤더**: `Authorization: Bearer {만료된_AccessToken}` (선택사항, 있으면 더 안전)
- **쿠키**: `refreshToken` (자동 포함)

#### ✅ 성공 응답 (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 🍪 자동 갱신 쿠키

- `refreshToken`: 새로운 RefreshToken으로 자동 갱신

#### ❌ 에러 응답

- `400`: 유효하지 않은 리프레시 토큰
- `401`: 만료된 리프레시 토큰 또는 토큰 소유자 불일치

**중요한 검증 과정:**

1. 만료된 AccessToken에서 사용자 ID 추출
2. RefreshToken의 소유자와 사용자 ID 일치 여부 확인
3. 일치하지 않으면 "토큰 정보가 일치하지 않습니다" 오류 반환
4. 모든 검증 통과 시에만 새로운 토큰 발급

---

### 3. 로그아웃

**POST** `/api/auth/logout`

#### 📝 요청

- **쿠키**: `refreshToken` (자동 포함)

#### ✅ 성공 응답 (200)

```json
"로그아웃이 완료되었습니다."
```

#### 🍪 쿠키 처리

- `refreshToken`: 자동 삭제 (maxAge=0)

---

## 🔄 자동 토큰 갱신 시스템

**모든 API 요청에서 AccessToken이 만료된 경우 자동으로 갱신됩니다.**

### 📡 자동 갱신 플로우

1. **API 요청**: 만료된 AccessToken으로 요청
2. **서버 검증**:
   - 만료된 AccessToken에서 사용자 ID 추출
   - RefreshToken 소유자와 일치 여부 확인
   - 일치하지 않으면 즉시 거부 (보안 강화)
3. **토큰 갱신**: 검증 통과 시 새로운 토큰 쌍 발급
4. **응답**: 원래 API 응답 + 새로운 토큰 정보

### 📨 자동 갱신 시 응답 헤더

- `X-New-Access-Token`: 새로운 AccessToken
- `X-Token-Refreshed`: "true" (토큰이 갱신된 경우)

### ⚠️ 자동 갱신 실패 시

토큰 소유자가 일치하지 않거나 RefreshToken이 만료된 경우:

```json
{
  "error": "UNAUTHORIZED",
  "message": "토큰 정보가 일치하지 않습니다. 다시 로그인해주세요.",
  "timestamp": 1640995200000
}
```

---

## 💻 클라이언트 구현 가이드

### 🚀 React/JavaScript 완전 구현 예시

#### 1. API 클라이언트 클래스 (고급 버전)

```javascript
class WorkSnapApiClient {
  constructor() {
    this.accessToken = localStorage.getItem("accessToken");
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  }

  /**
   * 모든 API 요청을 처리하는 메인 메서드
   * 자동 토큰 갱신 및 에러 처리 포함
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // 🍪 RefreshToken 쿠키 포함 (필수!)
    };

    // AccessToken이 있으면 헤더에 추가
    if (this.accessToken) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);

      // 🔄 자동 토큰 갱신 확인
      await this.handleTokenRefresh(response);

      return response;
    } catch (error) {
      console.error("API 요청 실패:", error);
      throw error;
    }
  }

  /**
   * 토큰 갱신 처리
   */
  async handleTokenRefresh(response) {
    // 토큰이 갱신된 경우
    if (response.headers.get("X-Token-Refreshed") === "true") {
      const newAccessToken = response.headers.get("X-New-Access-Token");
      if (newAccessToken) {
        console.log("🔄 토큰이 자동으로 갱신되었습니다.");
        this.setAccessToken(newAccessToken);
      }
    }

    // 인증 실패 시 (토큰 소유자 불일치 등)
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));

      // 토큰 관련 오류인 경우 로그아웃 처리
      if (
        errorData.message?.includes("토큰") ||
        errorData.message?.includes("로그인")
      ) {
        console.warn("🚨 인증 오류:", errorData.message);
        this.clearAuth();
        // 로그인 페이지로 리다이렉트
        window.location.href = "/login";
      }
    }
  }

  /**
   * AccessToken 저장
   */
  setAccessToken(token) {
    this.accessToken = token;
    localStorage.setItem("accessToken", token);
  }

  /**
   * 인증 정보 초기화
   */
  clearAuth() {
    this.accessToken = null;
    localStorage.removeItem("accessToken");
  }

  /**
   * JSON 응답 파싱 헬퍼
   */
  async parseResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return await response.json();
  }
}

// 전역 인스턴스 생성
const apiClient = new WorkSnapApiClient();
export default apiClient;
```

#### 2. 인증 관련 API 함수들

```javascript
/**
 * 카카오 로그인
 */
export async function kakaoLogin(code, userType = null) {
  try {
    const response = await apiClient.request("/api/auth/kakao/login", {
      method: "POST",
      body: JSON.stringify({ code, userType }),
    });

    if (response.ok) {
      const data = await apiClient.parseResponse(response);
      apiClient.setAccessToken(data.accessToken);

      console.log("✅ 로그인 성공:", {
        isNewUser: data.isNewUser,
        userType: data.user.userType,
      });

      return data;
    }
  } catch (error) {
    console.error("❌ 로그인 실패:", error);
    throw error;
  }
}

/**
 * 수동 토큰 갱신 (일반적으로 불필요 - 자동 갱신됨)
 */
export async function refreshToken() {
  try {
    const response = await apiClient.request("/api/auth/refresh", {
      method: "POST",
    });

    if (response.ok) {
      const data = await apiClient.parseResponse(response);
      apiClient.setAccessToken(data.accessToken);
      console.log("🔄 토큰 갱신 성공");
      return true;
    }
  } catch (error) {
    console.error("❌ 토큰 갱신 실패:", error);
    apiClient.clearAuth();
    return false;
  }
}

/**
 * 로그아웃
 */
export async function logout() {
  try {
    await apiClient.request("/api/auth/logout", {
      method: "POST",
    });
    console.log("✅ 로그아웃 성공");
  } catch (error) {
    console.error("❌ 로그아웃 오류:", error);
  } finally {
    apiClient.clearAuth();
    window.location.href = "/login";
  }
}
```

#### 3. 일반 API 사용 예시

```javascript
/**
 * 사용자 정보 조회
 */
export async function fetchUserProfile() {
  try {
    const response = await apiClient.request("/api/users/me");
    return await apiClient.parseResponse(response);
  } catch (error) {
    console.error("❌ 사용자 정보 조회 실패:", error);
    throw error;
  }
}

/**
 * 사용자 정보 수정
 */
export async function updateUserProfile(userData) {
  try {
    const response = await apiClient.request("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    return await apiClient.parseResponse(response);
  } catch (error) {
    console.error("❌ 사용자 정보 수정 실패:", error);
    throw error;
  }
}
```

#### 4. React Hook 예시

```javascript
import { useState, useEffect } from "react";
import { fetchUserProfile } from "./api";

/**
 * 사용자 정보를 관리하는 커스텀 훅
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const userData = await fetchUserProfile();
        setUser(userData);
      } catch (err) {
        setError(err.message);
        // 인증 오류가 아닌 경우에만 에러 상태 유지
        if (!err.message.includes("토큰") && !err.message.includes("로그인")) {
          console.error("사용자 정보 로드 실패:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    // AccessToken이 있는 경우에만 사용자 정보 로드
    if (apiClient.accessToken) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, setUser };
}
```

---

## 🔧 고급 구현 팁

### 1. 토큰 만료 감지 및 처리

```javascript
/**
 * JWT 토큰의 만료 시간 확인
 */
function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * 토큰 만료 5분 전에 미리 갱신
 */
function shouldRefreshToken(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    return payload.exp - currentTime < fiveMinutes;
  } catch {
    return false;
  }
}
```

### 2. 요청 재시도 로직

```javascript
/**
 * 토큰 갱신 후 요청 재시도
 */
async function requestWithRetry(endpoint, options = {}, maxRetries = 1) {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await apiClient.request(endpoint, options);

      if (response.ok) {
        return response;
      }

      // 401 오류이고 재시도 가능한 경우
      if (response.status === 401 && i < maxRetries) {
        console.log("🔄 토큰 갱신 후 재시도...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (i === maxRetries) break;
    }
  }

  throw lastError;
}
```

### 3. 에러 처리 중앙화

```javascript
/**
 * 전역 에러 핸들러
 */
class ErrorHandler {
  static handle(error, context = "") {
    console.error(`❌ ${context} 오류:`, error);

    // 토큰 관련 오류
    if (error.message?.includes("토큰") || error.message?.includes("로그인")) {
      this.handleAuthError(error);
      return;
    }

    // 네트워크 오류
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      this.handleNetworkError();
      return;
    }

    // 일반 오류
    this.showErrorMessage(error.message || "알 수 없는 오류가 발생했습니다.");
  }

  static handleAuthError(error) {
    apiClient.clearAuth();
    this.showErrorMessage("로그인이 필요합니다. 다시 로그인해주세요.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  }

  static handleNetworkError() {
    this.showErrorMessage("네트워크 연결을 확인해주세요.");
  }

  static showErrorMessage(message) {
    // 토스트 메시지나 알림 표시
    console.warn("🚨", message);
    // 실제 구현에서는 UI 라이브러리 사용
    // toast.error(message);
  }
}
```

---

## 🧪 테스트 방법

### 1. cURL을 이용한 API 테스트

#### 로그인 테스트

```bash
curl -X POST http://localhost:8080/api/auth/kakao/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code","userType":"BUSINESS_OWNER"}' \
  -c cookies.txt \
  -v
```

#### 토큰 갱신 테스트

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Authorization: Bearer YOUR_EXPIRED_TOKEN" \
  -b cookies.txt \
  -c cookies.txt \
  -v
```

#### API 요청 테스트 (자동 갱신 확인)

```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt \
  -v
```

### 2. 브라우저 개발자 도구에서 확인

#### 네트워크 탭에서 확인할 항목:

- `X-New-Access-Token` 헤더 (토큰 갱신 시)
- `X-Token-Refreshed: true` 헤더
- `refreshToken` 쿠키 자동 설정/갱신

#### 콘솔에서 토큰 확인:

```javascript
// AccessToken 확인
console.log("AccessToken:", localStorage.getItem("accessToken"));

// 토큰 만료 시간 확인
const token = localStorage.getItem("accessToken");
if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("토큰 만료 시간:", new Date(payload.exp * 1000));
}
```

---

## ⚠️ 중요한 주의사항

### 1. 필수 설정

```javascript
// ✅ 올바른 설정
fetch("/api/users/me", {
  credentials: "include", // 🍪 쿠키 포함 (필수!)
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// ❌ 잘못된 설정 (쿠키 미포함)
fetch("/api/users/me", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  // credentials 누락 시 RefreshToken 쿠키가 전송되지 않음
});
```

### 2. HTTPS 환경에서의 쿠키 설정

프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다:

```javascript
// 개발 환경
const isDevelopment = process.env.NODE_ENV === "development";

// 쿠키 설정 (서버에서 자동 처리되지만 참고용)
const cookieOptions = {
  httpOnly: true,
  secure: !isDevelopment, // HTTPS에서만 전송
  sameSite: "strict", // CSRF 방지
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
};
```

### 3. 보안 고려사항

#### ✅ 해야 할 것:

- AccessToken은 localStorage에 저장 (XSS 위험 있지만 편의성)
- 모든 요청에 `credentials: 'include'` 포함
- 토큰 관련 오류 시 즉시 로그아웃 처리
- HTTPS 사용 (프로덕션)

#### ❌ 하지 말아야 할 것:

- RefreshToken을 JavaScript로 직접 조작
- 토큰을 URL 파라미터로 전송
- 토큰을 콘솔에 로그 출력 (프로덕션)
- HTTP 환경에서 프로덕션 배포

---

## 🐛 문제 해결 가이드

### 1. 자주 발생하는 오류

#### "토큰 정보가 일치하지 않습니다"

- **원인**: AccessToken과 RefreshToken의 소유자가 다름
- **해결**: 로그아웃 후 다시 로그인

#### "리프레시 토큰이 없습니다"

- **원인**: `credentials: 'include'` 누락
- **해결**: 모든 API 요청에 쿠키 포함 설정 추가

#### "CORS 오류"

- **원인**: 쿠키 사용 시 CORS 설정 부족
- **해결**: 서버의 CORS 설정에서 `credentials: true` 확인

### 2. 디버깅 팁

```javascript
// 토큰 상태 확인 함수
function debugTokenStatus() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.log("❌ AccessToken이 없습니다.");
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;

    console.log("🔍 토큰 정보:", {
      userId: payload.sub,
      isExpired,
      expiresAt: new Date(payload.exp * 1000),
      timeLeft: isExpired ? "만료됨" : `${payload.exp - now}초`,
    });
  } catch (error) {
    console.log("❌ 토큰 파싱 실패:", error);
  }
}

// 사용법
debugTokenStatus();
```

---

## 📚 추가 리소스

### 관련 문서

- [JWT 공식 문서](https://jwt.io/)
- [HTTP 쿠키 보안](https://developer.mozilla.org/ko/docs/Web/HTTP/Cookies)
- [CORS 설정 가이드](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)

### 권장 라이브러리

- **axios**: HTTP 클라이언트 (인터셉터 지원)
- **js-cookie**: 쿠키 조작 (클라이언트용)
- **react-query**: 서버 상태 관리

이 가이드를 따라 구현하면 안전하고 효율적인 인증 시스템을 구축할 수 있습니다. 추가 질문이 있으시면 언제든 문의해주세요! 🚀
