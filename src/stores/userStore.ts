import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, getUser } from "@/lib/api/user";
import { authApis } from "@/lib/auth/auth";
import { changeUserType } from "@/lib/api/changeUserType";
import { ResisterBusinessResponse } from "@/lib/auth/types";
import api from "@/lib/api";

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastRedirectTime: number;
  businessRegistrationResponse: ResisterBusinessResponse | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  loadUser: () => Promise<void>;
  fallbackToApiCall: (token: string) => Promise<void>;
  clearUser: () => void;
  setLastRedirectTime: (time: number) => void;
  handleRouting: (pathname: string, router: any) => void;

  // Business registration actions
  setBusinessRegistrationResponse: (
    response: ResisterBusinessResponse | null
  ) => void;
  clearBusinessRegistrationResponse: () => void;

  // User type and logout actions (will be called from hooks)
  updateUserType: (
    type: "BUSINESS_OWNER" | "PART_TIME_WORKER"
  ) => Promise<void>;
  logout: () => Promise<void>;

  // Helper methods
  isPending: () => boolean;
  isBusinessOwner: () => boolean;
  isPartTimeWorker: () => boolean;
  isAdmin: () => boolean;
  isBusinessVerified: () => boolean;
  isBusinessPending: () => boolean;
  isBusinessRejected: () => boolean;
  isBusinessReviewing: () => boolean;
  isBusinessNotRequested: () => boolean;
  getRequiredRoute: (currentPath?: string) => string;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isLoading: true,
      error: null,
      lastRedirectTime: 0,
      businessRegistrationResponse: null,

      // Actions
      setUser: (user: User | null) => {
        console.log("[ZUSTAND] 🔄 setUser:", user);
        console.log("[ZUSTAND] 📊 setUser 상세 정보:", {
          hasUser: !!user,
          userType: user?.userType,
          businessVerificationStatus: user?.businessVerificationStatus,
          id: user?.id,
          timestamp: new Date().toISOString(),
        });
        set({ user, isLoading: false });
        console.log("[ZUSTAND] ✅ setUser 완료 - 상태 업데이트됨");
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          console.log("[ZUSTAND] 🔄 updateUser:", updatedUser);
          set({ user: updatedUser });
          // localStorage 캐시도 업데이트
          localStorage.setItem("user", JSON.stringify(updatedUser));
          console.log(
            "[ZUSTAND] 📝 updateUser - 사용자 정보 및 캐시 업데이트:",
            updatedUser
          );
        }
      },

      loadUser: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log("[ZUSTAND] 📡 사용자 정보 로드 시작");

          const token = localStorage.getItem("accessToken");
          const cachedUser = localStorage.getItem("user");
          console.log(
            "[ZUSTAND] 🔍 토큰 확인:",
            token ? "토큰 존재" : "토큰 없음"
          );
          console.log(
            "[ZUSTAND] 🔍 캐시된 사용자 확인:",
            cachedUser ? "캐시된 사용자 존재" : "캐시된 사용자 없음"
          );

          if (!token) {
            console.log("[ZUSTAND] 🔓 토큰 없음 - 비로그인 상태");
            set({ user: null, isLoading: false });
            return;
          }

          // 캐시된 사용자 정보가 있으면 즉시 로드 (빠른 UI 반응)
          if (token && cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);
              set({ user: parsedUser, isLoading: false });
              console.log(
                "[ZUSTAND] ⚡ 캐시된 사용자 정보 즉시 로드:",
                parsedUser
              );

              // 백그라운드에서 API 호출로 최신 정보 동기화
              api.setAuthToken(token);
              console.log(
                "[ZUSTAND] 📡 백그라운드에서 토큰 검증 시작:",
                token?.substring(0, 20) + "..."
              );

              try {
                const userData = await getUser();
                console.log(
                  "[ZUSTAND] ✅ 최신 사용자 정보 동기화 완료:",
                  userData
                );

                // 사업자 인증 상태가 변경된 경우 즉시 업데이트
                const currentUser = get().user;
                const businessStatusChanged =
                  currentUser?.businessVerificationStatus !==
                  userData.businessVerificationStatus;

                if (businessStatusChanged) {
                  console.log("[ZUSTAND] 🔄 사업자 인증 상태 변경 감지:", {
                    이전: currentUser?.businessVerificationStatus,
                    현재: userData.businessVerificationStatus,
                  });
                }

                set({ user: userData });
                // 백그라운드 동기화 후 localStorage 캐시도 업데이트
                localStorage.setItem("user", JSON.stringify(userData));
                console.log(
                  "[ZUSTAND] 📝 백그라운드 동기화 후 캐시 업데이트:",
                  userData
                );
              } catch (backgroundError: any) {
                // 백그라운드 동기화 중 401 에러 발생 시 refreshToken 시도
                if (backgroundError?.response?.status === 401) {
                  console.log(
                    "[ZUSTAND] 🔄 백그라운드 동기화 중 401 에러 - RefreshToken으로 토큰 갱신 시도"
                  );
                  try {
                    const refreshResponse = await authApis.refreshToken();
                    const newAccessToken = refreshResponse.data.accessToken;
                    console.log(
                      "[ZUSTAND] ✅ 백그라운드에서 RefreshToken으로 새로운 토큰 발급 성공"
                    );

                    // 새로운 토큰으로 다시 사용자 정보 조회
                    api.setAuthToken(newAccessToken);
                    const userData = await getUser();
                    console.log(
                      "[ZUSTAND] ✅ 새로운 토큰으로 백그라운드 동기화 성공:",
                      userData
                    );

                    set({ user: userData });
                    localStorage.setItem("user", JSON.stringify(userData));
                  } catch (refreshError: any) {
                    console.error(
                      "[ZUSTAND] ❌ 백그라운드 RefreshToken 갱신 실패:",
                      refreshError
                    );
                    // RefreshToken 실패 시에도 캐시된 사용자 정보는 유지 (사용자 경험 향상)
                  }
                } else {
                  console.warn(
                    "[ZUSTAND] ⚠️ 백그라운드 동기화 실패, 캐시된 정보 유지:",
                    backgroundError?.message
                  );
                }
              }
            } catch (parseError) {
              console.warn(
                "[ZUSTAND] ⚠️ 캐시된 사용자 정보 파싱 실패, API 호출로 대체"
              );
              // 파싱 실패 시 API 호출로 대체
              await get().fallbackToApiCall(token);
            }
          } else if (token) {
            // 토큰만 있고 캐시된 사용자 정보가 없는 경우
            await get().fallbackToApiCall(token);
          }
        } catch (error: any) {
          console.error("[ZUSTAND] ❌ 사용자 정보 로드 실패:", {
            message: error?.message,
            stack: error?.stack,
          });
          set({
            error: "사용자 정보를 불러오는데 실패했습니다.",
            isLoading: false,
          });
        }
      },

      fallbackToApiCall: async (token: string) => {
        try {
          api.setAuthToken(token);
          console.log(
            "[ZUSTAND] 📡 토큰 검증 API 호출:",
            token?.substring(0, 20) + "..."
          );
          const userData = await getUser();
          console.log("[ZUSTAND] ✅ API 응답:", userData);

          set({ user: userData, isLoading: false });
          // 최신 정보를 캐시에 저장
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error: any) {
          console.error("[ZUSTAND] ❌ 토큰 검증 실패:", {
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
            url: error?.config?.url,
          });

          // 401 에러인 경우 refreshToken으로 새로운 토큰 발급 시도
          if (error?.response?.status === 401) {
            console.log(
              "[ZUSTAND] 🔄 401 에러 발생 - RefreshToken으로 토큰 갱신 시도"
            );
            try {
              const refreshResponse = await authApis.refreshToken();
              const newAccessToken = refreshResponse.data.accessToken;
              console.log(
                "[ZUSTAND] ✅ RefreshToken으로 새로운 토큰 발급 성공"
              );

              // 새로운 토큰으로 다시 사용자 정보 조회
              api.setAuthToken(newAccessToken);
              const userData = await getUser();
              console.log(
                "[ZUSTAND] ✅ 새로운 토큰으로 사용자 정보 조회 성공:",
                userData
              );

              set({ user: userData, isLoading: false });
              localStorage.setItem("user", JSON.stringify(userData));
            } catch (refreshError: any) {
              console.error(
                "[ZUSTAND] ❌ RefreshToken으로 토큰 갱신 실패:",
                refreshError
              );
              // RefreshToken도 만료된 경우 완전히 로그아웃
              localStorage.removeItem("accessToken");
              localStorage.removeItem("user");
              api.removeAuthToken();
              set({ user: null, isLoading: false });
            }
          } else {
            // 401이 아닌 다른 에러인 경우
            set({
              error: "사용자 정보를 불러오는데 실패했습니다.",
              isLoading: false,
            });
          }
        }
      },

      clearUser: () => {
        console.log("[ZUSTAND] 🗑️ 사용자 정보 초기화");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        api.removeAuthToken();
        set({
          user: null,
          error: null,
          isLoading: false,
          // businessRegistrationResponse는 로그아웃 시에도 유지 (회원가입 플로우에서 사용)
        });
      },

      // Business registration actions
      setBusinessRegistrationResponse: (
        response: ResisterBusinessResponse | null
      ) => {
        console.log("[ZUSTAND] 🏢 사업자 등록 응답 저장:", response);
        set({ businessRegistrationResponse: response });
      },

      clearBusinessRegistrationResponse: () => {
        console.log("[ZUSTAND] 🗑️ 사업자 등록 응답 초기화");
        set({ businessRegistrationResponse: null });
      },

      setLastRedirectTime: (time: number) => {
        set({ lastRedirectTime: time });
      },

      handleRouting: (pathname: string, router: any) => {
        console.log("[ZUSTAND] 🚦 handleRouting 시작!");

        const { user, isLoading, lastRedirectTime } = get();

        console.log("[ZUSTAND] 📊 현재 상태:", {
          hasUser: !!user,
          isLoading,
          lastRedirectTime,
          pathname,

          userInfo: user
            ? {
                id: user.id,
                userType: user.userType,
                userRole: user.userRole,
                businessStatus: user.businessVerificationStatus,
              }
            : null,
        });

        // 로딩 중이면 중단
        if (isLoading) {
          console.log("[ZUSTAND] 🔄 라우팅 대기: 로딩 중");
          return;
        }

        // 사용자 정보가 없는 경우에도 라우팅 체크 (비로그인 페이지로 리다이렉트)
        if (!user) {
          console.log(
            "[ZUSTAND] 👤 사용자 정보 없음 - 비로그인 상태 라우팅 체크"
          );
        }

        // 디바운싱: 1초 내 중복 실행 방지 (강화)
        const now = Date.now();
        if (now - lastRedirectTime < 1000) {
          console.log("[ZUSTAND] ⏱️ 디바운싱: 1초 대기 중");
          return;
        }

        console.log("[ZUSTAND] 🚦 자동 리다이렉트 체크 시작");
        console.log("[ZUSTAND] 📍 현재 경로:", pathname);
        console.log("[ZUSTAND] 👤 사용자 상태:", {
          userId: user?.id,
          userType: user?.userType,
          userRole: user?.userRole,
          businessStatus: user?.businessVerificationStatus,
          isLoading,
        });

        console.log("[ZUSTAND] 🔍 getRequiredRoute 호출 전");
        const requiredRoute = get().getRequiredRoute(pathname);
        console.log("[ZUSTAND] 🔍 getRequiredRoute 호출 후");
        console.log("[ZUSTAND] 🎯 필요한 경로:", requiredRoute);
        console.log("[ZUSTAND] 🔍 경로 비교:", {
          current: pathname,
          required: requiredRoute,
          needsRedirect: pathname !== requiredRoute,
        });

        // 경로가 같은 경우 리다이렉트하지 않음
        if (pathname === requiredRoute) {
          console.log("[ZUSTAND] ✅ 올바른 경로에 있음:", pathname);
          return;
        }

        // 현재 경로가 필요한 경로의 하위 경로인 경우 리다이렉트하지 않음
        if (pathname.startsWith(requiredRoute + "/")) {
          console.log("[ZUSTAND] ✅ 현재 경로가 필요한 경로의 하위 경로:", {
            current: pathname,
            required: requiredRoute,
          });
          return;
        }

        // 필요한 경로가 현재 경로의 하위인 경우 리다이렉트 필요
        if (requiredRoute.startsWith(pathname + "/")) {
          console.log(
            "[ZUSTAND] 🔄 필요한 경로가 현재 경로의 하위 경로 → 리다이렉트 필요:",
            { current: pathname, required: requiredRoute }
          );
        }

        // 경로가 다른 경우 무조건 리다이렉트 (간단하고 확실한 방법)
        console.log("[ZUSTAND] 🔄 경로가 다름 → 리다이렉트 필요:", {
          current: pathname,
          required: requiredRoute,
        });

        // 리다이렉트 실행
        console.log(
          "[ZUSTAND] 🔀 리다이렉트 실행:",
          pathname,
          "→",
          requiredRoute
        );
        console.log("[ZUSTAND] 🚀 router.push 호출 직전!");
        console.log("[ZUSTAND] 📊 현재 사용자 상태:", {
          userType: user?.userType,
          businessVerificationStatus: user?.businessVerificationStatus,
          userId: user?.id,
        });
        set({ lastRedirectTime: now });

        try {
          router.push(requiredRoute);
          console.log("[ZUSTAND] 🚀 router.push 호출 완료!");

          // ✅ 200ms 후에도 경로가 변경되지 않으면 window.location 사용
          setTimeout(() => {
            if (window.location.pathname !== requiredRoute) {
              console.log(
                "[ZUSTAND] ⚠️ router.push 실패 감지 - window.location.href로 fallback"
              );
              window.location.href = requiredRoute;
            }
          }, 200);
        } catch (error) {
          console.error(
            "[ZUSTAND] ❌ router.push 실패 - 즉시 fallback:",
            error
          );
          window.location.href = requiredRoute;
        }
      },

      // User type and logout - now with actual implementations
      updateUserType: async (type: "BUSINESS_OWNER" | "PART_TIME_WORKER") => {
        try {
          console.log("[ZUSTAND] 🔄 사용자 타입 변경 시작:", type);

          // API 호출로 사용자 타입 변경
          const response = await changeUserType({ userType: type });
          console.log("[ZUSTAND] ✅ 사용자 타입 변경 성공:", response);

          // 변경 후 최신 사용자 정보 다시 로드
          const userData = await getUser();
          console.log("[ZUSTAND] 📱 최신 사용자 정보 동기화:", userData);

          set({ user: userData });
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error: any) {
          console.error("[ZUSTAND] ❌ 사용자 타입 변경 실패:", error);
          throw error;
        }
      },

      logout: async () => {
        try {
          console.log("[ZUSTAND] 🚪 로그아웃 시작");

          // API 호출로 서버에 로그아웃 요청
          await authApis.logout();
          console.log("[ZUSTAND] ✅ 서버 로그아웃 성공");

          // 로컬 상태 및 저장소 정리
          get().clearUser();
        } catch (error: any) {
          console.error("[ZUSTAND] ❌ 로그아웃 API 실패:", error);
          // API 실패해도 로컬 정리는 수행
          get().clearUser();
        }
      },

      // Helper methods
      isPending: () => get().user?.userType === "PENDING",
      isBusinessOwner: () => get().user?.userType === "BUSINESS_OWNER",
      isPartTimeWorker: () => get().user?.userType === "PART_TIME_WORKER",
      isAdmin: () => {
        const user = get().user;
        return user?.userRole === "ADMIN" || user?.userRole === "SUPER_ADMIN";
      },

      isBusinessVerified: () => {
        const user = get().user;
        return (
          user?.businessVerificationStatus === "APPROVED" ||
          user?.businessVerificationStatus === "VERIFIED"
        );
      },

      isBusinessPending: () =>
        get().user?.businessVerificationStatus === "PENDING",
      isBusinessRejected: () =>
        get().user?.businessVerificationStatus === "REJECTED",
      isBusinessReviewing: () =>
        get().user?.businessVerificationStatus === "REVIEWING",
      isBusinessNotRequested: () =>
        get().user?.businessVerificationStatus === "NOT_REQUESTED",

      getRequiredRoute: (currentPath?: string): string => {
        const user = get().user;
        console.log("[ZUSTAND] 🛣️ getRequiredRoute 호출됨");
        console.log("[ZUSTAND] 👤 현재 user 상태:", {
          hasUser: !!user,
          userType: user?.userType,
          userRole: user?.userRole,
          businessVerificationStatus: user?.businessVerificationStatus,
          currentPath,
          fullUser: user,
        });

        if (!user) {
          console.log("[ZUSTAND] 🔓 사용자 없음 → 홈으로");
          return "/";
        }

        console.log("[ZUSTAND] 🔀 userType에 따른 라우팅:", user.userType);

        switch (user.userType) {
          case "PENDING":
            console.log("[ZUSTAND] ⏳ PENDING → 타입 선택 페이지");
            return "/signup";

          case "BUSINESS_OWNER":
            console.log("[ZUSTAND] 🏢 BUSINESS_OWNER 감지");
            console.log(
              "[ZUSTAND] 📋 사업자 인증 상태:",
              user.businessVerificationStatus
            );

            if (
              user.businessVerificationStatus === null ||
              user.businessVerificationStatus === "NOT_REQUESTED"
            ) {
              console.log("[ZUSTAND] ⏳ 사업자 인증 신청 전");

              // 현재 경로가 사업자 등록 플로우 경로면 그대로 유지
              if (currentPath?.startsWith("/signup/business/")) {
                console.log(
                  "[ZUSTAND] ✅ 사업자 등록 플로우 경로 → 현재 경로 유지:",
                  currentPath
                );
                return currentPath;
              }

              // 현재 경로가 사업자 허용 경로에 있으면 그대로 유지
              if (currentPath?.startsWith("/user/business/")) {
                console.log(
                  "[ZUSTAND] ✅ 사업자 허용 경로에 있음 → 현재 경로 유지:",
                  currentPath
                );
                return currentPath;
              }

              console.log("[ZUSTAND] 🔄 기본 경로로 리다이렉트 → signup-1");
              return "/signup/business/signup-1";
            }

            if (user.businessVerificationStatus === "PENDING") {
              console.log("[ZUSTAND] ⏳ 사업자 인증 대기 중");

              // 현재 경로가 사업자 허용 경로에 있으면 그대로 유지
              if (currentPath?.startsWith("/user/business/")) {
                console.log(
                  "[ZUSTAND] ✅ 사업자 허용 경로에 있음 → 현재 경로 유지:",
                  currentPath
                );
                return currentPath;
              }

              // PENDING 상태에서는 /user/business/add-business로 이동
              // (이미 등록을 완료한 상태이므로)
              console.log(
                "[ZUSTAND] 🔄 사업자 인증 대기 → add-business로 리다이렉트"
              );
              return "/user/business/add-business";
            }

            if (user.businessVerificationStatus === "REJECTED") {
              console.log("[ZUSTAND] ❌ 사업자 인증 거부 → 재인증 페이지");
              return "/signup/business/re-authentication";
            }

            if (user.businessVerificationStatus === "REVIEWING") {
              console.log("[ZUSTAND] 🔄 사업자 인증 검토 중 → 성공 페이지");
              return "/signup/business/reviewing";
            }

            if (
              user.businessVerificationStatus === "APPROVED" ||
              user.businessVerificationStatus === "VERIFIED"
            ) {
              console.log("[ZUSTAND] ✅ 사업자 인증 완료");

              // 현재 경로가 회원가입 플로우 경로인 경우 메인으로 리다이렉트
              if (currentPath?.startsWith("/signup/business")) {
                console.log(
                  "[ZUSTAND] 🔄 인증 완료된 사용자가 회원가입 플로우에 접근 → add-business로 리다이렉트"
                );
                return "/user/business/add-business";
              }

              // 현재 경로가 /user/business/** 인 경우 리다이렉트하지 않음
              if (currentPath?.startsWith("/user/business/")) {
                console.log(
                  "[ZUSTAND] ✅ 사업자 허용 경로에 있음 → 리다이렉트 안함"
                );
                return currentPath;
              }

              console.log(
                "[ZUSTAND] 🔄 사업자 허용 경로 밖 → add-business로 리다이렉트"
              );
              return "/user/business/add-business";
            }

            // 기본값: 사업자 인증 신청 전 상태
            console.log("[ZUSTAND] 🔄 사업자 기본값 → signup-1");
            return "/signup/business/signup-1";

          case "PART_TIME_WORKER":
            console.log("[ZUSTAND] 👷 PART_TIME_WORKER 감지");

            // 허용된 경로: /user/ptjob/**, /signup/ptjob
            const allowedPaths = [
              "/user/ptjob/",
              "/signup/ptjob",
              "/attendance",
            ];
            const isAllowedPath = allowedPaths.some(
              (path) =>
                currentPath?.startsWith(path) ||
                currentPath === path.slice(0, -1)
            );

            if (currentPath && isAllowedPath) {
              console.log(
                "[ZUSTAND] ✅ 알바생 허용 경로에 있음 → 리다이렉트 안함"
              );
              return currentPath;
            }

            // 현재 경로가 /signup에서 온 경우에만 환영 페이지로 이동
            // 그 외의 경우(로그인 후)에는 바로 메인 페이지로 이동
            if (currentPath === "/signup") {
              console.log(
                "[ZUSTAND] 🔄 알바생 가입 중 → signup/ptjob으로 리다이렉트"
              );
              return "/signup/ptjob";
            } else {
              console.log(
                "[ZUSTAND] 🔄 알바생 로그인 후 → job-list로 리다이렉트"
              );
              return "/user/ptjob/job-list";
            }

          default:
            console.log("[ZUSTAND] ❓ 알 수 없는 userType → 홈으로");
            return "/";
        }
      },
    }),
    {
      name: "user-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user, // Only persist user data
        businessRegistrationResponse: state.businessRegistrationResponse, // 사업자 등록 응답도 저장
        // Don't persist loading, error, lastRedirectTime
      }),
    }
  )
);
