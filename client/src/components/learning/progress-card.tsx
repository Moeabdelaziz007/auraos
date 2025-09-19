import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  TrendingUp,
  Award,
  Flame,
  Crown
} from "lucide-react";

interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  experience: number;
  badges: string[];
  achievements: Achievement[];
  learningStreak: number;
  lastActivityDate: Date;
  skillPoints: Record<string, number>;
  weeklyGoal: number;
  monthlyGoal: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  metadata: Record<string, any>;
}

interface ProgressCardProps {
  progress: UserProgress;
  onViewDetails?: () => void;
  compact?: boolean;
}

export function ProgressCard({ progress, onViewDetails, compact = false }: ProgressCardProps) {
  const getLevelProgress = () => {
    const currentLevelExp = (progress.level - 1) ** 2 * 100;
    const nextLevelExp = progress.level ** 2 * 100;
    const progressPercent = ((progress.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.max(0, Math.min(100, progressPercent));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (level >= 20) return <Trophy className="h-4 w-4 text-purple-500" />;
    if (level >= 10) return <Star className="h-4 w-4 text-blue-500" />;
    return <Target className="h-4 w-4 text-green-500" />;
  };

  if (compact) {
    return (
      <Card className="glass-card neon-glow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getLevelIcon(progress.level)}
              <div>
                <div className="font-semibold text-foreground">Level {progress.level}</div>
                <div className="text-sm text-muted-foreground">{progress.totalPoints} points</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{progress.learningStreak}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card neon-glow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getLevelIcon(progress.level)}
            <span className="cyber-text">Progress Dashboard</span>
          </CardTitle>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Level {progress.level}</span>
            <span className="text-sm text-muted-foreground">
              {progress.experience} XP
            </span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {progress.level ** 2 * 100 - progress.experience} XP to next level
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold">{progress.totalPoints}</span>
            </div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">{progress.learningStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Badges ({progress.badges.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.badges.slice(0, 6).map((badgeId, index) => (
              <Badge 
                key={badgeId} 
                variant="secondary" 
                className="neon-glow-sm text-xs"
              >
                🏆 {index + 1}
              </Badge>
            ))}
            {progress.badges.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{progress.badges.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        {progress.achievements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Recent Achievements</span>
            </div>
            <div className="space-y-2">
              {progress.achievements.slice(-3).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-secondary/30"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                    <span className="text-sm">{achievement.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {achievement.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{achievement.points}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Goal Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Weekly Goal</span>
            <span className="text-sm text-muted-foreground">
              {Math.min(progress.totalPoints % progress.weeklyGoal, progress.weeklyGoal)} / {progress.weeklyGoal}
            </span>
          </div>
          <Progress 
            value={(progress.totalPoints % progress.weeklyGoal) / progress.weeklyGoal * 100} 
            className="h-2" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
