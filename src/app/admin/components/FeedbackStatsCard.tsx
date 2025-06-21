import React from "react";
import { Card, CardHeader, CardBody, Badge } from "@heroui/react";
import { Bell } from "lucide-react";
import type { FeedbackAnalytics } from "@/src/lib/admin/types";

interface FeedbackStatsCardProps {
  feedbackAnalytics?: FeedbackAnalytics;
}

export default function FeedbackStatsCard({
  feedbackAnalytics,
}: FeedbackStatsCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          피드백 통계
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">총 피드백</span>
          <span className="font-semibold">
            {feedbackAnalytics?.statistics?.totalFeedbacks || 0}건
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">처리 완료</span>
          <span className="font-semibold text-green-600">
            {feedbackAnalytics?.statistics?.processedFeedbacks || 0}건
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">미처리</span>
          <Badge color="warning">
            {feedbackAnalytics?.statistics?.unprocessedCount || 0}건
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">평균 평점</span>
          <span className="font-semibold">
            {feedbackAnalytics?.statistics?.averageRating?.toFixed(1) || 0}/5
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
