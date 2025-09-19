import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Brain, Search, Star, Clock, Users, TrendingUp, Play, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AIPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  prompt: string;
  variables?: PromptVariable[];
  usage: {
    complexity: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    successRate: number;
    popularity: number;
  };
  performance: {
    totalUses: number;
    averageRating: number;
  };
}

interface PromptVariable {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  placeholder?: string;
  description?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  prompts: string[];
}

export default function AIPromptManager() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [promptVariables, setPromptVariables] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('prompts');

  // Mock data - in real implementation, this would come from API
  const mockPrompts: AIPrompt[] = [
    {
      id: 'devops_engineer',
      title: 'Act as DevOps Engineer',
      description: 'Expert DevOps engineer providing scalable, efficient, and automated solutions',
      category: 'technical',
      tags: ['devops', 'automation', 'infrastructure', 'ci-cd'],
      prompt: 'You are a ${title} DevOps engineer working at ${companyType}. Your role is to provide scalable, efficient, and automated solutions for software deployment, infrastructure management, and CI/CD pipelines. First problem is: ${problem}, suggest the best DevOps practices.',
      variables: [
        {
          name: 'title',
          displayName: 'Seniority Level',
          type: 'select',
          required: true,
          options: ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'],
          defaultValue: 'Senior'
        },
        {
          name: 'companyType',
          displayName: 'Company Type',
          type: 'select',
          required: true,
          options: ['Startup', 'Mid-size Company', 'Big Company', 'Enterprise'],
          defaultValue: 'Big Company'
        },
        {
          name: 'problem',
          displayName: 'Problem Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the DevOps challenge...',
          defaultValue: 'Creating an MVP quickly for an e-commerce web app'
        }
      ],
      usage: {
        complexity: 'advanced',
        estimatedTime: 15,
        successRate: 0.92,
        popularity: 85
      },
      performance: {
        totalUses: 245,
        averageRating: 4.7
      }
    },
    {
      id: 'content_generator',
      title: 'Act as Content Generator',
      description: 'Generate engaging content for various platforms and audiences',
      category: 'creative',
      tags: ['content', 'writing', 'creative', 'social-media', 'marketing'],
      prompt: 'Act as a professional content creator and social media expert. Create engaging, high-quality content for ${platform} that will ${goal}. The content should be ${tone}, target ${audience}, and include ${elements}.',
      variables: [
        {
          name: 'platform',
          displayName: 'Platform',
          type: 'multiselect',
          required: true,
          options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'],
          defaultValue: ['Instagram', 'Twitter']
        },
        {
          name: 'goal',
          displayName: 'Content Goal',
          type: 'select',
          required: true,
          options: ['increase engagement', 'drive traffic', 'build brand awareness', 'generate leads', 'educate audience'],
          defaultValue: 'increase engagement'
        },
        {
          name: 'tone',
          displayName: 'Tone',
          type: 'select',
          required: true,
          options: ['professional', 'casual', 'friendly', 'authoritative', 'humorous', 'inspirational'],
          defaultValue: 'professional'
        },
        {
          name: 'audience',
          displayName: 'Target Audience',
          type: 'string',
          required: true,
          placeholder: 'Describe your target audience...',
          defaultValue: 'young professionals aged 25-35'
        }
      ],
      usage: {
        complexity: 'beginner',
        estimatedTime: 10,
        successRate: 0.95,
        popularity: 92
      },
      performance: {
        totalUses: 892,
        averageRating: 4.8
      }
    },
    {
      id: 'seo_expert',
      title: 'Act as SEO Expert',
      description: 'Expert SEO specialist for content optimization and strategy',
      category: 'business',
      tags: ['seo', 'marketing', 'content', 'optimization', 'strategy'],
      prompt: 'Create an SEO-optimized content strategy for the keyword "${keyword}". Include keyword research, content outline, and optimization recommendations.',
      variables: [
        {
          name: 'keyword',
          displayName: 'Target Keyword',
          type: 'string',
          required: true,
          placeholder: 'Enter your target keyword...',
          defaultValue: 'AI automation tools'
        }
      ],
      usage: {
        complexity: 'intermediate',
        estimatedTime: 25,
        successRate: 0.90,
        popularity: 78
      },
      performance: {
        totalUses: 456,
        averageRating: 4.6
      }
    }
  ];

  const mockTemplates: PromptTemplate[] = [
    {
      id: 'content_creation_workflow',
      name: 'Content Creation Workflow',
      description: 'Complete workflow for creating and optimizing content',
      category: 'creative',
      prompts: ['seo_expert', 'content_generator']
    },
    {
      id: 'technical_development_workflow',
      name: 'Technical Development Workflow',
      description: 'Workflow for technical development tasks',
      category: 'technical',
      prompts: ['devops_engineer']
    }
  ];

  useEffect(() => {
    setPrompts(mockPrompts);
    setTemplates(mockTemplates);
  }, []);

  const categories = ['all', 'technical', 'creative', 'business', 'productivity', 'health', 'development'];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePromptSelect = useCallback((prompt: AIPrompt) => {
    setSelectedPrompt(prompt);
    // Initialize variables with default values
    const initialVariables: Record<string, any> = {};
    prompt.variables?.forEach(variable => {
      initialVariables[variable.name] = variable.defaultValue || '';
    });
    setPromptVariables(initialVariables);
    setExecutionResult('');
  }, []);

  const handleVariableChange = useCallback((variableName: string, value: any) => {
    setPromptVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  }, []);

  const executePrompt = useCallback(async () => {
    if (!selectedPrompt) return;

    setIsExecuting(true);
    try {
      // In real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = `AI-generated response for "${selectedPrompt.title}" with variables: ${JSON.stringify(promptVariables, null, 2)}`;
      setExecutionResult(mockResult);
      setShowExecutionDialog(true);
    } catch (error) {
      setExecutionResult('Error executing prompt: ' + (error as Error).message);
      setShowExecutionDialog(true);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedPrompt, promptVariables]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderVariableInput = (variable: PromptVariable) => {
    switch (variable.type) {
      case 'select':
        return (
          <Select
            value={promptVariables[variable.name] || variable.defaultValue}
            onValueChange={(value) => handleVariableChange(variable.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={variable.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            {variable.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={promptVariables[variable.name]?.includes(option) || false}
                  onChange={(e) => {
                    const current = promptVariables[variable.name] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((item: string) => item !== option);
                    handleVariableChange(variable.name, updated);
                  }}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={variable.placeholder}
            value={promptVariables[variable.name] || variable.defaultValue || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            rows={4}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={variable.placeholder}
            value={promptVariables[variable.name] || variable.defaultValue || ''}
            onChange={(e) => handleVariableChange(variable.name, Number(e.target.value))}
          />
        );
      
      case 'boolean':
        return (
          <Select
            value={promptVariables[variable.name]?.toString() || variable.defaultValue?.toString() || 'false'}
            onValueChange={(value) => handleVariableChange(variable.name, value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            placeholder={variable.placeholder}
            value={promptVariables[variable.name] || variable.defaultValue || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Prompt Manager</h1>
          <p className="text-muted-foreground">
            Curated prompts from the awesome-chatgpt-prompts collection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {prompts.length} Prompts
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prompt List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Available Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredPrompts.map((prompt) => (
                        <Card
                          key={prompt.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPrompt?.id === prompt.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handlePromptSelect(prompt)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-sm">{prompt.title}</h3>
                              <Badge className={`text-xs ${getComplexityColor(prompt.usage.complexity)}`}>
                                {prompt.usage.complexity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {prompt.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {prompt.performance.averageRating.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {prompt.performance.totalUses}
                                </span>
                              </div>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {prompt.usage.estimatedTime}m
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {prompt.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Prompt Details and Execution */}
            <div className="lg:col-span-2">
              {selectedPrompt ? (
                <div className="space-y-4">
                  {/* Prompt Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            {selectedPrompt.title}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1">
                            {selectedPrompt.description}
                          </p>
                        </div>
                        <Badge className={`${getComplexityColor(selectedPrompt.usage.complexity)} text-white`}>
                          {selectedPrompt.usage.complexity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{selectedPrompt.performance.averageRating.toFixed(1)} rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{selectedPrompt.performance.totalUses} uses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>{selectedPrompt.usage.estimatedTime} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variables Configuration */}
                  {selectedPrompt.variables && selectedPrompt.variables.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Configure Variables</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedPrompt.variables.map((variable) => (
                          <div key={variable.name} className="space-y-2">
                            <Label htmlFor={variable.name} className="flex items-center gap-2">
                              {variable.displayName}
                              {variable.required && <span className="text-red-500">*</span>}
                            </Label>
                            {renderVariableInput(variable)}
                            {variable.description && (
                              <p className="text-xs text-muted-foreground">{variable.description}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Execute Button */}
                  <Card>
                    <CardContent className="p-6">
                      <Button
                        onClick={executePrompt}
                        disabled={isExecuting}
                        className="w-full"
                        size="lg"
                      >
                        {isExecuting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Execute Prompt
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Execution Result */}
                  {executionResult && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Execution Result</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(executionResult)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64">
                          <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                            {executionResult}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Prompt</h3>
                    <p className="text-muted-foreground">
                      Choose a prompt from the list to configure and execute it.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Badge variant="outline" className="ml-2">
                        {template.category}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Includes Prompts</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.prompts.map(promptId => {
                          const prompt = prompts.find(p => p.id === promptId);
                          return prompt ? (
                            <Badge key={promptId} variant="secondary" className="text-xs">
                              {prompt.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Execute Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {prompts.reduce((sum, p) => sum + p.performance.totalUses, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Prompt executions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(prompts.reduce((sum, p) => sum + p.performance.averageRating, 0) / prompts.length).toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Out of 5 stars</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length - 1}</div>
                <p className="text-sm text-muted-foreground">Available categories</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Popular Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prompts
                  .sort((a, b) => b.performance.totalUses - a.performance.totalUses)
                  .slice(0, 5)
                  .map((prompt, index) => (
                    <div key={prompt.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{prompt.title}</h4>
                          <p className="text-sm text-muted-foreground">{prompt.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{prompt.performance.totalUses}</div>
                        <div className="text-sm text-muted-foreground">uses</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Execution Result Dialog */}
      <Dialog open={showExecutionDialog} onOpenChange={setShowExecutionDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Execution Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-96">
              <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {executionResult}
              </pre>
            </ScrollArea>
            <div className="flex gap-2">
              <Button onClick={() => copyToClipboard(executionResult)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Result
              </Button>
              <Button variant="outline" onClick={() => setShowExecutionDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
