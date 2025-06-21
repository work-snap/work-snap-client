import React from "react";
import { Card, CardHeader, CardBody, Chip, Progress } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import type { AdvancedMetrics } from "@/src/lib/admin/types";

interface SystemPerformanceCardProps {
  advancedMetrics?: AdvancedMetrics;
}

export default function SystemPerformanceCard({
  advancedMetrics,
}: SystemPerformanceCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          시스템 성능
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">평균 처리 시간</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {advancedMetrics?.performanceMetrics?.avgProcessingTime || 0}분
            </span>
            <Chip size="sm" color="success" variant="flat">
              -12%
            </Chip>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">시간당 처리량</span>
          <span className="font-semibold">
            {advancedMetrics?.performanceMetrics?.throughput || 0}건
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">SLA 준수율</span>
          <div className="flex items-center gap-2">
            <Progress
              value={advancedMetrics?.performanceMetrics?.slaCompliance || 0}
              className="w-20"
              color="success"
              size="sm"
            />
            <span className="font-semibold">
              {advancedMetrics?.performanceMetrics?.slaCompliance || 0}%
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">대기열 길이</span>
          <span className="font-semibold">
            {advancedMetrics?.performanceMetrics?.queueLength || 0}건
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
