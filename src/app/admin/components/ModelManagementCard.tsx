import React from "react";
import { Card, CardHeader, CardBody, Button, Chip } from "@heroui/react";
import { Brain, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useMLStatus, useInitializeModel } from "@/src/lib/admin/admin.query";

interface ModelManagementCardProps {
  onTriggerModelRetraining: () => void;
  onTriggerIncrementalLearning: () => void;
}

export default function ModelManagementCard({
  onTriggerModelRetraining,
  onTriggerIncrementalLearning,
}: ModelManagementCardProps) {
  const { data: mlStatus, isLoading } = useMLStatus();
  const initializeModelMutation = useInitializeModel({
    onSuccess: () => {
      alert("모델 초기화가 완료되었습니다 🔄");
    },
    onError: (error: any) => {
      console.error("모델 초기화 실패:", error);
      alert("모델 초기화에 실패했습니다.");
    },
  });

  const handleInitializeModel = () => {
    if (confirm("모델을 초기화하시겠습니까? 기존 학습 데이터가 초기화됩니다.")) {
      initializeModelMutation.mutate();
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            모델 관리
          </h3>
          {mlStatus && (
            <Chip
              size="sm"
              color={mlStatus.status === 'ACTIVE' ? 'success' : 'warning'}
              variant="flat"
            >
              {mlStatus.status || 'UNKNOWN'}
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {mlStatus && (
          <div className="text-xs text-gray-500 mb-2">
            마지막 업데이트: {mlStatus.lastUpdate ? new Date(mlStatus.lastUpdate).toLocaleString() : '없음'}
          </div>
        )}
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
        <Button
          className="w-full"
          onClick={handleInitializeModel}
          variant="bordered"
          color="warning"
          startContent={<RefreshCw className="w-4 h-4" />}
          isLoading={initializeModelMutation.isPending}
        >
          모델 초기화
        </Button>
      </CardBody>
    </Card>
  );
}
