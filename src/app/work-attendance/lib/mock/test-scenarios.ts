import { AttendanceRes, AttendanceStatus } from "../types";
import { mockAttendanceApi } from "./attendance-api.mock";

/**
 * 테스트 시나리오 정의
 * 다양한 출근 상황을 시뮬레이션하기 위한 시나리오들
 */

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  setup: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

/**
 * 시나리오 1: 정상적인 하루 근무 플로우
 */
export const normalWorkDayScenario: TestScenario = {
  id: "normal-work-day",
  name: "정상적인 하루 근무",
  description: "09:00-18:00 정규 근무를 정상적으로 출근/퇴근하는 시나리오",
  setup: async () => {
    console.log("🎬 시나리오: 정상적인 하루 근무 시작");
    
    // 1. 아침 9시에 정상 출근
    await mockAttendanceApi.clockIn(1, {
      actualTime: getTodayTimeString("09:00"),
      notes: "정시에 출근했습니다",
    });
    
    console.log("✅ 정상 출근 완료 (09:00)");
  },
};

/**
 * 시나리오 2: 조기 출근 후 정상 퇴근
 */
export const earlyArrivalScenario: TestScenario = {
  id: "early-arrival",
  name: "조기 출근 시나리오",
  description: "08:30에 조기 출근 후 18:00에 정상 퇴근하는 시나리오",
  setup: async () => {
    console.log("🎬 시나리오: 조기 출근 시작");
    
    // 1. 아침 8:30에 조기 출근
    await mockAttendanceApi.clockIn(1, {
      actualTime: getTodayTimeString("08:30"),
      manualClockInType: "EARLY_ARRIVAL",
      notes: "회의 준비를 위해 일찍 출근",
    });
    
    console.log("✅ 조기 출근 완료 (08:30)");
    
    // 2. 저녁 6시에 정상 퇴근
    await mockAttendanceApi.clockOut(1, {
      actualTime: getTodayTimeString("18:00"),
      notes: "정시 퇴근",
    });
    
    console.log("✅ 정상 퇴근 완료 (18:00)");
  },
};

/**
 * 시나리오 3: 정상 출근 후 조퇴
 */
export const earlyDepartureScenario: TestScenario = {
  id: "early-departure",
  name: "조퇴 시나리오",
  description: "09:00에 정상 출근 후 15:00에 조퇴하는 시나리오",
  setup: async () => {
    console.log("🎬 시나리오: 조퇴 시나리오 시작");
    
    // 1. 아침 9시에 정상 출근
    await mockAttendanceApi.clockIn(1, {
      actualTime: getTodayTimeString("09:00"),
      notes: "정시 출근",
    });
    
    console.log("✅ 정상 출근 완료 (09:00)");
    
    // 2. 오후 3시에 조퇴
    await mockAttendanceApi.clockOut(1, {
      actualTime: getTodayTimeString("15:00"),
      manualClockOutType: "EARLY_DEPARTURE",
      notes: "개인 사정으로 조퇴",
    });
    
    console.log("✅ 조퇴 완료 (15:00)");
  },
};

/**
 * 시나리오 4: 연장 근무
 */
export const overtimeScenario: TestScenario = {
  id: "overtime",
  name: "연장 근무 시나리오",
  description: "09:00에 출근 후 20:00까지 연장 근무하는 시나리오",
  setup: async () => {
    console.log("🎬 시나리오: 연장 근무 시작");
    
    // 1. 아침 9시에 정상 출근
    await mockAttendanceApi.clockIn(1, {
      actualTime: getTodayTimeString("09:00"),
      notes: "정시 출근",
    });
    
    console.log("✅ 정상 출근 완료 (09:00)");
    
    // 2. 저녁 8시에 연장 근무 종료
    await mockAttendanceApi.clockOut(1, {
      actualTime: getTodayTimeString("20:00"),
      manualClockOutType: "LATE_DEPARTURE",
      notes: "프로젝트 마감으로 인한 연장 근무",
    });
    
    console.log("✅ 연장 근무 완료 (20:00)");
  },
};

/**
 * 시나리오 5: 추가 근무 플로우
 */
export const additionalWorkScenario: TestScenario = {
  id: "additional-work",
  name: "추가 근무 시나리오",
  description: "정규 근무 외 19:00-22:00 추가 근무하는 시나리오",
  setup: async () => {
    console.log("🎬 시나리오: 추가 근무 시작");
    
    // 1. 추가 근무 시작 (19:00)
    await mockAttendanceApi.clockIn(7, {
      actualTime: getTodayTimeString("19:00"),
      notes: "추가 업무 시작",
    });
    
    console.log("✅ 추가 근무 시작 (19:00)");
    
    // 2. 추가 근무 종료 (22:30)
    await mockAttendanceApi.clockOut(7, {
      actualTime: getTodayTimeString("22:30"),
      notes: "추가 업무 완료",
    });
    
    console.log("✅ 추가 근무 완료 (22:30)");
  },
};

/**
 * 시나리오 6: 야간 근무 플로우
 */
