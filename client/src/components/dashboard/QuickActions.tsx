import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onShowAIFeatures: () => void;
  onShowAnalytics: () => void;
  onShowWorkflows: () => void;
}

export default function QuickActions({ onShowAIFeatures, onShowAnalytics, onShowWorkflows }: QuickActionsProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="gradient-cyber-tertiary bg-clip-text text-transparent">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300" data-testid="button-schedule-post">
            <i className="fas fa-calendar-plus text-xl mb-2"></i>
            <span className="text-sm font-medium">Schedule Post</span>
          </Button>

          <Button
            variant="ghost"
            className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/10 text-purple-400 hover:from-purple-500/30 hover:to-purple-500/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300"
            data-testid="button-ai-personalization"
            onClick={onShowAIFeatures}
          >
            <i className="fas fa-brain text-xl mb-2"></i>
            <span className="text-sm font-medium">AI Personalization</span>
          </Button>

          <Button
            variant="ghost"
            className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-400 hover:from-blue-500/30 hover:to-blue-500/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300"
            data-testid="button-view-analytics"
            onClick={onShowAnalytics}
          >
            <i className="fas fa-chart-bar text-xl mb-2"></i>
            <span className="text-sm font-medium">Analytics</span>
          </Button>

          <Button
            variant="ghost"
            className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/10 text-orange-400 hover:from-orange-500/30 hover:to-orange-500/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300"
            data-testid="button-workflow-marketplace"
            onClick={onShowWorkflows}
          >
            <i className="fas fa-cogs text-xl mb-2"></i>
            <span className="text-sm font-medium">Workflows</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
