import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ProgressBar } from "@/components/ui/progress-bar"; // Assuming a reusable ProgressBar component exists
import "@/styles/theme.css"; // Importing the theme CSS file

interface Stats {
  totalPosts: number;
  activeAgents: number;
  engagementRate: number;
  automationsRun: number;
  totalPostsChange: string; // Added for dynamic change
  activeAgentsChange: string; // Added for dynamic change
}

export default function StatsGrid() {
  const { data: stats, isLoading, isError, error } = useQuery<Stats>({
    queryKey: ['/api/users/user-1/stats'],
    queryFn: async () => {
      const response = await fetch('/api/users/user-1/stats', {
        headers: {
          'Cache-Control': 'max-age=300', // Cache for 5 minutes
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    staleTime: 300000, // Cache data for 5 minutes
    cacheTime: 600000, // Keep unused data in cache for 10 minutes
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

  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <p>Error: {error instanceof Error ? error.message : 'An error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-neon-green text-white rounded hover:bg-green-600 transition"
        >
          Retry
        </button>
      </Alert>
    );
  }

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      change: stats.totalPostsChange,
    },
    {
      title: "Active Agents",
      value: stats.activeAgents,
      change: stats.activeAgentsChange,
    },
    {
      title: "Engagement Rate",
      value: `${stats.engagementRate}%`,
      change: null, // No change data for engagement rate
      visualization: <ProgressBar value={stats.engagementRate} max={100} />,
    },
    {
      title: "Automations Run",
      value: stats.automationsRun,
      change: null, // No change data for automations run
      visualization: <ProgressBar value={stats.automationsRun} max={1000} />,
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      role="region"
      aria-label="Statistics Overview"
    >
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="p-6 hover:shadow-lg transition-shadow"
          role="article"
          aria-labelledby={`stat-title-${index}`}
        >
          <CardContent>
            <h3
              id={`stat-title-${index}`}
              className="text-lg font-semibold text-neon-green"
            >
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-medium-gray">{stat.value}</p>
            {stat.change && (
              <p className="text-sm text-muted">{stat.change}</p>
            )}
            {stat.visualization && (
              <div className="mt-4">{stat.visualization}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
