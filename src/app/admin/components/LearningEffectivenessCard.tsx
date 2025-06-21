import React from "react";
import { Card, CardHeader, CardBody, Progress } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import type { FeedbackAnalytics } from "@/src/lib/admin/types";

interface LearningEffectivenessCardProps {
  feedbackAnalytics?: FeedbackAnalytics;
}

export default function LearningEffectivenessCard({
  feedbackAnalytics,
}: LearningEffectivenessCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          학습 효과
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">모델 정확도</span>
          <div className="flex items-center gap-2">
            <Progress
              value={
                feedbackAnalytics?.learningEffectiveness?.modelAccuracy || 0
              }
              className="w-20"
              color="success"
              size="sm"
            />
            <span className="font-semibold text-blue-600">
              {feedbackAnalytics?.learningEffectiveness?.modelAccuracy?.toFixed(
                1
              ) || 0}
              %
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">개선율</span>
          <span className="font-semibold text-green-600">
            +
            {feedbackAnalytics?.learningEffectiveness?.improvementRate?.toFixed(
              1
            ) || 0}
            %
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">마지막 학습</span>
          <span className="text-sm text-gray-500">
            {feedbackAnalytics?.learningEffectiveness?.lastTrainingDate
              ? new Date(
                  feedbackAnalytics.learningEffectiveness.lastTrainingDate
                ).toLocaleDateString()
              : "없음"}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
