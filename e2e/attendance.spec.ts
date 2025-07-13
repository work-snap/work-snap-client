import { test, expect } from "@playwright/test";

test.describe("Attendance Management", () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to mobile size (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    // Mock authentication
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          accessToken: "mock-token",
          user: {
            id: 1,
            name: "Test User",
            role: "PART_TIME_WORKER",
          },
        }),
      });
    });

    // Navigate to attendance page
    await page.goto("/attendance");
  });

  test("displays attendance page correctly", async ({ page }) => {
    // Check basic page elements
    await expect(
      page.getByRole("heading", { name: "근무 관리" })
    ).toBeVisible();
    await expect(page.getByTestId("date-navigation")).toBeVisible();
  });

  test("shows correct attendance status", async ({ page }) => {
    // Mock attendance data
    await page.route("**/api/attendance/daily**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          records: [
            {
              id: 1,
              workDate: new Date().toISOString().split("T")[0],
              scheduledStartTime: "09:00",
              scheduledEndTime: "18:00",
              actualStartTime: null,
              actualEndTime: null,
              status: "SCHEDULED",
              workplaceId: 1,
              workplaceName: "Test Workplace",
            },
          ],
        }),
      });
    });

    // Verify attendance card content
    await expect(page.getByText("Test Workplace")).toBeVisible();
    await expect(page.getByText("09:00 - 18:00")).toBeVisible();
    await expect(page.getByText("출근 전")).toBeVisible();
  });

  test("handles clock-in flow", async ({ page }) => {
    // Mock clock-in API
    await page.route("**/api/attendance/clock-in", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            actualStartTime: "09:00",
            status: "IN_PROGRESS",
          },
        }),
      });
    });

    // Click clock-in button
    await page.getByRole("button", { name: "출근하기" }).click();

    // Verify status change
    await expect(page.getByText("근무 중")).toBeVisible();
    await expect(page.getByText("09:00")).toBeVisible();
  });

  test("handles clock-out flow", async ({ page }) => {
    // Mock in-progress attendance state
    await page.route("**/api/attendance/daily**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          records: [
            {
              id: 1,
              workDate: new Date().toISOString().split("T")[0],
              scheduledStartTime: "09:00",
              scheduledEndTime: "18:00",
              actualStartTime: "09:00",
              actualEndTime: null,
              status: "IN_PROGRESS",
              workplaceId: 1,
              workplaceName: "Test Workplace",
            },
          ],
        }),
      });
    });

    // Mock clock-out API
    await page.route("**/api/attendance/clock-out/**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            actualEndTime: "18:00",
            status: "COMPLETED",
          },
        }),
      });
    });

    // Click clock-out button
    await page.getByRole("button", { name: "퇴근하기" }).click();

    // Verify status change
    await expect(page.getByText("퇴근 완료")).toBeVisible();
    await expect(page.getByText("09:00 - 18:00")).toBeVisible();
  });

  test("handles error states", async ({ page }) => {
    // Mock API error
    await page.route("**/api/attendance/clock-in", async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({
          success: false,
          error: "출근 처리 중 오류가 발생했습니다.",
        }),
      });
    });

    // Click clock-in button
    await page.getByRole("button", { name: "출근하기" }).click();

    // Verify error message
    await expect(
      page.getByText("출근 처리 중 오류가 발생했습니다.")
    ).toBeVisible();
  });

  test("validates form inputs", async ({ page }) => {
    // Open additional work modal
    await page.getByRole("button", { name: "추가근무 등록" }).click();

    // Try to submit without required fields
    await page.getByRole("button", { name: "등록" }).click();

    // Verify validation messages
    await expect(page.getByText("시작 시간을 선택해주세요.")).toBeVisible();
    await expect(page.getByText("종료 시간을 선택해주세요.")).toBeVisible();
  });
});
