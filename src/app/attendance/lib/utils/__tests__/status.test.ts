import { determineStatus, getStatusMessage, getStatusColor } from "../status";
import { AttendanceStatus, WorkSchedule } from "../../types";

describe("status utils", () => {
  const createSchedule = (
    overrides: Partial<WorkSchedule> = {}
  ): WorkSchedule => ({
    id: 1,
    scheduleStartTime: new Date("2024-01-01T09:00:00"),
    scheduleEndTime: new Date("2024-01-01T17:00:00"),
    clockInTime: null,
    clockOutTime: null,
    isOvernight: false,
    ...overrides,
  });

  describe("determineStatus", () => {
    it("returns NOT_STARTED when no clock times", () => {
      const schedule = createSchedule();
      expect(determineStatus(schedule)).toBe(AttendanceStatus.NOT_STARTED);
    });

    it("returns IN_PROGRESS when only clockInTime exists", () => {
      const schedule = createSchedule({
        clockInTime: new Date("2024-01-01T09:05:00"),
      });
      expect(determineStatus(schedule)).toBe(AttendanceStatus.IN_PROGRESS);
    });

    it("returns COMPLETED when both clockIn/out times exist", () => {
      const schedule = createSchedule({
        clockInTime: new Date("2024-01-01T09:05:00"),
        clockOutTime: new Date("2024-01-01T17:10:00"),
      });
      expect(determineStatus(schedule)).toBe(AttendanceStatus.COMPLETED);
    });
  });

  describe("getStatusMessage", () => {
    it("returns correct message for NOT_STARTED", () => {
      expect(getStatusMessage(AttendanceStatus.NOT_STARTED)).toBe(
        "근무 시작 전"
      );
    });

    it("returns correct message for IN_PROGRESS", () => {
      expect(getStatusMessage(AttendanceStatus.IN_PROGRESS)).toBe("근무 중");
    });

    it("returns correct message for COMPLETED", () => {
      expect(getStatusMessage(AttendanceStatus.COMPLETED)).toBe("근무 완료");
    });
  });

  describe("getStatusColor", () => {
    it("returns a color string", () => {
      expect(getStatusColor(AttendanceStatus.NOT_STARTED)).toEqual(
        expect.any(String)
      );
    });
  });
});
