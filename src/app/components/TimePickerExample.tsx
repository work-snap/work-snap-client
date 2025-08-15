"use client";

import { useState } from "react";
import TimePicker, { handleTimeValidationError } from "./TimePicker";
import toast from "react-hot-toast";

interface TimePickerExampleProps {
  className?: string;
}

export default function TimePickerExample({ className }: TimePickerExampleProps) {
  const [timeData, setTimeData] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  const handleTimeChange = (times: { startTime: string; endTime: string }) => {
    setTimeData(times);
    console.log("시간 변경:", times);
  };

  const handleSubmit = async () => {
    if (!timeData) {
      toast.error("시간을 설정해주세요.", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#FEF2F2",
          color: "#DC2626",
          border: "1px solid #FECACA",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "400px",
          padding: "16px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        icon: "⚠️",
      });
      return;
    }

    try {
      // 실제 API 호출 (클라이언트에서 검증하지 않고 바로 서버로 전송)
      console.log("서버에 요청 전송:", timeData);
      
      // 실제 API 호출 예시:
      // const response = await api.createSchedule({
      //   startTime: timeData.startTime,
      //   endTime: timeData.endTime,
      //   // 기타 필요한 데이터...
      // });

      // 성공 시뮬레이션
      toast.success("시간 설정이 완료되었습니다!", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#F0FDF4",
          color: "#166534",
          border: "1px solid #BBF7D0",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "400px",
          padding: "16px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        icon: "✅",
      });

    } catch (error) {
      // 서버에서 반환하는 에러를 토스트로 표시
      handleTimeValidationError(error, toast);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg ${className ?? ""}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">시간 설정 예시</h2>
      
      <div className="mb-6">
        <TimePicker
          onChange={handleTimeChange}
          debug={false}
        />
      </div>

      {timeData && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">시작 시간:</span> {timeData.startTime}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">종료 시간:</span> {timeData.endTime}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          className="w-full py-3 px-4 bg-main text-white rounded-lg hover:bg-main/90 transition-colors font-medium"
        >
          시간 설정 완료
        </button>
        
        <button
          onClick={() => {
            // 잘못된 시간 설정으로 에러 테스트
            const error = {
              response: {
                data: {
                  message: "시작 시간은 종료 시간보다 빨라야 합니다."
                }
              }
            };
            handleTimeValidationError(error, toast);
          }}
          className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          에러 테스트 (시작 > 종료)
        </button>
        
        <button
          onClick={() => {
            // 30분 미만 에러 테스트
            const error = {
              response: {
                data: {
                  message: "최소 30분 이상의 근무 시간이 필요합니다."
                }
              }
            };
            handleTimeValidationError(error, toast);
          }}
          className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
        >
          에러 테스트 (30분 미만)
        </button>
        
        <button
          onClick={() => {
            // 12시간 초과 에러 테스트
            const error = {
              response: {
                data: {
                  message: "최대 12시간을 초과할 수 없습니다."
                }
              }
            };
            handleTimeValidationError(error, toast);
          }}
          className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          에러 테스트 (12시간 초과)
        </button>
      </div>
    </div>
  );
}
