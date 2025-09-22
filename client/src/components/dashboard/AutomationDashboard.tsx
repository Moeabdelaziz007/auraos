import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

// --- Data Types ---
interface LiveStatus {
  automation: { active: boolean; rules: number; workflows: number; };
  workflows: { activeWorkflows: number; totalWorkflows: number; };
}
interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
}
interface WorkflowStats {
  activeWorkflows: number;
  totalWorkflows: number;
  executions: number;
}

const AutomationDashboard = () => {
  const queryClient = useQueryClient();
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);

  // --- API Calls ---
  const { data: liveStatus, isLoading: statusLoading } = useQuery<LiveStatus>({
    queryKey: ['/api/autopilot/live/status'],
  });
  const { data: performance, isLoading: perfLoading } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/automation/engine/performance'],
  });
  const { data: workflowStats, isLoading: statsLoading } = useQuery<WorkflowStats>({
    queryKey: ['/api/workflows/intelligent/stats'],
  });

  const emergencyStopMutation = useMutation({
    mutationFn: (stop: boolean) => fetch('/api/autopilot/emergency-stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stop }),
    }).then(res => res.json()),
    onSuccess: (data) => {
      setIsEmergencyStopped(data.emergencyStop);
      queryClient.invalidateQueries({ queryKey: ['/api/autopilot/live/status'] });
    },
  });

  // --- WebSocket Logic ---
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/ws');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'autopilot_update' || message.type === 'workflow_update') {
        queryClient.invalidateQueries({ queryKey: ['/api/autopilot/live/status'] });
        queryClient.invalidateQueries({ queryKey: ['/api/workflows/intelligent/stats'] });
      }
    };
    return () => ws.close();
  }, [queryClient]);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="gradient-cyber-secondary bg-clip-text text-transparent">Automation Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Live Status</CardTitle></CardHeader>
            <CardContent>
              {statusLoading ? <div className="animate-pulse h-5 w-24 bg-muted rounded"></div> :
                <Badge variant={liveStatus?.automation.active ? 'default' : 'destructive'}>
                  {liveStatus?.automation.active ? '🟢 Active' : '🔴 Inactive'}
                </Badge>
              }
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Active Rules</CardTitle></CardHeader>
            <CardContent>
              {statusLoading ? <div className="animate-pulse h-5 w-12 bg-muted rounded"></div> :
                <p className="text-2xl font-bold">{liveStatus?.automation.rules ?? 'N/A'}</p>
              }
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Active Workflows</CardTitle></CardHeader>
            <CardContent>
              {statusLoading ? <div className="animate-pulse h-5 w-12 bg-muted rounded"></div> :
                <p className="text-2xl font-bold">{liveStatus?.workflows.activeWorkflows ?? 'N/A'}</p>
              }
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader><CardTitle>System Controls</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Emergency Stop</p>
                <p className="text-sm text-muted-foreground">Immediately halt all automation tasks.</p>
              </div>
              <Switch
                checked={isEmergencyStopped}
                onCheckedChange={(checked) => emergencyStopMutation.mutate(checked)}
                disabled={emergencyStopMutation.isPending}
              />
            </div>
            {emergencyStopMutation.isError && (
              <Alert variant="destructive" className="mt-2 p-2 text-xs">
                <AlertDescription>{emergencyStopMutation.error.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Performance & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {perfLoading ? <div className="animate-pulse h-12 w-full bg-muted rounded"></div> :
                <>
                  <p>CPU: {performance?.cpu.toFixed(2) ?? 'N/A'}%</p>
                  <p>Memory: {performance?.memory.toFixed(2) ?? 'N/A'}%</p>
                  <p>Response Time: {performance?.responseTime ?? 'N/A'} ms</p>
                </>
              }
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Workflow Stats</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {statsLoading ? <div className="animate-pulse h-12 w-full bg-muted rounded"></div> :
                <>
                  <p>Total Workflows: {workflowStats?.totalWorkflows ?? 'N/A'}</p>
                  <p>Total Executions: {workflowStats?.executions ?? 'N/A'}</p>
                </>
              }
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationDashboard;
