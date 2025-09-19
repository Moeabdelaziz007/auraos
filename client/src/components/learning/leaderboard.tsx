import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp,
  Users,
  Award,
  Zap
} from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  points: number;
  level: number;
  badges: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  onUserClick?: (userId: string) => void;
}

export function Leaderboard({ entries, currentUserId, onUserClick }: LeaderboardProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">#1</Badge>;
      case 1:
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">#2</Badge>;
      case 2:
        return <Badge className="bg-amber-600/20 text-amber-600 border-amber-600/30">#3</Badge>;
      default:
        return <Badge variant="outline">#{index + 1}</Badge>;
    }
  };

  const getUserDisplayName = (userId: string) => {
    // In a real app, you'd fetch user data
    return `User ${userId.split('-')[1] || userId}`;
  };

  const getUserAvatar = (userId: string) => {
    // Generate consistent avatar based on userId
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <Card className="glass-card neon-glow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="cyber-text">Leaderboard</span>
          <Badge variant="secondary" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                entry.userId === currentUserId 
                  ? 'bg-primary/10 border border-primary/30 neon-glow-sm' 
                  : 'bg-secondary/30 hover:bg-secondary/50'
              } ${index < 3 ? 'border-l-4 border-l-primary' : ''}`}
              onClick={() => onUserClick?.(entry.userId)}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className={getUserAvatar(entry.userId)}>
                  {getUserDisplayName(entry.userId).charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground truncate">
                    {getUserDisplayName(entry.userId)}
                  </span>
                  {entry.userId === currentUserId && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Level {entry.level}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Award className="h-3 w-3" />
                    <span>{entry.badges} badges</span>
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">{entry.points.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>

              {/* Rank Badge */}
              <div>
                {getRankBadge(index)}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leaderboard data available</p>
              <p className="text-sm text-muted-foreground">Start learning to appear on the leaderboard!</p>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        {entries.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(entries.reduce((sum, entry) => sum + entry.points, 0) / entries.length)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(entries.reduce((sum, entry) => sum + entry.level, 0) / entries.length)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(entries.reduce((sum, entry) => sum + entry.badges, 0) / entries.length)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Badges</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
