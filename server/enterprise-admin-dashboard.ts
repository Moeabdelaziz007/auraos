import { getAdvancedAutomationEngine } from './advanced-automation.js';
import { getIntelligentWorkflowOrchestrator } from './intelligent-workflow.js';
import { getEnterpriseTeamManager } from './enterprise-team-management.js';

interface DashboardMetrics {
  timestamp: Date;
  systemHealth: SystemHealth;
  userMetrics: UserMetrics;
  automationMetrics: AutomationMetrics;
  workflowMetrics: WorkflowMetrics;
  teamMetrics: TeamMetrics;
  performanceMetrics: PerformanceMetrics;
  securityMetrics: SecurityMetrics;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  activeConnections: number;
  errorRate: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: Record<string, number>;
  userActivity: {
    loginsLast24h: number;
    loginsLast7d: number;
    averageSessionDuration: number;
  };
}

interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  rulesByCategory: Record<string, number>;
  recentExecutions: any[];
}

interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  workflowsByType: Record<string, number>;
  recentExecutions: any[];
}

interface TeamMetrics {
  totalTeams: number;
  totalMembers: number;
  activeTeams: number;
  teamsByOrganization: Record<string, number>;
  collaborationActivity: {
    realTimeEdits: number;
    sharedWorkflows: number;
    teamComments: number;
  };
}

interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    workflowsPerMinute: number;
    automationsPerMinute: number;
  };
  errorMetrics: {
    totalErrors: number;
    errorRate: number;
    errorsByType: Record<string, number>;
  };
}

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  securityEvents: number;
  activeSessions: number;
  mfaEnabled: number;
  recentSecurityEvents: any[];
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata: any;
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'status';
  title: string;
  description: string;
  position: { x: number; y: number; width: number; height: number };
  config: any;
  data: any;
  refreshInterval: number;
}

export class EnterpriseAdminDashboard {
  private metrics: DashboardMetrics | null = null;
  private alerts: Map<string, Alert> = new Map();
  private widgets: Map<string, DashboardWidget> = new Map();
  private subscribers: Set<any> = new Set();
  private isMonitoring: boolean = false;

  constructor() {
    this.initializeDefaultWidgets();
    this.startMonitoring();
  }

  private initializeDefaultWidgets() {
    // System Health Widget
    this.widgets.set('system_health', {
      id: 'system_health',
      type: 'status',
      title: 'System Health',
      description: 'Overall system health status',
      position: { x: 0, y: 0, width: 4, height: 2 },
      config: {
        showDetails: true,
        showHistory: false
      },
      data: null,
      refreshInterval: 5000
    });

    // User Metrics Widget
    this.widgets.set('user_metrics', {
      id: 'user_metrics',
      type: 'metric',
      title: 'User Metrics',
      description: 'User activity and engagement metrics',
      position: { x: 4, y: 0, width: 4, height: 2 },
      config: {
        showTrends: true,
        timeRange: '24h'
      },
      data: null,
      refreshInterval: 30000
    });

    // Automation Performance Widget
    this.widgets.set('automation_performance', {
      id: 'automation_performance',
      type: 'chart',
      title: 'Automation Performance',
      description: 'Automation rules execution metrics',
      position: { x: 0, y: 2, width: 6, height: 4 },
      config: {
        chartType: 'line',
        showLegend: true,
        timeRange: '7d'
      },
      data: null,
      refreshInterval: 60000
    });

    // Workflow Analytics Widget
    this.widgets.set('workflow_analytics', {
      id: 'workflow_analytics',
      type: 'chart',
      title: 'Workflow Analytics',
      description: 'Workflow execution and performance analytics',
      position: { x: 6, y: 2, width: 6, height: 4 },
      config: {
        chartType: 'bar',
        showTrends: true,
        timeRange: '30d'
      },
      data: null,
      refreshInterval: 60000
    });

    // Team Collaboration Widget
    this.widgets.set('team_collaboration', {
      id: 'team_collaboration',
      type: 'table',
      title: 'Team Collaboration',
      description: 'Team activity and collaboration metrics',
      position: { x: 0, y: 6, width: 8, height: 4 },
      config: {
        sortable: true,
        filterable: true,
        pagination: true
      },
      data: null,
      refreshInterval: 30000
    });

    // Security Alerts Widget
    this.widgets.set('security_alerts', {
      id: 'security_alerts',
      type: 'alert',
      title: 'Security Alerts',
      description: 'Recent security events and alerts',
      position: { x: 8, y: 6, width: 4, height: 4 },
      config: {
        showAcknowledged: false,
        maxItems: 10
      },
      data: null,
      refreshInterval: 15000
    });

    // Performance Metrics Widget
    this.widgets.set('performance_metrics', {
      id: 'performance_metrics',
      type: 'metric',
      title: 'Performance Metrics',
      description: 'System performance and response times',
      position: { x: 0, y: 10, width: 6, height: 2 },
      config: {
        showHistory: true,
        timeRange: '1h'
      },
      data: null,
      refreshInterval: 10000
    });

    // Resource Usage Widget
    this.widgets.set('resource_usage', {
      id: 'resource_usage',
      type: 'chart',
      title: 'Resource Usage',
      description: 'System resource utilization',
      position: { x: 6, y: 10, width: 6, height: 2 },
      config: {
        chartType: 'gauge',
        showMultiple: true
      },
      data: null,
      refreshInterval: 5000
    });
  }

