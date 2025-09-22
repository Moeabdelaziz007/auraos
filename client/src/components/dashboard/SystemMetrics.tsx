import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  totalPosts: number;
  activeAgents: number;
  engagementRate: number;
  automationsRun: number;
}

export default function SystemMetrics() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/users/user-1/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Posts",
      value: stats?.totalPosts?.toLocaleString() || "0",
      change: "+12%",
      changeText: "from last month",
      icon: "fas fa-file-alt",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      isPositive: true,
      testId: "stat-total-posts"
    },
    {
      title: "Active Agents",
      value: stats?.activeAgents?.toString() || "0",
      change: "+3",
      changeText: "new this week",
      icon: "fas fa-robot",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      isPositive: true,
      testId: "stat-active-agents"
    },
    {
      title: "Engagement Rate",
      value: `${stats?.engagementRate?.toFixed(1) || "0.0"}%`,
      change: "+0.8%",
      changeText: "from last week",
      icon: "fas fa-heart",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      isPositive: true,
      testId: "stat-engagement-rate"
    },
    {
      title: "Automations Run",
      value: stats?.automationsRun?.toLocaleString() || "0",
      change: "+24%",
      changeText: "efficiency gain",
      icon: "fas fa-bolt",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      isPositive: true,
      testId: "stat-automations-run"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.testId} className="p-6" data-testid={stat.testId}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground" data-testid={`${stat.testId}-value`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.iconColor} text-xl`}></i>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`} data-testid={`${stat.testId}-change`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground" data-testid={`${stat.testId}-change-text`}>
                {stat.changeText}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
