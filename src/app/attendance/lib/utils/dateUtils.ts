import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * Formats a Date object to HH:mm format
 */
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Calculates duration between two times in minutes
 */
export const calculateDuration = (start: Date, end: Date): number => {
  if (end < start) return 0;

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
};

/**
 * Checks if a schedule spans overnight (crosses midnight)
 */
export const isOvernight = (start: Date, end: Date): boolean => {
  return start.getDate() !== end.getDate();
};

export const formatDate = (date: Date): string => {
  return format(date, "M월 d일 (EEEE)", { locale: ko });
};

export const formatDateTime = (date: Date): string => {
  return format(date, "M월 d일 HH:mm", { locale: ko });
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}분`;
  }

  return remainingMinutes === 0
    ? `${hours}시간`
    : `${hours}시간 ${remainingMinutes}분`;
};
