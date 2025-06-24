import { useState, useEffect, useCallback } from "react";
import {
  AuthTokens,
  TestResult,
  LoadingState,
  BusinessOwnerRegistrationForm,
  UserUpdateForm,
} from "./types";
import {
  getAuthTokensFromStorage,
  setAuthTokensToStorage,
  removeAuthTokensFromStorage,
} from "./utils";

// 인증 상태 관리 훅
export const useAuthState = () => {
  const [authTokens, setAuthTokens] = useState<AuthTokens>({
    accessToken: null,
    userId: null,
  });

  useEffect(() => {
    const tokens = getAuthTokensFromStorage();
    setAuthTokens(tokens);
  }, []);

  const updateAuthTokens = useCallback(
    (accessToken: string, userId: string) => {
      setAuthTokensToStorage(accessToken, userId);
      setAuthTokens({ accessToken, userId });
    },
    []
  );

  const clearAuthTokens = useCallback(() => {
    removeAuthTokensFromStorage();
    setAuthTokens({ accessToken: null, userId: null });
  }, []);

  return {
    authTokens,
    updateAuthTokens,
    clearAuthTokens,
  };
};

// 테스트 결과 관리 훅
export const useTestResults = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = useCallback((result: TestResult) => {
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // 최근 10개만 유지
  }, []);

  const clearResults = useCallback(() => {
    setTestResults([]);
  }, []);

  return {
    testResults,
    addTestResult,
    clearResults,
  };
};

// 로딩 상태 관리 훅
export const useLoadingState = () => {
  const [loading, setLoading] = useState<LoadingState>(null);

  const setLoadingState = useCallback((state: LoadingState) => {
    setLoading(state);
  }, []);

  const clearLoading = useCallback(() => {
    setLoading(null);
  }, []);

  return {
    loading,
    setLoadingState,
    clearLoading,
  };
};

// 사업자 등록 폼 관리 훅
export const useBusinessRegistrationForm = () => {
  const [form, setForm] = useState<BusinessOwnerRegistrationForm>({
    businessRegistrationImage: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateForm = useCallback(
    (updates: Partial<BusinessOwnerRegistrationForm>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setForm({
      businessRegistrationImage: "",
    });
    setImagePreview(null);
  }, []);

  const setImage = useCallback((base64: string, preview?: string) => {
    setForm((prev) => ({ ...prev, businessRegistrationImage: base64 }));
    setImagePreview(preview || null);
  }, []);

  const removeImage = useCallback(() => {
    setForm((prev) => ({ ...prev, businessRegistrationImage: "" }));
    setImagePreview(null);
  }, []);

  return {
    form,
    imagePreview,
    updateForm,
    resetForm,
    setImage,
    removeImage,
  };
};

// 사용자 업데이트 폼 관리 훅
export const useUserUpdateForm = () => {
  const [form, setForm] = useState<UserUpdateForm>({
    nickname: "",
    userType: "PART_TIME_JOB",
  });

  const updateForm = useCallback((updates: Partial<UserUpdateForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      nickname: "",
      userType: "PART_TIME_JOB",
    });
  }, []);

  return {
    form,
    updateForm,
    resetForm,
  };
};
