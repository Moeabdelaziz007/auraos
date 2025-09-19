import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LearningResult {
  success: boolean;
  output?: any;
  error?: string;
  confidence: number;
  explanation: string;
  executionTime: number;
  strategy: string;
  adaptationType: string;
}

interface PerformanceMetrics {
  overallAccuracy: number;
  taskSpecificAccuracy: Record<string, number>;
  adaptationSpeed: number;
  generalizationScore: number;
  confidenceCalibration: number;
  lastCalculated: string;
}

export default function SmartLearningAI() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('content-generation');

  // Performance metrics query
  const { data: metrics, isLoading: metricsLoading } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/ai/performance-metrics', user?.uid],
    enabled: !!user?.uid,
    refetchInterval: 30000
  });

  // Smart learning mutation
  const smartLearningMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/ai/smart-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, ...data })
      });
      if (!response.ok) throw new Error('Failed to process smart learning request');
      return response.json();
    }
  });

  // Zero-shot content generation mutation
  const contentGenerationMutation = useMutation({
    mutationFn: async (data: { prompt: string; topic?: string; style?: string }) => {
      const response = await fetch('/api/ai/zero-shot/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, ...data })
      });
      if (!response.ok) throw new Error('Failed to generate content');
      return response.json();
    }
  });

  // Zero-shot sentiment analysis mutation
  const sentimentAnalysisMutation = useMutation({
    mutationFn: async (data: { text: string }) => {
      const response = await fetch('/api/ai/zero-shot/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, ...data })
      });
      if (!response.ok) throw new Error('Failed to analyze sentiment');
      return response.json();
    }
  });

  // Zero-shot intent classification mutation
  const intentClassificationMutation = useMutation({
    mutationFn: async (data: { text: string }) => {
      const response = await fetch('/api/ai/zero-shot/intent-classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, ...data })
      });
      if (!response.ok) throw new Error('Failed to classify intent');
      return response.json();
    }
  });

  // Zero-shot style transfer mutation
  const styleTransferMutation = useMutation({
    mutationFn: async (data: { text: string; targetStyle: string }) => {
      const response = await fetch('/api/ai/zero-shot/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, ...data })
      });
      if (!response.ok) throw new Error('Failed to transfer style');
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Smart Learning AI</h1>
          <p className="text-muted-foreground">Zero-shot learning with meta-loop adaptation</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <i className="fas fa-brain mr-2"></i>
          Meta-Learning Active
        </Badge>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-chart-line text-primary"></i>
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(metrics.overallAccuracy * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                <Progress value={metrics.overallAccuracy * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {Math.round(metrics.generalizationScore * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Generalization</div>
                <Progress value={metrics.generalizationScore * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {metrics.adaptationSpeed}ms
                </div>
                <div className="text-sm text-muted-foreground">Adaptation Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round(metrics.confidenceCalibration * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
                <Progress value={metrics.confidenceCalibration * 100} className="mt-2" />
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No performance metrics available. Start using the AI to see metrics.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content-generation">Content Generation</TabsTrigger>
          <TabsTrigger value="sentiment-analysis">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="intent-classification">Intent Classification</TabsTrigger>
          <TabsTrigger value="style-transfer">Style Transfer</TabsTrigger>
          <TabsTrigger value="meta-learning">Meta Learning</TabsTrigger>
        </TabsList>

        {/* Content Generation Tab */}
        <TabsContent value="content-generation">
          <ContentGenerationTab mutation={contentGenerationMutation} />
        </TabsContent>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment-analysis">
          <SentimentAnalysisTab mutation={sentimentAnalysisMutation} />
        </TabsContent>

        {/* Intent Classification Tab */}
        <TabsContent value="intent-classification">
          <IntentClassificationTab mutation={intentClassificationMutation} />
        </TabsContent>

        {/* Style Transfer Tab */}
        <TabsContent value="style-transfer">
          <StyleTransferTab mutation={styleTransferMutation} />
        </TabsContent>

        {/* Meta Learning Tab */}
        <TabsContent value="meta-learning">
          <MetaLearningTab mutation={smartLearningMutation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Content Generation Component
function ContentGenerationTab({ mutation }: { mutation: any }) {
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('social_media');
  const [style, setStyle] = useState('professional');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    mutation.mutate({ prompt, topic, style });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zero-Shot Content Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            placeholder="Enter your content prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Topic</label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? 'Generating...' : 'Generate Content'}
        </Button>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>{mutation.error?.message}</AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Generated Content:</h4>
              <div className="p-4 bg-muted rounded-lg">
                {mutation.data.output}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Confidence:</span> {Math.round(mutation.data.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">Strategy:</span> {mutation.data.strategy}
              </div>
              <div>
                <span className="font-medium">Execution Time:</span> {mutation.data.executionTime}ms
              </div>
              <div>
                <span className="font-medium">Type:</span> {mutation.data.adaptationType}
              </div>
            </div>
            
            <div>
              <span className="font-medium">Explanation:</span>
              <p className="text-sm text-muted-foreground mt-1">{mutation.data.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sentiment Analysis Component
function SentimentAnalysisTab({ mutation }: { mutation: any }) {
  const [text, setText] = useState('');

  const handleAnalyze = () => {
    if (!text.trim()) return;
    mutation.mutate({ text });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zero-Shot Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Text to Analyze</label>
          <Textarea
            placeholder="Enter text for sentiment analysis..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleAnalyze}
          disabled={!text.trim() || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? 'Analyzing...' : 'Analyze Sentiment'}
        </Button>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>{mutation.error?.message}</AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Sentiment Analysis Result:</h4>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">
                  {mutation.data.output > 0.1 ? '😊 Positive' : 
                   mutation.data.output < -0.1 ? '😞 Negative' : '😐 Neutral'}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Score: {mutation.data.output.toFixed(3)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Confidence:</span> {Math.round(mutation.data.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">Strategy:</span> {mutation.data.strategy}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Intent Classification Component
function IntentClassificationTab({ mutation }: { mutation: any }) {
  const [text, setText] = useState('');

  const handleClassify = () => {
    if (!text.trim()) return;
    mutation.mutate({ text });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zero-Shot Intent Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Text to Classify</label>
          <Textarea
            placeholder="Enter text for intent classification..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleClassify}
          disabled={!text.trim() || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? 'Classifying...' : 'Classify Intent'}
        </Button>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>{mutation.error?.message}</AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Intent Classification Result:</h4>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Badge variant="outline" className="text-lg">
                  {mutation.data.output}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Confidence:</span> {Math.round(mutation.data.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">Strategy:</span> {mutation.data.strategy}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Style Transfer Component
function StyleTransferTab({ mutation }: { mutation: any }) {
  const [text, setText] = useState('');
  const [targetStyle, setTargetStyle] = useState('professional');

  const handleTransfer = () => {
    if (!text.trim()) return;
    mutation.mutate({ text, targetStyle });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zero-Shot Style Transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Original Text</label>
          <Textarea
            placeholder="Enter text to transfer style..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Target Style</label>
          <Select value={targetStyle} onValueChange={setTargetStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleTransfer}
          disabled={!text.trim() || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? 'Transferring...' : 'Transfer Style'}
        </Button>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>{mutation.error?.message}</AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Style Transfer Result:</h4>
              <div className="p-4 bg-muted rounded-lg">
                {mutation.data.output}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Confidence:</span> {Math.round(mutation.data.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">Strategy:</span> {mutation.data.strategy}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Meta Learning Component
function MetaLearningTab({ mutation }: { mutation: any }) {
  const [taskType, setTaskType] = useState('content_generation');
  const [inputData, setInputData] = useState('');
  const [metadata, setMetadata] = useState('');

  const handleMetaLearn = () => {
    if (!inputData.trim()) return;
    
    let parsedMetadata = {};
    try {
      parsedMetadata = metadata ? JSON.parse(metadata) : {};
    } catch (e) {
      console.error('Invalid metadata JSON');
    }

    mutation.mutate({ taskType, inputData, metadata: parsedMetadata });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta Learning System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Task Type</label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="content_generation">Content Generation</SelectItem>
              <SelectItem value="sentiment_analysis">Sentiment Analysis</SelectItem>
              <SelectItem value="intent_classification">Intent Classification</SelectItem>
              <SelectItem value="style_transfer">Style Transfer</SelectItem>
              <SelectItem value="custom">Custom Task</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Input Data</label>
          <Textarea
            placeholder="Enter input data for meta learning..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Metadata (JSON)</label>
          <Textarea
            placeholder='{"key": "value"}'
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={handleMetaLearn}
          disabled={!inputData.trim() || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? 'Meta Learning...' : 'Execute Meta Learning'}
        </Button>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>{mutation.error?.message}</AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Meta Learning Result:</h4>
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap">{JSON.stringify(mutation.data.output, null, 2)}</pre>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Confidence:</span> {Math.round(mutation.data.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">Strategy:</span> {mutation.data.strategy}
              </div>
              <div>
                <span className="font-medium">Execution Time:</span> {mutation.data.executionTime}ms
              </div>
              <div>
                <span className="font-medium">Type:</span> {mutation.data.adaptationType}
              </div>
            </div>
            
            <div>
              <span className="font-medium">Explanation:</span>
              <p className="text-sm text-muted-foreground mt-1">{mutation.data.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
