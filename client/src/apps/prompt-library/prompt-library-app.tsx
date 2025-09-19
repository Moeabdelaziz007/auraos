import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, CheckCircle, XCircle, Info, Zap, Globe, Code, Brain, Search, FileText, Languages, Link, BarChart3, Copy, Star, Heart } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  useCase: string;
  examples?: string[];
  author?: string;
  rating: number;
  usageCount: number;
}

const promptCategories = [
  'Development', 'Writing', 'Analysis', 'Creative', 'Business', 'Education', 
  'Marketing', 'Research', 'Design', 'Technical', 'Communication', 'Problem Solving'
];

const samplePrompts: Prompt[] = [
  {
    id: 'code-reviewer',
    title: 'Act as Code Reviewer',
    description: 'Review code for bugs, performance issues, and best practices',
    category: 'Development',
    prompt: 'I want you to act as a code reviewer. I will provide you with code snippets, and you will review them for bugs, performance issues, security vulnerabilities, and adherence to best practices. Provide constructive feedback and suggestions for improvement.',
    tags: ['code', 'review', 'debugging', 'best-practices'],
    difficulty: 'intermediate',
    useCase: 'Code quality assurance and improvement',
    examples: ['Review this React component', 'Check this API endpoint for security issues'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.8,
    usageCount: 1247
  },
  {
    id: 'seo-expert',
    title: 'Act as SEO Expert',
    description: 'Provide SEO strategies, techniques, and insights',
    category: 'Marketing',
    prompt: 'I want you to act as an SEO expert. Your task is to analyze websites, provide SEO strategies, keyword research, content optimization advice, and technical SEO recommendations. Focus solely on SEO strategies, techniques, and insights.',
    tags: ['seo', 'marketing', 'optimization', 'keywords'],
    difficulty: 'intermediate',
    useCase: 'Website optimization and search ranking improvement',
    examples: ['Analyze my website SEO', 'Suggest keywords for my blog'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.6,
    usageCount: 892
  },
  {
    id: 'devops-engineer',
    title: 'Act as DevOps Engineer',
    description: 'Provide scalable, efficient, and automated solutions for deployment',
    category: 'Technical',
    prompt: 'You are a Senior DevOps engineer. Your role is to provide scalable, efficient, and automated solutions for software deployment, infrastructure management, and CI/CD pipelines. Suggest best DevOps practices, including infrastructure setup, deployment strategies, automation tools, and cost-effective scaling solutions.',
    tags: ['devops', 'deployment', 'automation', 'infrastructure'],
    difficulty: 'advanced',
    useCase: 'Infrastructure and deployment automation',
    examples: ['Set up CI/CD pipeline', 'Design scalable architecture'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.7,
    usageCount: 654
  },
  {
    id: 'linux-script-developer',
    title: 'Act as Linux Script Developer',
    description: 'Create professional Bash scripts with error handling and best practices',
    category: 'Development',
    prompt: 'You are an expert Linux script developer. Create professional Bash scripts that automate workflows, featuring error handling, colorized output, comprehensive parameter handling with help flags, appropriate documentation, and adherence to shell scripting best practices.',
    tags: ['linux', 'bash', 'scripting', 'automation'],
    difficulty: 'intermediate',
    useCase: 'Linux system automation and scripting',
    examples: ['Create backup script', 'Automate server deployment'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.5,
    usageCount: 423
  },
  {
    id: 'nutritionist',
    title: 'Act as Nutritionist',
    description: 'Create healthy recipes with nutritional information',
    category: 'Health',
    prompt: 'Act as a nutritionist and create healthy recipes. Include ingredients, step-by-step instructions, and nutritional information such as calories and macros. Focus on balanced, nutritious meals.',
    tags: ['nutrition', 'health', 'recipes', 'wellness'],
    difficulty: 'beginner',
    useCase: 'Healthy meal planning and nutrition guidance',
    examples: ['Create vegan dinner recipe', 'Plan weekly meal prep'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.3,
    usageCount: 567
  },
  {
    id: 'tech-troubleshooter',
    title: 'Act as Tech Troubleshooter',
    description: 'Provide troubleshooting steps for tech issues',
    category: 'Technical',
    prompt: 'I want you to act as a tech troubleshooter. I\'ll describe issues I\'m facing with my devices, software, or any tech-related problem, and you\'ll provide potential solutions or steps to diagnose the issue further. Reply only with troubleshooting steps or solutions.',
    tags: ['troubleshooting', 'tech-support', 'debugging'],
    difficulty: 'intermediate',
    useCase: 'Technical problem resolution',
    examples: ['Computer won\'t turn on', 'Software installation issues'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.4,
    usageCount: 789
  },
  {
    id: 'content-writer',
    title: 'Act as Content Writer',
    description: 'Create engaging and SEO-optimized content',
    category: 'Writing',
    prompt: 'Act as a professional content writer. Create engaging, informative, and SEO-optimized content for various platforms including blogs, social media, and websites. Focus on clarity, engagement, and value for the target audience.',
    tags: ['content', 'writing', 'seo', 'marketing'],
    difficulty: 'intermediate',
    useCase: 'Content creation and marketing',
    examples: ['Write blog post about AI', 'Create social media content'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.6,
    usageCount: 1123
  },
  {
    id: 'data-analyst',
    title: 'Act as Data Analyst',
    description: 'Analyze data and provide insights and visualizations',
    category: 'Analysis',
    prompt: 'Act as a data analyst. Analyze datasets, identify patterns, trends, and insights. Provide statistical analysis, data visualization recommendations, and actionable insights based on the data.',
    tags: ['data', 'analysis', 'statistics', 'insights'],
    difficulty: 'advanced',
    useCase: 'Data analysis and business intelligence',
    examples: ['Analyze sales data', 'Create data visualization'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.7,
    usageCount: 445
  },
  {
    id: 'ui-ux-designer',
    title: 'Act as UI/UX Designer',
    description: 'Design user interfaces and improve user experience',
    category: 'Design',
    prompt: 'Act as a UI/UX designer. Create user-centered designs, wireframes, and prototypes. Focus on usability, accessibility, and user experience principles. Provide design recommendations and best practices.',
    tags: ['design', 'ui', 'ux', 'usability'],
    difficulty: 'intermediate',
    useCase: 'User interface and experience design',
    examples: ['Design mobile app interface', 'Improve website UX'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.5,
    usageCount: 678
  },
  {
    id: 'business-strategist',
    title: 'Act as Business Strategist',
    description: 'Develop business strategies and growth plans',
    category: 'Business',
    prompt: 'Act as a business strategist. Analyze business situations, market conditions, and competitive landscapes. Develop strategic plans, growth strategies, and recommendations for business improvement.',
    tags: ['business', 'strategy', 'growth', 'planning'],
    difficulty: 'advanced',
    useCase: 'Business strategy and planning',
    examples: ['Develop market entry strategy', 'Create business growth plan'],
    author: 'awesome-chatgpt-prompts',
    rating: 4.8,
    usageCount: 334
  }
];

export default function PromptLibraryApp() {
  const [prompts, setPrompts] = useState<Prompt[]>(samplePrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeTab, setActiveTab] = useState('browse');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState("Development");

  const categories = ['all', ...promptCategories];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || prompt.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleAddToFavorites = (promptId: string) => {
    setFavorites(prev => 
      prev.includes(promptId) 
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleAddCustomPrompt = () => {
    if (!customPrompt.trim() || !customTitle.trim()) return;

    const newPrompt: Prompt = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      description: customPrompt.substring(0, 100) + '...',
      category: customCategory,
      prompt: customPrompt,
      tags: [],
      difficulty: 'intermediate',
      useCase: 'Custom prompt',
      author: 'You',
      rating: 0,
      usageCount: 0
    };

    setPrompts(prev => [newPrompt, ...prev]);
    setCustomPrompt("");
    setCustomTitle("");
    setActiveTab('browse');
  };

  const handleUsePrompt = (prompt: Prompt) => {
    // This would integrate with your AI agents
    console.log('Using prompt:', prompt);
    // You could trigger an agent execution here
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text">Prompt Library</h1>
          <p className="text-muted-foreground mt-2">
            Curated ChatGPT prompts from the awesome-chatgpt-prompts repository
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {prompts.length} Prompts • {favorites.length} Favorites
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="integrate">Integrate</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map(prompt => (
              <Card 
                key={prompt.id} 
                className="glass-card cursor-pointer hover:scale-105 transition-all"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      {prompt.title}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFavorites(prompt.id);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(prompt.id) ? 'text-red-500 fill-red-500' : ''}`} />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {prompt.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{prompt.category}</Badge>
                    <Badge variant="secondary" className={getDifficultyColor(prompt.difficulty)}>
                      {prompt.difficulty}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {prompt.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{prompt.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{prompt.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {prompt.usageCount} uses
                    </span>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUsePrompt(prompt);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Use Prompt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.filter(p => favorites.includes(p.id)).map(prompt => (
              <Card key={prompt.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      {prompt.title}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddToFavorites(prompt.id)}
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {prompt.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{prompt.category}</Badge>
                      <Badge variant="secondary" className={getDifficultyColor(prompt.difficulty)}>
                        {prompt.difficulty}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleUsePrompt(prompt)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Use Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Create Custom Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter prompt title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={customCategory} onValueChange={setCustomCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promptCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  placeholder="Enter your custom prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={8}
                />
              </div>

              <Button 
                onClick={handleAddCustomPrompt}
                disabled={!customPrompt.trim() || !customTitle.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Prompt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrate" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Integrate with AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Prompts from the awesome-chatgpt-prompts repository can be integrated with your AI agents 
                    to enhance their capabilities and provide specialized behaviors.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <h4 className="font-medium mb-2">Research Agent</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use SEO Expert and Data Analyst prompts
                    </p>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/10">
                    <h4 className="font-medium mb-2">Development Agent</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use Code Reviewer and DevOps Engineer prompts
                    </p>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10">
                    <h4 className="font-medium mb-2">Content Agent</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use Content Writer and SEO Expert prompts
                    </p>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-500/10">
                    <h4 className="font-medium mb-2">Analytics Agent</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use Data Analyst and Business Strategist prompts
                    </p>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedPrompt && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedPrompt.title}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPrompt(null)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedPrompt.category}</Badge>
              <Badge variant="secondary" className={getDifficultyColor(selectedPrompt.difficulty)}>
                {selectedPrompt.difficulty}
              </Badge>
              <Badge variant="outline">{selectedPrompt.author}</Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description:</h4>
              <p className="text-sm text-muted-foreground">{selectedPrompt.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Use Case:</h4>
              <p className="text-sm text-muted-foreground">{selectedPrompt.useCase}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Prompt:</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{selectedPrompt.prompt}</pre>
              </div>
            </div>

            {selectedPrompt.examples && (
              <div>
                <h4 className="font-medium mb-2">Examples:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedPrompt.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => handleUsePrompt(selectedPrompt)}>
                <Play className="w-4 h-4 mr-2" />
                Use This Prompt
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleAddToFavorites(selectedPrompt.id)}
              >
                <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedPrompt.id) ? 'text-red-500 fill-red-500' : ''}`} />
                {favorites.includes(selectedPrompt.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          This prompt library integrates curated prompts from the awesome-chatgpt-prompts repository. 
          These prompts can be used with your AI agents to provide specialized behaviors and enhanced capabilities.
        </AlertDescription>
      </Alert>
    </div>
  );
}
