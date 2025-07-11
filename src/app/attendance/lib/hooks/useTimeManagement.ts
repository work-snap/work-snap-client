import { format, differenceInMinutes, isAfter, isBefore, set } from "date-fns";

export const useTimeManagement = () => {
  const formatTime = (date: Date): string => {
    return format(date, "HH:mm");
  };

  const isOvernight = (startTime: Date, endTime: Date): boolean => {
    const startDay = set(startTime, { hours: 0, minutes: 0, seconds: 0 });
    const endDay = set(endTime, { hours: 0, minutes: 0, seconds: 0 });
    return !isSameDay(startDay, endDay);
  };

  const calculateDuration = (startTime: Date, endTime: Date): number => {
    return differenceInMinutes(endTime, startTime);
  };

  const isLate = (scheduledTime: Date, actualTime: Date): boolean => {
    return isAfter(actualTime, scheduledTime);
  };

  const isEarly = (scheduledTime: Date, actualTime: Date): boolean => {
    return isBefore(actualTime, scheduledTime);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}분`;
    }

    return remainingMinutes === 0
      ? `${hours}시간`
      : `${hours}시간 ${remainingMinutes}분`;
  };

  return {
    formatTime,
    isOvernight,
    calculateDuration,
    isLate,
    isEarly,
    formatDuration,
  };
};

function isSameDay(dateLeft: Date, dateRight: Date): boolean {
  return dateLeft.getTime() === dateRight.getTime();
}
