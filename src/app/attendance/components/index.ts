// 출석 관련 컴포넌트들을 모듈로 export
// 기존 컴포넌트들을 재사용하여 일관성 확보

// 출석 버튼 관련 컴포넌트
export { 
  AttendanceButton, 
  SimpleAttendanceButton,
  type AttendanceType,
  type ButtonState,
  type AttendanceInfo
} from "@/src/components/AttendanceButton";

// 출석 기록 관련 컴포넌트
export { 
  AttendanceRecord, 
  AttendanceRecordList,
  AttendanceDashboard,
  type AttendanceRecordViewType,
  type AttendanceRecordSize
} from "@/src/components/AttendanceRecord";

// 상태 표시 컴포넌트
export { StatusChip } from "@/src/components/StatusChip";

// 더미 데이터
export { mockAttendanceRecords } from "./mockData";

// 출석 서비스 타입들
export type {
  AttendanceRecord as AttendanceRecordType,
  AttendanceStats,
  AttendanceSummary,
  AttendanceStatus
} from "@/src/services/attendanceService";

// 위치 서비스 타입들
export type {
  LocationAuthResponse,
  WorkplaceLocation,
  LocationData
} from "@/src/services/locationService";