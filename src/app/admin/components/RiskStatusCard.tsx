import React from "react";
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import type { AdvancedMetrics } from "@/src/lib/admin/types";

interface RiskStatusCardProps {
  advancedMetrics?: AdvancedMetrics;
}

export default function RiskStatusCard({
  advancedMetrics,
}: RiskStatusCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          위험도 현황
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        {advancedMetrics?.riskDistribution?.byRiskLevel &&
          Object.entries(advancedMetrics.riskDistribution.byRiskLevel).map(
            ([level, data]) => (
              <div key={level} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      level === "HIGH"
                        ? "bg-red-500"
                        : level === "MEDIUM"
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">{level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {(data as any)?.count || 0}건
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(data as any)?.percentage?.toFixed(1) || 0}%)
                  </span>
                </div>
              </div>
            )
          )}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">트렌드</span>
            <Chip
              color={
                advancedMetrics?.riskDistribution?.highRiskTrend?.direction ===
                "INCREASING"
                  ? "danger"
                  : advancedMetrics?.riskDistribution?.highRiskTrend
                      ?.direction === "DECREASING"
                  ? "success"
                  : "default"
              }
              variant="flat"
              size="sm"
            >
              {advancedMetrics?.riskDistribution?.highRiskTrend?.direction ||
                "STABLE"}
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
