import React from "react";
import { Card, CardHeader, CardBody, Progress } from "@heroui/react";
import { Settings } from "lucide-react";
import type { AdvancedMetrics } from "@/src/lib/admin/types";

interface AutomationEffectivenessCardProps {
  advancedMetrics?: AdvancedMetrics;
}

export default function AutomationEffectivenessCard({
  advancedMetrics,
}: AutomationEffectivenessCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          자동화 효과
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">자동화 정확도</span>
          <div className="flex items-center gap-2">
            <Progress
              value={
                advancedMetrics?.automationEffectiveness?.automationAccuracy ||
                0
              }
              className="w-20"
              color="success"
              size="sm"
            />
            <span className="font-semibold text-green-600">
              {advancedMetrics?.automationEffectiveness?.automationAccuracy?.toFixed(
                1
              ) || 0}
              %
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">시간 단축률</span>
          <span className="font-semibold text-blue-600">
            {advancedMetrics?.automationEffectiveness?.timeReduction?.toFixed(
              1
            ) || 0}
            %
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
