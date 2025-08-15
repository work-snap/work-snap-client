"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardBody, Spinner } from "@heroui/react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  AttendanceButton,
  AttendanceInfo,
} from "@/src/components/AttendanceButton";
import { useCurrentTime } from "@/src/hooks/useCurrentTime";
import { LocationAuthResponse } from "@/src/services/locationService";

export default function CheckInPage() {
  const { currentTime, formattedTime } = useCurrentTime();
  const [attendanceStatus, setAttendanceStatus] = useState<
    "none" | "checked_in" | "checked_out"
  >("none");
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 더미 출석 정보 - 실제로는 사용자 데이터에서 가져와야 함
  const attendanceInfo: AttendanceInfo = {
    employeeId: "emp_001",
    employeeName: "홍길동",
    workDate: new Date(),
    scheduledStartTime: "09:00",
    scheduledEndTime: "18:00",
    actualStartTime: attendanceStatus === "checked_in" ? "09:15" : undefined,
    actualEndTime: attendanceStatus === "checked_out" ? "18:30" : undefined,
    workplaceId: "workplace_001",
    workplaceName: "본사",
  };

  const handleAttendanceSuccess = (result: LocationAuthResponse) => {
    console.log("출석 처리 성공:", result);

    if (attendanceStatus === "none") {
      setAttendanceStatus("checked_in");
      setLastAction("출근 완료");
    } else if (attendanceStatus === "checked_in") {
      setAttendanceStatus("checked_out");
      setLastAction("퇴근 완료");
    }

    setShowSuccess(true);
    setErrorMessage(null);

    // 3초 후 성공 메시지 숨기기
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAttendanceError = (error: Error) => {
    console.error("출석 처리 실패:", error);
    setErrorMessage(error.message);
    setShowSuccess(false);
  };

  const goBack = () => {
    window.history.back();
  };

  const getStatusMessage = () => {
    switch (attendanceStatus) {
      case "none":
        return "아직 출근하지 않았습니다.";
      case "checked_in":
        return "출근 상태입니다. 퇴근할 때 다시 버튼을 눌러주세요.";
      case "checked_out":
        return "오늘 근무가 완료되었습니다.";
      default:
        return "";
    }
  };

  const getStatusIcon = () => {
    switch (attendanceStatus) {
      case "none":
        return <Clock className="w-6 h-6 text-gray-500" />;
      case "checked_in":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "checked_out":
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (attendanceStatus) {
      case "none":
        return "bg-gray-50 border-gray-200";
      case "checked_in":
        return "bg-green-50 border-green-200";
      case "checked_out":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onClick={goBack}
              >
                뒤로
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">출석하기</h1>
                <p className="text-sm text-gray-600">
                  GPS 인증을 통한 안전한 출석 체크
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* 현재 시간 카드 */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formattedTime}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 출석 상태 카드 */}
        <Card className={`border ${getStatusColor()}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <h3 className="text-lg font-semibold">현재 상태</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-gray-700">{getStatusMessage()}</p>
            {lastAction && (
              <p className="text-sm text-green-600 mt-2">✅ {lastAction}</p>
            )}
          </CardBody>
        </Card>

        {/* 성공 메시지 */}
        {showSuccess && (
          <Card className="border border-green-200 bg-green-50">
            <CardBody className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">출석 처리 완료!</p>
                  <p className="text-sm text-green-600">
                    {lastAction}되었습니다.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 에러 메시지 */}
        {errorMessage && (
          <Card className="border border-red-200 bg-red-50">
            <CardBody className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">출석 처리 실패</p>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 출석 버튼 영역 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">GPS 인증 출석</h3>
            </div>
          </CardHeader>
          <CardBody>
            <AttendanceButton
              type={attendanceStatus === "none" ? "CHECK_IN" : "CHECK_OUT"}
              attendanceInfo={attendanceInfo}
              onSuccess={handleAttendanceSuccess}
              onError={handleAttendanceError}
              showLocationInfo={true}
              requireLocationAuth={true}
              autoRequestLocation={true}
            />
          </CardBody>
        </Card>

        {/* 예정 시간 정보 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">오늘 근무 일정</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">예정 출근</p>
                <p className="text-xl font-bold text-blue-600">
                  {attendanceInfo.scheduledStartTime}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">예정 퇴근</p>
                <p className="text-xl font-bold text-orange-600">
                  {attendanceInfo.scheduledEndTime}
                </p>
              </div>
            </div>

            {(attendanceInfo.actualStartTime ||
              attendanceInfo.actualEndTime) && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  실제 기록
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">실제 출근: </span>
                    <span className="font-medium">
                      {attendanceInfo.actualStartTime || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">실제 퇴근: </span>
                    <span className="font-medium">
                      {attendanceInfo.actualEndTime || "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* 도움말 */}
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardBody className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              💡 출석 체크 안내
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• GPS 위치 권한을 허용해 주세요</li>
              <li>• 사업장 근처에서만 출석 체크가 가능합니다</li>
              <li>• 위치 정확도가 높을수록 인증이 빠릅니다</li>
              <li>• 문제가 있으면 관리자에게 문의하세요</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
