import React from "react";
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";
import { Brain } from "lucide-react";
import type { AdvancedMetrics } from "@/src/lib/admin/types";

interface PatternAnalysisCardProps {
  advancedMetrics?: AdvancedMetrics;
}

export default function PatternAnalysisCard({
  advancedMetrics,
}: PatternAnalysisCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          패턴 분석
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">감지된 패턴</span>
          <span className="font-semibold">
            {advancedMetrics?.patternSummary?.patternDetails?.length || 0}개
          </span>
        </div>
        <div className="space-y-2">
          {advancedMetrics?.patternSummary?.patternDetails
            ?.slice(0, 3)
            .map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">{pattern.patternType}</span>
                <Chip
                  size="sm"
                  color={getPriorityColor(pattern.riskLevel)}
                  variant="flat"
                >
                  {pattern.frequency}회
                </Chip>
              </div>
            ))}
        </div>
      </CardBody>
    </Card>
  );
}
