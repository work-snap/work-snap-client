import React from 'react';
import { AttendanceStatus } from '../lib/types';
import { getStatusMessage } from '../lib/utils';

interface StatusDisplayProps {
  status: AttendanceStatus;
  className?: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, className = '' }) => {
  const message = getStatusMessage(status);
  
  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.BEFORE_WORK:
        return 'text-gray4';
      case AttendanceStatus.WORKING:
        return 'text-primary-600';
      case AttendanceStatus.AFTER_WORK:
        return 'text-sub1';
      default:
        return 'text-gray4';
    }
  };

  return (
    <div className={`font-medium ${getStatusColor(status)} ${className}`}>
      {message}
    </div>
  );
};

export default StatusDisplay;