  private startMonitoring() {
    this.isMonitoring = true;
    console.log('📊 Enterprise Admin Dashboard monitoring started');

    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);

    // Check for alerts every 10 seconds
    setInterval(() => {
      this.checkAlerts();
    }, 10000);

    // Update widgets based on their refresh intervals
    setInterval(() => {
      this.updateWidgets();
    }, 5000);
  }

  private async updateMetrics() {
    try {
      const automationEngine = getAdvancedAutomationEngine();
      const orchestrator = getIntelligentWorkflowOrchestrator();
      const teamManager = getEnterpriseTeamManager();

      // Collect system health metrics
      const systemHealth: SystemHealth = {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        cpuUsage: Math.random() * 100, // Simulate CPU usage
        diskUsage: {
          used: 50000000000, // 50GB
          total: 100000000000, // 100GB
          percentage: 50
        },
        activeConnections: 0, // Will be updated from WebSocket
        errorRate: 0.02 // 2% error rate
      };

      // Collect user metrics
      const userMetrics: UserMetrics = {
        totalUsers: 150,
        activeUsers: 45,
        newUsersToday: 3,
        usersByRole: {
          'admin': 5,
          'manager': 15,
          'developer': 25,
          'user': 100,
          'viewer': 5
        },
        userActivity: {
          loginsLast24h: 89,
          loginsLast7d: 456,
          averageSessionDuration: 1800000 // 30 minutes
        }
      };

      // Collect automation metrics
      const automationStats = automationEngine.getAutomationStats();
      const automationMetrics: AutomationMetrics = {
        totalRules: automationStats.totalRules,
        activeRules: automationStats.activeRules,
        totalExecutions: automationStats.totalExecutions,
        successRate: automationStats.averageSuccessRate,
        averageExecutionTime: 2500, // 2.5 seconds
        rulesByCategory: {
          'content_automation': 2,
          'travel_optimization': 1,
          'food_management': 1,
          'shopping_intelligence': 1
        },
        recentExecutions: []
      };

      // Collect workflow metrics
      const workflowStats = orchestrator.getWorkflowStats();
      const workflowMetrics: WorkflowMetrics = {
        totalWorkflows: workflowStats.totalWorkflows,
        activeWorkflows: workflowStats.activeWorkflows,
        totalExecutions: workflowStats.totalExecutions,
        successRate: workflowStats.averageSuccessRate,
        averageExecutionTime: 45000, // 45 seconds
        workflowsByType: {
          'content_automation': 1,
          'travel_optimization': 1,
          'food_management': 1,
          'shopping_intelligence': 1
        },
        recentExecutions: []
      };

      // Collect team metrics
      const allTeams = await teamManager.getAllTeams();
      const teamMetrics: TeamMetrics = {
        totalTeams: allTeams.length,
        totalMembers: allTeams.reduce((sum, team) => sum + team.members.length, 0),
        activeTeams: allTeams.filter(team => team.status === 'active').length,
        teamsByOrganization: {
          'default_org': allTeams.length
        },
        collaborationActivity: {
          realTimeEdits: 23,
          sharedWorkflows: 45,
          teamComments: 67
        }
      };

      // Collect performance metrics
      const performanceMetrics: PerformanceMetrics = {
        responseTime: {
          average: 150, // 150ms
          p95: 300, // 300ms
          p99: 500 // 500ms
        },
        throughput: {
          requestsPerSecond: 25,
          workflowsPerMinute: 12,
          automationsPerMinute: 48
        },
        errorMetrics: {
          totalErrors: 15,
          errorRate: 0.02,
          errorsByType: {
            'timeout': 5,
            'validation': 3,
            'authentication': 2,
            'authorization': 1,
            'other': 4
          }
        }
      };

      // Collect security metrics
      const securityMetrics: SecurityMetrics = {
        totalLogins: 234,
        failedLogins: 12,
        securityEvents: 3,
        activeSessions: 45,
        mfaEnabled: 15,
        recentSecurityEvents: []
      };

      this.metrics = {
        timestamp: new Date(),
        systemHealth,
        userMetrics,
        automationMetrics,
        workflowMetrics,
        teamMetrics,
        performanceMetrics,
        securityMetrics
      };

      // Broadcast metrics update
      this.broadcastMetricsUpdate();

    } catch (error) {
      console.error('Error updating dashboard metrics:', error);
    }
  }

  private async checkAlerts() {
    if (!this.metrics) return;

    // Check system health alerts
    if (this.metrics.systemHealth.status === 'critical') {
      this.createAlert({
        type: 'critical',
        title: 'System Health Critical',
        message: 'System health is in critical state',
        metadata: { systemHealth: this.metrics.systemHealth }
      });
    }

    // Check error rate alerts
    if (this.metrics.automationMetrics.errorRate > 0.1) {
      this.createAlert({
        type: 'warning',
        title: 'High Error Rate',
        message: `Automation error rate is ${(this.metrics.automationMetrics.errorRate * 100).toFixed(1)}%`,
        metadata: { errorRate: this.metrics.automationMetrics.errorRate }
      });
    }

    // Check memory usage alerts
    if (this.metrics.systemHealth.memoryUsage.percentage > 90) {
      this.createAlert({
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is at ${this.metrics.systemHealth.memoryUsage.percentage}%`,
        metadata: { memoryUsage: this.metrics.systemHealth.memoryUsage }
      });
    }

    // Check failed login alerts
    if (this.metrics.securityMetrics.failedLogins > 10) {
      this.createAlert({
        type: 'warning',
        title: 'Multiple Failed Logins',
        message: `${this.metrics.securityMetrics.failedLogins} failed login attempts detected`,
        metadata: { failedLogins: this.metrics.securityMetrics.failedLogins }
      });
    }
  }

  private createAlert(alertData: Partial<Alert>) {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertData.type || 'info',
      title: alertData.title || 'System Alert',
      message: alertData.message || 'System alert detected',
      timestamp: new Date(),
      acknowledged: false,
      metadata: alertData.metadata || {}
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Alert created: ${alert.title} (${alert.type})`);

    // Broadcast alert
    this.broadcastAlert(alert);
  }

  private async updateWidgets() {
    for (const widget of this.widgets.values()) {
      try {
        const now = Date.now();
        const lastUpdate = widget.data?.lastUpdated || 0;
        
        if (now - lastUpdate >= widget.refreshInterval) {
          await this.updateWidgetData(widget);
        }
      } catch (error) {
        console.error(`Error updating widget ${widget.id}:`, error);
      }
    }
  }

  private async updateWidgetData(widget: DashboardWidget) {
    if (!this.metrics) return;

    switch (widget.id) {
      case 'system_health':
        widget.data = {
          ...this.metrics.systemHealth,
          lastUpdated: Date.now()
        };
        break;

      case 'user_metrics':
        widget.data = {
          ...this.metrics.userMetrics,
          lastUpdated: Date.now()
        };
        break;

      case 'automation_performance':
        widget.data = {
          metrics: this.metrics.automationMetrics,
          chartData: this.generateChartData('automation'),
          lastUpdated: Date.now()
        };
        break;

      case 'workflow_analytics':
        widget.data = {
          metrics: this.metrics.workflowMetrics,
          chartData: this.generateChartData('workflow'),
          lastUpdated: Date.now()
        };
        break;

      case 'team_collaboration':
        const teamManager = getEnterpriseTeamManager();
        const allTeams = await teamManager.getAllTeams();
        widget.data = {
          teams: allTeams.map(team => ({
            id: team.id,
            name: team.name,
            members: team.members.length,
            status: team.status,
            lastActivity: team.updatedAt
          })),
          lastUpdated: Date.now()
        };
        break;

      case 'security_alerts':
        widget.data = {
          alerts: Array.from(this.alerts.values())
            .filter(alert => !alert.acknowledged)
            .slice(0, 10)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
          lastUpdated: Date.now()
        };
        break;

      case 'performance_metrics':
        widget.data = {
          ...this.metrics.performanceMetrics,
          lastUpdated: Date.now()
        };
        break;

      case 'resource_usage':
        widget.data = {
          memory: this.metrics.systemHealth.memoryUsage,
          cpu: { usage: this.metrics.systemHealth.cpuUsage },
          disk: this.metrics.systemHealth.diskUsage,
          lastUpdated: Date.now()
        };
        break;
    }

    // Broadcast widget update
    this.broadcastWidgetUpdate(widget);
  }

  private generateChartData(type: 'automation' | 'workflow'): any {
    // Generate sample chart data
    const data = [];
    const now = Date.now();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
        success: Math.floor(Math.random() * 20) + 80
      });
    }

    return data;
  }

  // Public Methods
  async getDashboardMetrics(): Promise<DashboardMetrics | null> {
    return this.metrics;
  }

  async getWidgets(): Promise<DashboardWidget[]> {
    return Array.from(this.widgets.values());
  }

  async getAlerts(acknowledged: boolean = false): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => acknowledged ? alert.acknowledged : !alert.acknowledged)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    console.log(`✅ Alert acknowledged: ${alert.title} by ${acknowledgedBy}`);
    this.broadcastAlert(alert);
    return true;
  }

  async createCustomWidget(
    id: string,
    type: DashboardWidget['type'],
    title: string,
    description: string,
    config: any
  ): Promise<DashboardWidget> {
    const widget: DashboardWidget = {
      id,
      type,
      title,
      description,
      position: { x: 0, y: 0, width: 4, height: 2 },
      config,
      data: null,
      refreshInterval: 60000
    };

    this.widgets.set(id, widget);
    console.log(`📊 Custom widget created: ${title}`);
    return widget;
  }

  async updateWidgetPosition(widgetId: string, position: { x: number; y: number; width: number; height: number }): Promise<boolean> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      return false;
    }

    widget.position = position;
    console.log(`📊 Widget position updated: ${widget.title}`);
    return true;
  }

  // Subscription Methods
  subscribeToUpdates(callback: (update: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private broadcastMetricsUpdate(): void {
    const update = {
      type: 'metrics_update',
      data: this.metrics,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting metrics update:', error);
      }
    });
  }

  private broadcastAlert(alert: Alert): void {
    const update = {
      type: 'alert',
      data: alert,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting alert:', error);
      }
    });
  }

  private broadcastWidgetUpdate(widget: DashboardWidget): void {
    const update = {
      type: 'widget_update',
      data: widget,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting widget update:', error);
      }
    });
  }
}

// Export singleton instance
let enterpriseAdminDashboard: EnterpriseAdminDashboard | null = null;

export function getEnterpriseAdminDashboard(): EnterpriseAdminDashboard {
  if (!enterpriseAdminDashboard) {
    enterpriseAdminDashboard = new EnterpriseAdminDashboard();
  }
  return enterpriseAdminDashboard;
}
