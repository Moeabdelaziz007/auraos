import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Clock, 
  Target, 
  Zap, 
  BookOpen,
  Bot,
  Cog,
  Workflow,
  Star,
  TrendingUp,
  ArrowRight
} from "lucide-react";

interface LearningRecommendation {
  id: string;
  userId: string;
  type: 'feature_tutorial' | 'ai_prompt' | 'automation_template' | 'workflow_suggestion';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  points: number;
  prerequisites: string[];
  category: string;
  priority: number;
  createdAt: Date;
}

interface RecommendationsProps {
  recommendations: LearningRecommendation[];
  onStartRecommendation?: (recommendation: LearningRecommendation) => void;
  onDismissRecommendation?: (recommendationId: string) => void;
}

export function Recommendations({ 
  recommendations, 
  onStartRecommendation, 
  onDismissRecommendation 
}: RecommendationsProps) {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'feature_tutorial':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'ai_prompt':
        return <Bot className="h-4 w-4 text-purple-500" />;
      case 'automation_template':
        return <Cog className="h-4 w-4 text-green-500" />;
      case 'workflow_suggestion':
        return <Workflow className="h-4 w-4 text-orange-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 8) return <Star className="h-3 w-3 text-yellow-500" />;
    if (priority >= 5) return <TrendingUp className="h-3 w-3 text-blue-500" />;
    return <Target className="h-3 w-3 text-gray-500" />;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getCategoryDisplayName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold cyber-text">Learning Recommendations</h3>
        <Badge variant="secondary" className="neon-glow-sm">
          <Lightbulb className="h-3 w-3 mr-1" />
          {recommendations.length} Suggestions
        </Badge>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className="glass-card neon-glow-sm hover:neon-glow-md transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getRecommendationIcon(recommendation.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        {recommendation.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {getPriorityIcon(recommendation.priority)}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={getDifficultyColor(recommendation.difficulty)}>
                      {recommendation.difficulty}
                    </Badge>
                    
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(recommendation.estimatedTime)}
                    </Badge>
                    
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {recommendation.points} points
                    </Badge>

                    <Badge variant="outline" className="text-xs">
                      {getCategoryDisplayName(recommendation.category)}
                    </Badge>
                  </div>

                  {/* Prerequisites */}
                  {recommendation.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Prerequisites:</div>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Priority: {recommendation.priority}/10
                    </div>
                    
                    <div className="flex space-x-2">
                      {onDismissRecommendation && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDismissRecommendation(recommendation.id)}
                        >
                          Dismiss
                        </Button>
                      )}
                      {onStartRecommendation && (
                        <Button 
                          size="sm" 
                          onClick={() => onStartRecommendation(recommendation)}
                          className="neon-button"
                        >
                          Start Learning
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {recommendations.length === 0 && (
          <Card className="glass-card">
            <CardContent className="py-8">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recommendations available</p>
                <p className="text-sm text-muted-foreground">
                  Keep using AuraOS to get personalized learning suggestions
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {recommendations.length > 0 && (
        <Card className="glass-card neon-glow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Quick Actions</h4>
                <p className="text-sm text-muted-foreground">
                  Jump into learning with these popular recommendations
                </p>
              </div>
              <div className="flex space-x-2">
                {recommendations.slice(0, 2).map((rec) => (
                  <Button 
                    key={rec.id}
                    size="sm" 
                    variant="outline"
                    onClick={() => onStartRecommendation?.(rec)}
                    className="neon-glow-sm"
                  >
                    {rec.title.split(' ').slice(0, 2).join(' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
