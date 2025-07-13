import { formatTime, calculateDuration, isOvernight } from "../dateUtils";

describe("dateUtils", () => {
  describe("formatTime", () => {
    it("should format time correctly", () => {
      const date = new Date("2024-01-01T09:30:00");
      expect(formatTime(date)).toBe("09:30");
    });
  });

  describe("calculateDuration", () => {
    it("should calculate duration between two times in minutes", () => {
      const start = new Date("2024-01-01T09:00:00");
      const end = new Date("2024-01-01T17:00:00");
      expect(calculateDuration(start, end)).toBe(480);
    });

    it("should handle overnight shifts", () => {
      const start = new Date("2024-01-01T22:00:00");
      const end = new Date("2024-01-02T06:00:00");
      expect(calculateDuration(start, end)).toBe(480);
    });
  });

  describe("isOvernight", () => {
    it("should detect overnight shifts", () => {
      const start = new Date("2024-01-01T22:00:00");
      const end = new Date("2024-01-02T06:00:00");
      expect(isOvernight(start, end)).toBe(true);
    });

    it("should handle same-day shifts", () => {
      const start = new Date("2024-01-01T09:00:00");
      const end = new Date("2024-01-01T17:00:00");
      expect(isOvernight(start, end)).toBe(false);
    });
  });
});