export const overnightWorkScenario: TestScenario = {
  id: "overnight-work",
  name: "야간 근무 시나리오",
  description: "23:00에 야간 근무 시작하여 다음날 07:00에 종료하는 시나리오",
  setup: async () => {
    console.log("🎬 시나리오: 야간 근무 시작");
    
    // 1. 밤 11시에 야간 근무 시작
    await mockAttendanceApi.clockIn(5, {
      actualTime: getTodayTimeString("23:00"),
      notes: "야간 근무 시작",
    });
    
    console.log("✅ 야간 근무 시작 (23:00)");
    
    // 2. 다음날 아침 7시에 야간 근무 종료
    await mockAttendanceApi.clockOut(5, {
      actualTime: getTomorrowTimeString("07:00"),
      notes: "야간 근무 완료",
    });
    
    console.log("✅ 야간 근무 완료 (다음날 07:00)");
  },
};

/**
 * 시나리오 7: 복잡한 하루 (정규 + 추가 근무)
 */
export const complexDayScenario: TestScenario = {
  id: "complex-day",
  name: "복잡한 하루 시나리오",
  description: "정규 근무 + 추가 근무를 모두 수행하는 복잡한 하루",
  setup: async () => {
    console.log("🎬 시나리오: 복잡한 하루 시작");
    
    // 1. 정규 근무 시작 (09:00)
    await mockAttendanceApi.clockIn(1, {
      actualTime: getTodayTimeString("09:00"),
      notes: "정규 근무 시작",
    });
    
    // 2. 정규 근무 종료 (18:00)
    await mockAttendanceApi.clockOut(1, {
      actualTime: getTodayTimeString("18:00"),
      notes: "정규 근무 완료",
    });
    
    console.log("✅ 정규 근무 완료 (09:00-18:00)");
    
    // 3. 추가 근무 시작 (19:00)
    await mockAttendanceApi.clockIn(7, {
      actualTime: getTodayTimeString("19:00"),
      notes: "추가 근무 시작",
    });
    
    // 4. 추가 근무 종료 (22:00)
    await mockAttendanceApi.clockOut(7, {
      actualTime: getTodayTimeString("22:00"),
      notes: "추가 근무 완료",
    });
    
    console.log("✅ 추가 근무 완료 (19:00-22:00)");
    console.log("🎉 복잡한 하루 시나리오 완료!");
  },
};

/**
 * 전체 시나리오 목록
 */
export const testScenarios: TestScenario[] = [
  normalWorkDayScenario,
  earlyArrivalScenario,
  earlyDepartureScenario,
  overtimeScenario,
  additionalWorkScenario,
  overnightWorkScenario,
  complexDayScenario,
];

/**
 * 시나리오 실행기
 */
export class ScenarioRunner {
  private currentScenario: TestScenario | null = null;

  /**
   * 특정 시나리오 실행
   */
  async runScenario(scenarioId: string): Promise<void> {
    const scenario = testScenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`시나리오를 찾을 수 없습니다: ${scenarioId}`);
    }

    console.log(`🎬 시나리오 실행 중: ${scenario.name}`);
    console.log(`📝 설명: ${scenario.description}`);

    this.currentScenario = scenario;
    
    try {
      await scenario.setup();
      console.log(`✅ 시나리오 완료: ${scenario.name}`);
    } catch (error) {
      console.error(`❌ 시나리오 실행 실패: ${scenario.name}`, error);
      throw error;
    }
  }

  /**
   * 현재 시나리오 정리
   */
  async cleanup(): Promise<void> {
    if (this.currentScenario?.cleanup) {
      await this.currentScenario.cleanup();
    }
    this.currentScenario = null;
    
    // Mock 데이터 초기화
    mockAttendanceApi.resetMockData();
    console.log("🧹 시나리오 정리 완료");
  }

  /**
   * 모든 시나리오 목록 출력
   */
  listScenarios(): void {
    console.log("📋 사용 가능한 시나리오:");
    testScenarios.forEach(scenario => {
      console.log(`- ${scenario.id}: ${scenario.name}`);
      console.log(`  ${scenario.description}`);
    });
  }
}

/**
 * 헬퍼 함수들
 */
function getTodayTimeString(time: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `${today}T${time}:00`;
}

function getTomorrowTimeString(time: string): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  return `${tomorrowStr}T${time}:00`;
}

// 전역 시나리오 러너 인스턴스
export const scenarioRunner = new ScenarioRunner();

// 개발 환경에서 전역 변수로 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).scenarioRunner = scenarioRunner;
  (window as any).runTestScenario = (id: string) => scenarioRunner.runScenario(id);
  (window as any).listTestScenarios = () => scenarioRunner.listScenarios();
  (window as any).cleanupScenarios = () => scenarioRunner.cleanup();
  
  console.log("🎭 테스트 시나리오 도구가 설정되었습니다:");
  console.log("- runTestScenario(id): 시나리오 실행");
  console.log("- listTestScenarios(): 시나리오 목록");
  console.log("- cleanupScenarios(): 데이터 초기화");
}