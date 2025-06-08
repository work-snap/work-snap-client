"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "system") {
      return "🖥️";
    }
    return actualTheme === "dark" ? "🌙" : "☀️";
  };

  const getThemeLabel = () => {
    if (theme === "system") {
      return "시스템";
    }
    return actualTheme === "dark" ? "다크" : "라이트";
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        relative inline-flex items-center gap-2 px-4 py-2 
        bg-surface-light dark:bg-surface-dark
        border border-border-light dark:border-border-dark
        rounded-lg shadow-soft
        text-text-primary-light dark:text-text-primary-dark
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-all duration-200 ease-in-out
        group
      "
      title={`현재: ${getThemeLabel()} 모드 (클릭하여 변경)`}
    >
      <span className="text-lg transition-transform duration-200 group-hover:scale-110">{getThemeIcon()}</span>
      <span className="text-sm font-medium">{getThemeLabel()}</span>
    </button>
  );
}

// 심플한 아이콘만 있는 버전
export function ThemeToggleIcon() {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="
        p-2 rounded-lg
        bg-surface-light dark:bg-surface-dark
        border border-border-light dark:border-border-dark
        text-text-primary-light dark:text-text-primary-dark
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-all duration-200 ease-in-out
        group
      "
      title={`테마 변경 (현재: ${theme === "system" ? "시스템" : actualTheme === "dark" ? "다크" : "라이트"})`}
    >
      <span className="text-xl transition-transform duration-200 group-hover:scale-110 block">
        {theme === "system" ? "🖥️" : actualTheme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
