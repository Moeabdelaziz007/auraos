// User History Analytics Components
// Provides comprehensive analytics dashboards for user behavior tracking

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointer,
  MessageSquare,
  Zap,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useUserHistoryData, useUserSessions, useUserAnalytics } from '../../hooks/use-user-history';
import { UserHistory, ActionType, ActionCategory } from '../../lib/firestore-types';

interface AnalyticsDashboardProps {
  userId?: string;
}

export function UserHistoryAnalytics({ userId }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedTab, setSelectedTab] = useState('overview');

  const { analytics, loading: analyticsLoading, refresh: refreshAnalytics } = useUserAnalytics(selectedPeriod);
  const { sessions, loading: sessionsLoading } = useUserSessions();
  const { history, loading: historyLoading } = useUserHistoryData({ limit: 100 });

  const handleExportData = () => {
    const data = {
      analytics,
      sessions,
      history,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (analyticsLoading || sessionsLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into user behavior and engagement</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
            aria-label="Select analytics period"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <Button onClick={refreshAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab analytics={analytics} sessions={sessions} history={history} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <BehaviorTab analytics={analytics} history={history} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SessionsTab sessions={sessions} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryTab history={history} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OverviewTabProps {
  analytics: any;
  sessions: any[];
  history: UserHistory[];
}

function OverviewTab({ analytics, sessions, history }: OverviewTabProps) {
  const totalActions = history.length;
  const totalSessions = sessions.length;
  const averageSessionDuration = analytics?.stats?.averageSessionDuration || 0;
  const errorRate = analytics?.stats?.errorRate || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {totalSessions} sessions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">
            Average {Math.round(averageSessionDuration / 1000 / 60)} minutes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {history.filter(h => !h.success).length} errors
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retention</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.stats?.retentionRate?.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            User retention rate
          </p>
        </CardContent>
      </Card>

      {/* Most Used Features */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Most Used Features</CardTitle>
          <CardDescription>Top features by usage count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.stats?.mostUsedFeatures?.slice(0, 5).map((feature: any, index: number) => (
              <div key={feature.feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{feature.feature}</span>
                  <span className="text-sm text-muted-foreground">
                    {feature.count} ({feature.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={feature.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.stats?.topPages?.slice(0, 5).map((page: any, index: number) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm">{page.page}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{page.visits} visits</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(page.averageTime / 1000)}s avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BehaviorTabProps {
  analytics: any;
  history: UserHistory[];
}

function BehaviorTab({ analytics, history }: BehaviorTabProps) {
  const actionTypes = history.reduce((acc, h) => {
    acc[h.action.type] = (acc[h.action.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionCategories = history.reduce((acc, h) => {
    acc[h.action.category] = (acc[h.action.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hourlyActivity = history.reduce((acc, h) => {
    const hour = new Date(h.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Action Types */}
      <Card>
        <CardHeader>
          <CardTitle>Action Types</CardTitle>
          <CardDescription>Distribution of different action types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(actionTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Action Categories</CardTitle>
          <CardDescription>Distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(actionCategories)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="text-sm capitalize">{category}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Activity */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Hourly Activity</CardTitle>
          <CardDescription>User activity throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const count = hourlyActivity[hour] || 0;
              const maxCount = Math.max(...Object.values(hourlyActivity));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={hour} className="flex flex-col items-center space-y-1">
                  <div 
                    className="w-full bg-primary rounded-sm transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}px` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {hour.toString().padStart(2, '0')}
                  </span>
                  {count > 0 && (
                    <span className="text-xs font-medium">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SessionsTabProps {
  sessions: any[];
}

function SessionsTab({ sessions }: SessionsTabProps) {
  const [selectedSession, setSelectedSession] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sessions List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Recent user sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(0, 10).map((session) => (
              <div 
                key={session.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSession?.id === session.id ? 'bg-accent' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.actions} actions • {session.deviceInfo.platform}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={session.isActive ? "default" : "secondary"}>
                      {session.isActive ? "Active" : "Ended"}
                    </Badge>
                    {session.duration && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {Math.round(session.duration / 1000 / 60)}m
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            {selectedSession ? 'Selected session information' : 'Select a session to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSession ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Start Time</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedSession.startTime).toLocaleString()}
                </div>
              </div>
              
              {selectedSession.endTime && (
                <div>
                  <div className="text-sm font-medium">End Time</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedSession.endTime).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession.duration 
                    ? `${Math.round(selectedSession.duration / 1000 / 60)} minutes`
                    : 'Ongoing'
                  }
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Actions</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession.actions}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Device</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession.deviceInfo.platform}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Language</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession.deviceInfo.language}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Screen Resolution</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession.deviceInfo.screenResolution}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Click on a session to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface HistoryTabProps {
  history: UserHistory[];
}

function HistoryTab({ history }: HistoryTabProps) {
  const [filter, setFilter] = useState<'all' | ActionCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(h => {
    const matchesFilter = filter === 'all' || h.action.category === filter;
    const matchesSearch = h.action.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Category:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="authentication">Authentication</option>
            <option value="content">Content</option>
            <option value="social">Social</option>
            <option value="workflow">Workflow</option>
            <option value="ai">AI</option>
            <option value="navigation">Navigation</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actions..."
            className="px-3 py-1 border rounded-md text-sm"
          />
        </div>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Action History</CardTitle>
          <CardDescription>
            {filteredHistory.length} of {history.length} actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.slice(0, 50).map((action) => (
              <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    action.success ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  
                  <div>
                    <div className="font-medium">{action.action.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.action.type} • {action.action.category}
                      {action.action.target && ` • ${action.action.target}`}
                    </div>
                    {action.errorMessage && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {action.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(action.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </div>
                  {action.duration && (
                    <div className="text-xs text-muted-foreground">
                      {action.duration}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserHistoryAnalytics;
