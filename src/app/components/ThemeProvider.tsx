"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // 시스템 테마 감지
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // 실제 적용될 테마 계산
  const actualTheme = theme === "system" ? getSystemTheme() : theme;

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);

      const actualTheme = newTheme === "system" ? getSystemTheme() : newTheme;

      if (actualTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      // 로컬스토리지에서 테마 불러오기
      const savedTheme = localStorage.getItem("theme") as Theme;

      if (savedTheme === "dark") {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      } else if (savedTheme === "system") {
        // 기존에 system으로 저장된 경우도 라이트로 고정
        setTheme("light");
        localStorage.setItem("theme", "light");
        document.documentElement.classList.remove("dark");
      } else {
        // 저장된 테마가 없으면 라이트로 고정
        setTheme("light");
        localStorage.setItem("theme", "light");
        document.documentElement.classList.remove("dark");
      }

      // 시스템 테마 변경 감지
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (theme === "system") {
          const newSystemTheme = getSystemTheme();
          if (newSystemTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // SSR 환경에서는 정리 함수가 필요 없으므로 undefined 반환
    return undefined;
  }, []); // 빈 dependency 배열로 한 번만 실행

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, mounted]); // theme과 mounted가 변경될 때만 실행

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: updateTheme, actualTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
