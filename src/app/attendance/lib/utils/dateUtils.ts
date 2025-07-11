import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const formatTime = (date?: Date): string => {
  if (!date) return "--:--";
  return format(date, "HH:mm");
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
