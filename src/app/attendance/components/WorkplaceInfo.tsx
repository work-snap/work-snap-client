import React, { memo } from "react";

interface WorkplaceInfoProps {
  workplaceName: string;
  businessOwnerName: string;
  className?: string;
}

export const WorkplaceInfo: React.FC<WorkplaceInfoProps> = memo(
  ({ workplaceName, businessOwnerName, className = "" }) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <h3 className="text-lg font-semibold text-main2">{workplaceName}</h3>
        <p className="text-sm text-gray3">{businessOwnerName} 사장님</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.workplaceName === nextProps.workplaceName &&
      prevProps.businessOwnerName === nextProps.businessOwnerName
    );
  }
);
