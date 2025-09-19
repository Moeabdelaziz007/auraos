import React from 'react';
import { SystemMonitor } from '@/components/monitoring/SystemMonitor';

export const SystemMonitorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <SystemMonitor />
    </div>
  );
};

export default SystemMonitorPage;
