import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Zap, 
  Bot, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Monitor,
  Server,
  Database,
  Globe
} from 'lucide-react';

interface SystemStatus {
  system: {
    status: string;
    uptime: number;
    version: string;
    nodeVersion: string;
    platform: string;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    pid: number;
  };
  autopilot: {
    active: boolean;
    rules: number;
    workflows: number;
    lastExecution: string;
  };
  ai: {
    agents: number;
    activeAgents: number;
    totalTasks: number;
  };
  performance: {
    memory: number;
    cpu: number;
    responseTime: number;
  };
  timestamp: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    database: string;
    ai: string;
    autopilot: string;
    websocket: string;
  };
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  version: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source: string;
  context?: Record<string, any>;
}

export const SystemMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system/status');
      if (!response.ok) throw new Error('Failed to fetch system status');
      const data = await response.json();
      setSystemStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/system/health');
      if (!response.ok) throw new Error('Failed to fetch health status');
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/system/logs?limit=50');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchSystemStatus(), fetchHealthStatus(), fetchLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshAll, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
      case 'active':
      case 'connected':
        return 'bg-green-500';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500';
      case 'error':
      case 'failed':
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLogLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'debug':
        return 'text-blue-500';
      case 'info':
        return 'text-green-500';
      case 'warn':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'critical':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of AuraOS system health and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Auto-refresh ON
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto-refresh OFF
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus?.system.status || 'unknown')}`} />
                  <span className="text-2xl font-bold capitalize">
                    {systemStatus?.system.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Version {systemStatus?.system.version || 'N/A'}
                </p>
              </CardContent>
            </Card>

            {/* Uptime */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus ? formatUptime(systemStatus.system.uptime) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Since last restart
                </p>
              </CardContent>
            </Card>

            {/* AI Agents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.ai.activeAgents || 0}/{systemStatus?.ai.agents || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active agents
                </p>
              </CardContent>
            </Card>

            {/* Autopilot */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Autopilot</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {systemStatus?.autopilot.active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {systemStatus?.autopilot.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStatus?.autopilot.rules || 0} rules, {systemStatus?.autopilot.workflows || 0} workflows
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Health */}
          {healthStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Service Health</CardTitle>
                <CardDescription>Status of all system services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(healthStatus.services).map(([service, status]) => (
                    <div key={service} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                      <span className="text-sm capitalize">{service}</span>
                      <Badge variant={status === 'connected' || status === 'operational' ? 'default' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MemoryStick className="h-5 w-5" />
                  <span>Memory Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heap Used</span>
                    <span>{systemStatus ? formatBytes(systemStatus.system.memory.heapUsed) : 'N/A'}</span>
                  </div>
                  <Progress 
                    value={systemStatus?.performance.memory || 0} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span>{systemStatus ? formatBytes(systemStatus.system.memory.heapTotal) : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>CPU Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {systemStatus?.performance.cpu || 0}%
                  </div>
                  <Progress 
                    value={systemStatus?.performance.cpu || 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Approximate CPU usage
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Response Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {systemStatus?.performance.responseTime || 0}ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    API response time
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Agents</span>
                  <Badge variant="outline">{systemStatus?.ai.agents || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Agents</span>
                  <Badge variant="outline">{systemStatus?.ai.activeAgents || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Tasks</span>
                  <Badge variant="outline">{systemStatus?.ai.totalTasks || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Autopilot System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Autopilot System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge variant={systemStatus?.autopilot.active ? 'default' : 'destructive'}>
                    {systemStatus?.autopilot.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Rules</span>
                  <Badge variant="outline">{systemStatus?.autopilot.rules || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Workflows</span>
                  <Badge variant="outline">{systemStatus?.autopilot.workflows || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Execution</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStatus?.autopilot.lastExecution ? 
                      new Date(systemStatus.autopilot.lastExecution).toLocaleString() : 
                      'Never'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>
                Latest system events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No logs available
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 rounded border">
                      <div className="flex-shrink-0">
                        <span className={`text-xs font-mono ${getLogLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{log.message}</p>
                        {log.context && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">
                              Context
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
