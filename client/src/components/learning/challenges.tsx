import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  Trophy, 
  Users, 
  Zap, 
  Award,
  Calendar,
  CheckCircle,
  Circle,
  Star
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: string;
  requirements: {
    type: string;
    threshold: number;
    timeframe: string;
  }[];
  rewards: {
    points: number;
    badges: string[];
    achievements: string[];
  };
  startDate: Date;
  endDate: Date;
  participants: string[];
  isActive: boolean;
}

interface UserChallengeProgress {
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

interface ChallengesProps {
  challenges: Challenge[];
  userProgress?: UserChallengeProgress[];
  onJoinChallenge?: (challengeId: string) => void;
  onViewDetails?: (challengeId: string) => void;
}

export function Challenges({ 
  challenges, 
  userProgress = [], 
  onJoinChallenge, 
  onViewDetails 
}: ChallengesProps) {
  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'weekly':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'monthly':
        return <Trophy className="h-4 w-4 text-purple-500" />;
      case 'special':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'weekly':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'monthly':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'special':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
  };

  const getProgressForChallenge = (challengeId: string) => {
    return userProgress.find(p => p.challengeId === challengeId);
  };

  const getProgressPercentage = (challenge: Challenge, progress?: UserChallengeProgress) => {
    if (!progress) return 0;
    const requirement = challenge.requirements[0]; // Use first requirement for simplicity
    return Math.min(100, (progress.progress / requirement.threshold) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold cyber-text">Learning Challenges</h3>
        <Badge variant="secondary" className="neon-glow-sm">
          <Users className="h-3 w-3 mr-1" />
          {challenges.filter(c => c.isActive).length} Active
        </Badge>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => {
          const progress = getProgressForChallenge(challenge.id);
          const isCompleted = progress?.completed || false;
          const progressPercentage = getProgressPercentage(challenge, progress);

          return (
            <Card 
              key={challenge.id} 
              className={`glass-card transition-all duration-200 ${
                isCompleted 
                  ? 'neon-glow-md border-green-500/30' 
                  : 'neon-glow-sm hover:neon-glow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getChallengeTypeIcon(challenge.type)}
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{challenge.title}</span>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getChallengeTypeColor(challenge.type)}>
                      {challenge.type}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeRemaining(challenge.endDate)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Requirements */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Requirements:</div>
                  <div className="space-y-1">
                    {challenge.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {req.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="font-medium">
                          {progress?.progress || 0} / {req.threshold}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {!isCompleted && (
                  <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      {progressPercentage.toFixed(1)}% Complete
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Rewards:</div>
                  <div className="flex flex-wrap gap-2">
                    {challenge.rewards.points > 0 && (
                      <Badge variant="secondary" className="neon-glow-sm">
                        <Zap className="h-3 w-3 mr-1" />
                        {challenge.rewards.points} points
                      </Badge>
                    )}
                    {challenge.rewards.badges.map((badgeId, index) => (
                      <Badge key={badgeId} variant="outline" className="neon-glow-sm">
                        <Award className="h-3 w-3 mr-1" />
                        Badge {index + 1}
                      </Badge>
                    ))}
                    {challenge.rewards.achievements.map((achievementId, index) => (
                      <Badge key={achievementId} variant="outline" className="neon-glow-sm">
                        <Trophy className="h-3 w-3 mr-1" />
                        Achievement {index + 1}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{challenge.participants.length} participants</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {onViewDetails && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewDetails(challenge.id)}
                      >
                        Details
                      </Button>
                    )}
                    {!isCompleted && onJoinChallenge && !challenge.participants.includes('current-user') && (
                      <Button 
                        size="sm" 
                        onClick={() => onJoinChallenge(challenge.id)}
                        className="neon-button"
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </div>

                {/* Completion Status */}
                {isCompleted && progress?.completedAt && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center space-x-2 text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Completed on {progress.completedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {challenges.length === 0 && (
          <Card className="glass-card">
            <CardContent className="py-8">
              <div className="text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No challenges available</p>
                <p className="text-sm text-muted-foreground">
                  New challenges will appear here regularly
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
