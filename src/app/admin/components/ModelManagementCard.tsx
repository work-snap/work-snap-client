import React from "react";
import { Card, CardHeader, CardBody, Button } from "@heroui/react";
import { Brain, TrendingUp, Activity } from "lucide-react";

interface ModelManagementCardProps {
  onTriggerModelRetraining: () => void;
  onTriggerIncrementalLearning: () => void;
}

export default function ModelManagementCard({
  onTriggerModelRetraining,
  onTriggerIncrementalLearning,
}: ModelManagementCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          모델 관리
        </h3>
      </CardHeader>
      <CardBody className="space-y-3">
        <Button
          className="w-full"
          onClick={onTriggerModelRetraining}
          color="primary"
          startContent={<Brain className="w-4 h-4" />}
        >
          전체 재학습
        </Button>
        <Button
          className="w-full"
          onClick={onTriggerIncrementalLearning}
          variant="bordered"
          startContent={<TrendingUp className="w-4 h-4" />}
        >
          증분 학습
        </Button>
        <Button
          className="w-full"
          variant="bordered"
          startContent={<Activity className="w-4 h-4" />}
        >
          성능 평가
        </Button>
      </CardBody>
    </Card>
  );
}
