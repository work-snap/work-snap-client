// 출근 관련 API 서비스 (환경별 자동 선택)
export { attendanceApi, apiFactory } from "./attendance-api-factory";

// 개별 API 서비스들 (필요시 직접 사용)
export { attendanceApi as realAttendanceApi } from "./attendance.api";
export { mockAttendanceApi } from "../mock/attendance-api.mock";
