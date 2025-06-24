import { TestResult } from "./types";

// 테스트 결과 생성 함수
export const createTestResult = (
  endpoint: string,
  method: string,
  response?: any,
  error?: any
): TestResult => ({
  endpoint,
  method,
  status: response?.status || error?.response?.status || null,
  data: response?.data || null,
  error: error?.message || error?.response?.data || null,
  timestamp: new Date().toLocaleTimeString(),
});

// HTTP 상태 코드에 따른 색상 반환
export const getStatusColor = (status: number | null): string => {
  if (!status) return "text-gray-500";
  if (status >= 200 && status < 300) return "text-green-600";
  if (status >= 400 && status < 500) return "text-yellow-600";
  return "text-red-600";
};

// 이미지 파일 검증
export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // 파일 타입 검증
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "이미지 파일만 업로드 가능합니다." };
  }

  // 파일 크기 검증 (5MB 제한)
  if (file.size > 5 * 1024 * 1024) {
    return {
      isValid: false,
      error: "파일 크기는 5MB 이하만 업로드 가능합니다.",
    };
  }

  return { isValid: true };
};

// 파일을 base64로 변환
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 로컬스토리지에서 인증 토큰 가져오기
export const getAuthTokensFromStorage = () => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  return { accessToken, userId };
};

// 로컬스토리지에 인증 토큰 저장
export const setAuthTokensToStorage = (accessToken: string, userId: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("userId", userId);
};

// 로컬스토리지에서 인증 토큰 제거
export const removeAuthTokensFromStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
};

// 숫자만 추출 (사업자등록번호, 인증코드용)
export const extractNumbers = (value: string): string => {
  return value.replace(/\D/g, "");
};

// 더미 이미지 base64 데이터
export const DUMMY_IMAGE_BASE64 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/test";

// 서류 타입 옵션
export const DOCUMENT_TYPE_OPTIONS = [
  { value: "BUSINESS_LICENSE", label: "영업허가증" },
  { value: "TAX_CERTIFICATE", label: "납세증명서" },
  { value: "BANK_STATEMENT", label: "통장사본" },
  { value: "ID_CARD", label: "신분증" },
  { value: "BUSINESS_REGISTRATION", label: "사업자등록증" },
  { value: "OTHER", label: "기타 서류" },
];

// 사용자 타입 옵션
export const USER_TYPE_OPTIONS = [
  { value: "PART_TIME_JOB", label: "PART_TIME_JOB" },
  { value: "BUSINESS_OWNER", label: "BUSINESS_OWNER" },
];
