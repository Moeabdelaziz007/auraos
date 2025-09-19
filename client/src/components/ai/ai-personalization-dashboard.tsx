// AI Personalization Dashboard
// Comprehensive dashboard for AI-powered personalization features

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target,
  Lightbulb,
  BarChart3,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Eye,
  Heart,
  Share
} from 'lucide-react';
import { 
  useAIPersonalization, 
  usePersonalizedRecommendations, 
  usePersonalizationInsights,
  useAdaptiveUI 
} from '../../hooks/use-ai-personalization';

interface AIPersonalizationDashboardProps {
  userId?: string;
}

export function AIPersonalizationDashboard({ userId }: AIPersonalizationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecommendationType, setSelectedRecommendationType] = useState<'content' | 'feature' | 'workflow' | 'agent'>('content');

  const { profile, loading: profileLoading, analyzeBehavior } = useAIPersonalization();
  const { recommendations, loading: recLoading, loadRecommendations } = usePersonalizedRecommendations(selectedRecommendationType);
  const { insights, loading: insightsLoading } = usePersonalizationInsights();
  const { uiPreferences, getLayoutConfig, isAdaptive } = useAdaptiveUI();

  const handleRecommendationFeedback = async (itemId: string, feedback: 'positive' | 'negative') => {
    // This would integrate with the personalization engine
    console.log(`Feedback for ${itemId}: ${feedback}`);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Analyzing your behavior...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Personalization
          </h2>
          <p className="text-muted-foreground">Your personalized AI experience</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={analyzeBehavior} 
            variant="outline" 
            size="sm"
            disabled={profileLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${profileLoading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab profile={profile} insights={insights} isAdaptive={isAdaptive} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsTab 
            recommendations={recommendations}
            loading={recLoading}
            selectedType={selectedRecommendationType}
            onTypeChange={setSelectedRecommendationType}
            onFeedback={handleRecommendationFeedback}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsTab insights={insights} loading={insightsLoading} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesTab 
            profile={profile} 
            uiPreferences={uiPreferences} 
            layoutConfig={getLayoutConfig()} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OverviewTabProps {
  profile: any;
  insights: any[];
  isAdaptive: boolean;
}

function OverviewTab({ profile, insights, isAdaptive }: OverviewTabProps) {
  const totalPreferences = profile?.preferences?.length || 0;
  const totalInsights = insights?.length || 0;
  const behaviorPatterns = profile?.behaviorPatterns?.length || 0;
  const interests = profile?.interests?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Profile</CardTitle>
          <Brain className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isAdaptive ? 'Active' : 'Learning'}</div>
          <p className="text-xs text-muted-foreground">
            {totalPreferences} preferences learned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Behavior Patterns</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{behaviorPatterns}</div>
          <p className="text-xs text-muted-foreground">
            Patterns identified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interests</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{interests}</div>
          <p className="text-xs text-muted-foreground">
            Topics of interest
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          <Lightbulb className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInsights}</div>
          <p className="text-xs text-muted-foreground">
            Personalized insights
          </p>
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Personality Traits</CardTitle>
          <CardDescription>AI-detected personality characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile?.personalityTraits?.slice(0, 4).map((trait: any, index: number) => (
              <div key={trait.trait} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trait.trait}</span>
                  <span className="text-sm text-muted-foreground">
                    {(trait.score * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={trait.score * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Insights */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Insights</CardTitle>
          <CardDescription>Latest AI-generated insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights?.slice(0, 3).map((insight: any, index: number) => (
              <div key={insight.type} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  insight.type === 'usage_pattern' ? 'bg-blue-500' :
                  insight.type === 'new_interest' ? 'bg-green-500' :
                  insight.type === 'preference_change' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{insight.title}</div>
                  <div className="text-xs text-muted-foreground">{insight.description}</div>
                  {insight.actionable && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Actionable
                    </Badge>
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

interface RecommendationsTabProps {
  recommendations: any[];
  loading: boolean;
  selectedType: string;
  onTypeChange: (type: 'content' | 'feature' | 'workflow' | 'agent') => void;
  onFeedback: (itemId: string, feedback: 'positive' | 'negative') => void;
}

function RecommendationsTab({ 
  recommendations, 
  loading, 
  selectedType, 
  onTypeChange, 
  onFeedback 
}: RecommendationsTabProps) {
  const types = [
    { id: 'content', name: 'Content', icon: '📄' },
    { id: 'feature', name: 'Features', icon: '⚡' },
    { id: 'workflow', name: 'Workflows', icon: '🔄' },
    { id: 'agent', name: 'AI Agents', icon: '🤖' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading recommendations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Recommendation Type:</span>
        {types.map(type => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(type.id as any)}
            className="flex items-center gap-2"
          >
            <span>{type.icon}</span>
            {type.name}
          </Button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={rec.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <CardDescription>{rec.description}</CardDescription>
                </div>
                <Badge variant="secondary">
                  {(rec.score * 100).toFixed(0)}% match
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong>Why recommended:</strong> {rec.reason}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {rec.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFeedback(rec.itemId, 'positive')}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFeedback(rec.itemId, 'negative')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  Explore {selectedType}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground">
            Keep using the platform to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
}

interface InsightsTabProps {
  insights: any[];
  loading: boolean;
}

function InsightsTab({ insights, loading }: InsightsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Analyzing insights...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <Card key={insight.type} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  insight.type === 'usage_pattern' ? 'bg-blue-100 text-blue-600' :
                  insight.type === 'new_interest' ? 'bg-green-100 text-green-600' :
                  insight.type === 'preference_change' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {insight.type === 'usage_pattern' ? <BarChart3 className="h-4 w-4" /> :
                   insight.type === 'new_interest' ? <Target className="h-4 w-4" /> :
                   insight.type === 'preference_change' ? <TrendingUp className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <CardDescription>{insight.description}</CardDescription>
                </div>
              </div>
              <Badge variant={insight.actionable ? "default" : "secondary"}>
                {insight.actionable ? 'Actionable' : 'Informational'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Confidence:</span>
                <Progress value={insight.confidence * 100} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground">
                  {(insight.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {insight.recommendations && insight.recommendations.length > 0 && (
                <div>
                  <span className="text-sm font-medium mb-2 block">Recommendations:</span>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec: string, recIndex: number) => (
                      <li key={recIndex} className="text-sm text-muted-foreground flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.actionable && (
                <Button size="sm" className="w-full">
                  Take Action
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {insights.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No insights yet</h3>
          <p className="text-muted-foreground">
            Continue using the platform to generate personalized insights
          </p>
        </div>
      )}
    </div>
  );
}

interface PreferencesTabProps {
  profile: any;
  uiPreferences: any;
  layoutConfig: any;
}

function PreferencesTab({ profile, uiPreferences, layoutConfig }: PreferencesTabProps) {
  return (
    <div className="space-y-6">
      {/* AI-Detected Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Detected Preferences</CardTitle>
          <CardDescription>Preferences learned from your behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile?.preferences?.slice(0, 6).map((pref: any, index: number) => (
              <div key={pref.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    pref.source === 'behavioral' ? 'bg-blue-500' :
                    pref.source === 'explicit' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{pref.preference}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {pref.source} • {pref.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(pref.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UI Adaptations */}
      <Card>
        <CardHeader>
          <CardTitle>UI Adaptations</CardTitle>
          <CardDescription>Interface customizations based on your behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Layout Preferences</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advanced Features</span>
                  <Badge variant={layoutConfig.sidebar.showAdvancedFeatures ? "default" : "secondary"}>
                    {layoutConfig.sidebar.showAdvancedFeatures ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quick Actions</span>
                  <Badge variant={layoutConfig.dashboard.showQuickActions ? "default" : "secondary"}>
                    {layoutConfig.dashboard.showQuickActions ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Social Features</span>
                  <Badge variant={layoutConfig.dashboard.showSocialFeatures ? "default" : "secondary"}>
                    {layoutConfig.dashboard.showSocialFeatures ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Behavior Patterns</h4>
              <div className="space-y-2">
                {profile?.behaviorPatterns?.slice(0, 3).map((pattern: any, index: number) => (
                  <div key={pattern.id} className="text-sm">
                    <div className="font-medium">{pattern.pattern}</div>
                    <div className="text-xs text-muted-foreground">
                      Frequency: {pattern.frequency} • Confidence: {(pattern.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Interests</CardTitle>
          <CardDescription>Topics and categories you're interested in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile?.interests?.map((interest: any, index: number) => (
              <Badge 
                key={interest.id} 
                variant="outline" 
                className="flex items-center space-x-1"
              >
                <span>{interest.topic}</span>
                <span className="text-xs text-muted-foreground">
                  ({(interest.score * 100).toFixed(0)}%)
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIPersonalizationDashboard;
