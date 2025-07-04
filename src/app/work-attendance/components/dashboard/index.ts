// Original dashboard (for backward compatibility)
export { default as DailyAttendanceDashboard } from "./DailyAttendanceDashboard";

// Refactored dashboard and components
export { DailyAttendanceDashboard as DailyAttendanceDashboardRefactored } from "./DailyAttendanceDashboard.refactored";
export { DailySummary } from "./DailySummary";
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export { LoadingSkeleton, CardSkeleton, SummarySkeleton } from "./LoadingSkeleton";
export { HelpSection } from "./HelpSection";