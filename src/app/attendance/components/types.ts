export interface ScedulesProps {
  id: number;
  workplaceId: number;
  workplaceName: string;
  userId: number;
  dayOfWeek: string;
  dayOfWeekKorean: string;
  startTime: string;
  endTime: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  workingHours: number;
  isActive: boolean;
  attendanceRecord: AttendanceRecordProps | null;
  currentStatus: string;
}

export interface AttendanceRecordProps {
  id: number;
  userId: number;
  scheduleId: number;
  workplaceId: number;
  workplaceName?: string;
  attendanceType: string;
  attendanceStatus: string;
  checkInTime?: string;
  checkOutTime?: string;
  workDurationMinutes?: number;
  overtimeDurationMinutes?: number;
  workingHours?: number;
  overtimeHours?: number;
  totalWorkingHours?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isWorkCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
