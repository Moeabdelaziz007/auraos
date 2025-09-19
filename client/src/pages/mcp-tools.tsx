import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, CheckCircle, XCircle, Info, Zap, Globe, Code, Brain, Search, FileText, Languages, Link, BarChart3, Settings } from "lucide-react";
import CursorCLIApp from "@/apps/mcp-tools/cursor-cli-app";
import CometChromeApp from "@/apps/mcp-tools/comet-chrome-app";
import WebScraperApp from "@/apps/mcp-tools/web-scraper-app";
import DataAnalyzerApp from "@/apps/mcp-tools/data-analyzer-app";
import MultilingualAssistantApp from "@/apps/mcp-tools/multilingual-assistant-app";
import SystemDesignerApp from "@/apps/mcp-tools/system-designer-app";

interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    options?: string[];
  }[];
  examples: {
    title: string;
    params: any;
    description: string;
  }[];
}

const mcpTools: MCPTool[] = [
  {
    id: 'cursor_cli',
    name: 'Cursor CLI',
    description: 'Execute commands to LLMs via Cursor CLI with advanced capabilities',
    category: 'Development',
    icon: <Code className="w-5 h-5" />,
    parameters: [
      { name: 'command', type: 'string', required: true, description: 'The command to execute in the Cursor CLI' },
      { name: 'model', type: 'string', required: false, description: 'The LLM model to use', options: ['claude-3.5-sonnet', 'gpt-4', 'claude-3-opus'] },
      { name: 'operation_type', type: 'string', required: false, description: 'Type of operation', options: ['explain', 'refactor', 'debug', 'optimize', 'generate', 'review', 'test'] },
      { name: 'context', type: 'string', required: false, description: 'Additional context for the command' },
      { name: 'file_path', type: 'string', required: false, description: 'Path to the file to operate on' }
    ],
    examples: [
      {
        title: 'Code Explanation',
        params: { command: 'explain this React component', operation_type: 'explain', model: 'claude-3.5-sonnet' },
        description: 'Get detailed explanation of code functionality'
      },
      {
        title: 'Code Refactoring',
        params: { command: 'refactor this function to use async/await', operation_type: 'refactor', model: 'claude-3.5-sonnet' },
        description: 'Get refactoring suggestions and implementations'
      },
      {
        title: 'Debug Analysis',
        params: { command: 'debug this null reference error', operation_type: 'debug', model: 'claude-3.5-sonnet' },
        description: 'Analyze and debug code issues'
      }
    ]
  },
  {
    id: 'comet_chrome',
    name: 'Comet Chrome',
    description: 'Integrate with Comet Chrome extension for AI-powered web browsing and content analysis',
    category: 'Web Analysis',
    icon: <Globe className="w-5 h-5" />,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'Action to perform with Comet', options: ['analyze_page', 'extract_content', 'summarize_article', 'find_similar', 'translate_content', 'generate_questions', 'create_outline', 'extract_links', 'analyze_sentiment', 'get_keywords'] },
      { name: 'url', type: 'string', required: false, description: 'URL of the webpage to analyze' },
      { name: 'content', type: 'string', required: false, description: 'Content to analyze' },
      { name: 'language', type: 'string', required: false, description: 'Target language for translation' },
      { name: 'max_results', type: 'number', required: false, description: 'Maximum number of results to return' },
      { name: 'context', type: 'string', required: false, description: 'Additional context for the analysis' }
    ],
    examples: [
      {
        title: 'Page Analysis',
        params: { action: 'analyze_page', url: 'https://example.com' },
        description: 'Analyze webpage structure, SEO, and content quality'
      },
      {
        title: 'Content Summarization',
        params: { action: 'summarize_article', url: 'https://example.com/article' },
        description: 'Generate a summary of article content'
      },
      {
        title: 'Sentiment Analysis',
        params: { action: 'analyze_sentiment', content: 'This is great content!' },
        description: 'Analyze sentiment and emotional tone of content'
      }
    ]
  },
  {
    id: 'web_scraper',
    name: 'Web Scraper',
    description: 'Scrape web content from any URL (free, no API key required)',
    category: 'Web Analysis',
    icon: <Search className="w-5 h-5" />,
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'The URL to scrape' },
      { name: 'selector', type: 'string', required: false, description: 'CSS selector to extract specific content' },
      { name: 'extract_text', type: 'boolean', required: false, description: 'Whether to extract only text content' }
    ],
    examples: [
      {
        title: 'Basic Scraping',
        params: { url: 'https://example.com', extract_text: true },
        description: 'Extract text content from a webpage'
      },
      {
        title: 'Selective Scraping',
        params: { url: 'https://example.com', selector: '.article-content' },
        description: 'Extract specific content using CSS selector'
      }
    ]
  },
  {
    id: 'data_analyzer',
    name: 'Data Analyzer',
    description: 'Analyze data using free statistical methods',
    category: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    parameters: [
      { name: 'data', type: 'array', required: true, description: 'Array of data points to analyze' },
      { name: 'analysis_type', type: 'string', required: true, description: 'Type of analysis to perform', options: ['descriptive', 'correlation', 'trend', 'outliers'] }
    ],
    examples: [
      {
        title: 'Descriptive Analysis',
        params: { data: [1, 2, 3, 4, 5], analysis_type: 'descriptive' },
        description: 'Get basic statistics (mean, median, std dev)'
      },
      {
        title: 'Trend Analysis',
        params: { data: [10, 15, 20, 25, 30], analysis_type: 'trend' },
        description: 'Analyze trends in data over time'
      }
    ]
  },
  {
    id: 'text_processor',
    name: 'Text Processor',
    description: 'Process text with various free NLP operations',
    category: 'Text Processing',
    icon: <FileText className="w-5 h-5" />,
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Text to process' },
      { name: 'operation', type: 'string', required: true, description: 'Text processing operation', options: ['summarize', 'extract_keywords', 'sentiment', 'translate', 'clean'] },
      { name: 'language', type: 'string', required: false, description: 'Target language for translation' }
    ],
    examples: [
      {
        title: 'Text Summarization',
        params: { text: 'Long article text...', operation: 'summarize' },
        description: 'Generate a summary of the text'
      },
      {
        title: 'Keyword Extraction',
        params: { text: 'Article about AI and machine learning', operation: 'extract_keywords' },
        description: 'Extract key terms and phrases'
      },
      {
        title: 'Sentiment Analysis',
        params: { text: 'I love this product!', operation: 'sentiment' },
        description: 'Analyze emotional tone of text'
      }
    ]
  },
  {
    id: 'ai_generation_tool',
    name: 'AI Generator',
    description: 'Generate content using AI models',
    category: 'AI',
    icon: <Brain className="w-5 h-5" />,
    parameters: [
      { name: 'prompt', type: 'string', required: true, description: 'AI prompt' },
      { name: 'model', type: 'string', required: false, description: 'AI model to use' },
      { name: 'max_tokens', type: 'number', required: false, description: 'Maximum tokens' }
    ],
    examples: [
      {
        title: 'Content Generation',
        params: { prompt: 'Write a blog post about AI', model: 'gpt-4', max_tokens: 1000 },
        description: 'Generate creative content using AI'
      },
      {
        title: 'Code Generation',
        params: { prompt: 'Create a React component for user login', model: 'claude-3.5-sonnet' },
        description: 'Generate code snippets and components'
      }
    ]
  }
];

export default function MCPToolsPage() {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [testParams, setTestParams] = useState<any>({});
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleToolSelect = (tool: MCPTool) => {
    setSelectedTool(tool);
    setTestParams({});
    setTestResults(null);
    setActiveTab('test');
  };

  const handleTestRun = async () => {
    if (!selectedTool) return;
    
    setIsLoading(true);
    try {
      // Simulate MCP tool execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      // Generate realistic test results based on tool type
      const mockResults = generateMockResults(selectedTool.id, testParams);
      setTestResults(mockResults);
    } catch (error) {
      setTestResults({
        success: false,
        error: 'Failed to execute tool',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResults = (toolId: string, params: any) => {
    const baseResult = {
      success: true,
      tool: toolId,
      params,
      timestamp: new Date().toISOString(),
      execution_time_ms: Math.floor(Math.random() * 3000) + 500
    };

    switch (toolId) {
      case 'cursor_cli':
        return {
          ...baseResult,
          output: `**Code Analysis Results**\n\nCommand: ${params.command}\nOperation: ${params.operation_type || 'explain'}\nModel: ${params.model || 'claude-3.5-sonnet'}\n\n**Analysis:**\nThe code appears to be implementing a ${params.operation_type || 'explain'} operation. Here's what it does:\n\n1. **Purpose**: The code is designed to ${params.command.toLowerCase()}\n2. **Key Components**: \n   - Main logic handles the core functionality\n   - Error handling ensures robustness\n   - Performance optimizations are in place\n\n**Recommendations:**\n- Consider adding more detailed comments\n- Implement additional error handling for edge cases\n- Add unit tests for better coverage`,
          suggestions: [
            'Consider implementing the suggested improvements',
            'Run tests to verify functionality',
            'Review the generated code for your specific use case'
          ]
        };

      case 'comet_chrome':
        return {
          ...baseResult,
          output: `**Comet Analysis Results**\n\nAction: ${params.action}\nURL: ${params.url || 'Content provided'}\n\n**Analysis:**\n${getCometAnalysisOutput(params.action, params.url)}\n\n**Features Used:**\n- AI-powered content analysis\n- Real-time web browsing assistance\n- Multi-language support`,
          comet_features: [
            'AI-powered content analysis',
            'Real-time web browsing assistance',
            'Multi-language support',
            'Advanced text processing'
          ]
        };

      case 'web_scraper':
        return {
          ...baseResult,
          output: `**Web Scraping Results**\n\nURL: ${params.url}\nSelector: ${params.selector || 'All content'}\n\n**Extracted Content:**\nSample extracted content from the webpage. This includes the main text content, headings, and key information that was successfully extracted.\n\n**Statistics:**\n- Word Count: ${Math.floor(Math.random() * 2000) + 500}\n- Character Count: ${Math.floor(Math.random() * 10000) + 2000}\n- Links Found: ${Math.floor(Math.random() * 50) + 10}\n- Images Found: ${Math.floor(Math.random() * 20) + 5}`,
          content_length: Math.floor(Math.random() * 5000) + 1000
        };

      case 'data_analyzer':
        return {
          ...baseResult,
          output: `**Data Analysis Results**\n\nAnalysis Type: ${params.analysis_type}\nData Points: ${params.data?.length || 0}\n\n**Results:**\n- Count: ${params.data?.length || 0}\n- Mean: ${(Math.random() * 100).toFixed(2)}\n- Median: ${(Math.random() * 100).toFixed(2)}\n- Standard Deviation: ${(Math.random() * 20).toFixed(2)}\n- Min: ${(Math.random() * 50).toFixed(2)}\n- Max: ${(Math.random() * 100 + 50).toFixed(2)}`,
          analysis_type: params.analysis_type
        };

      case 'text_processor':
        return {
          ...baseResult,
          output: `**Text Processing Results**\n\nOperation: ${params.operation}\nText Length: ${params.text?.length || 0} characters\n\n**Results:**\n${getTextProcessingOutput(params.operation, params.text)}`,
          operation: params.operation
        };

      case 'ai_generation_tool':
        return {
          ...baseResult,
          output: `**AI Generation Results**\n\nPrompt: ${params.prompt}\nModel: ${params.model || 'gpt-4'}\nMax Tokens: ${params.max_tokens || 1000}\n\n**Generated Content:**\nThis is AI-generated content based on your prompt. The content has been created using advanced language models and includes relevant information, examples, and insights related to your request.\n\n**Features:**\n- Creative content generation\n- Context-aware responses\n- Multiple output formats\n- Quality optimization`,
          tokens_used: Math.floor(Math.random() * 500) + 200
        };

      default:
        return {
          ...baseResult,
          output: `**Tool Execution Results**\n\nTool: ${toolId}\nParameters: ${JSON.stringify(params, null, 2)}\n\n**Result:**\nTool executed successfully with the provided parameters.`,
          message: 'Tool executed successfully'
        };
    }
  };

  const getCometAnalysisOutput = (action: string, url?: string) => {
    switch (action) {
      case 'analyze_page':
        return `**Page Analysis:**\n- Title: Sample Web Page\n- Content Quality: 85/100\n- SEO Score: 78/100\n- Accessibility: 82/100\n- Performance: 75/100`;
      case 'summarize_article':
        return `**Article Summary:**\nThis article discusses modern web development practices and AI integration. Key points include performance optimization, user experience enhancement, and implementation strategies.`;
      case 'analyze_sentiment':
        return `**Sentiment Analysis:**\n- Overall Sentiment: Positive\n- Sentiment Score: 0.75\n- Confidence: 87%\n- Emotional Tone: Optimistic and informative`;
      default:
        return `**Analysis Complete:**\nSuccessfully performed ${action} on ${url || 'provided content'}.`;
    }
  };

  const getTextProcessingOutput = (operation: string, text?: string) => {
    switch (operation) {
      case 'summarize':
        return `**Summary:**\nGenerated summary of the provided text, highlighting key points and main ideas.`;
      case 'extract_keywords':
        return `**Keywords:**\n- AI (15 occurrences)\n- Web Development (12 occurrences)\n- Performance (8 occurrences)\n- User Experience (6 occurrences)`;
      case 'sentiment':
        return `**Sentiment Analysis:**\n- Sentiment: Positive\n- Score: 0.65\n- Confidence: 82%`;
      default:
        return `**Processed Text:**\nSuccessfully processed text using ${operation} operation.`;
    }
  };

  const categories = [...new Set(mcpTools.map(tool => tool.category))];

  return (
    <div className="flex h-screen overflow-hidden bg-background carbon-texture">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h1 className="text-3xl font-bold neon-text">MCP Tools</h1>
          <p className="text-muted-foreground mt-2">
            Test and interact with all available Model Context Protocol tools
          </p>
        </div>

        <div className="flex-1 overflow-auto cyber-scrollbar">
          <div className="p-6 max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="test">Test Tools</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(category => (
                    <Card key={category} className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary" />
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mcpTools
                            .filter(tool => tool.category === category)
                            .map(tool => (
                              <div
                                key={tool.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                                onClick={() => handleToolSelect(tool)}
                              >
                                <div className="flex items-center gap-3">
                                  {tool.icon}
                                  <div>
                                    <p className="font-medium">{tool.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {tool.description.substring(0, 50)}...
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      MCP Tools Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-primary/10">
                        <div className="text-2xl font-bold text-primary">{mcpTools.length}</div>
                        <div className="text-sm text-muted-foreground">Total Tools</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-accent/10">
                        <div className="text-2xl font-bold text-accent">{categories.length}</div>
                        <div className="text-sm text-muted-foreground">Categories</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-500/10">
                        <div className="text-2xl font-bold text-green-500">100%</div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test" className="space-y-6">
                {selectedTool ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {selectedTool.icon}
                          {selectedTool.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {selectedTool.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedTool.parameters.map(param => (
                          <div key={param.name} className="space-y-2">
                            <label className="text-sm font-medium">
                              {param.name}
                              {param.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {param.type === 'string' && param.options ? (
                              <Select
                                value={testParams[param.name] || ''}
                                onValueChange={(value) => 
                                  setTestParams(prev => ({ ...prev, [param.name]: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${param.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {param.options.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : param.type === 'boolean' ? (
                              <Select
                                value={testParams[param.name]?.toString() || ''}
                                onValueChange={(value) => 
                                  setTestParams(prev => ({ ...prev, [param.name]: value === 'true' }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${param.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">True</SelectItem>
                                  <SelectItem value="false">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : param.type === 'number' ? (
                              <Input
                                type="number"
                                placeholder={`Enter ${param.name}`}
                                value={testParams[param.name] || ''}
                                onChange={(e) => 
                                  setTestParams(prev => ({ ...prev, [param.name]: Number(e.target.value) }))
                                }
                              />
                            ) : param.name === 'data' ? (
                              <Textarea
                                placeholder="Enter data as JSON array, e.g., [1, 2, 3, 4, 5]"
                                value={testParams[param.name] || ''}
                                onChange={(e) => {
                                  try {
                                    const data = JSON.parse(e.target.value);
                                    setTestParams(prev => ({ ...prev, [param.name]: data }));
                                  } catch {
                                    setTestParams(prev => ({ ...prev, [param.name]: e.target.value }));
                                  }
                                }}
                              />
                            ) : (
                              <Input
                                placeholder={`Enter ${param.name}`}
                                value={testParams[param.name] || ''}
                                onChange={(e) => 
                                  setTestParams(prev => ({ ...prev, [param.name]: e.target.value }))
                                }
                              />
                            )}
                            <p className="text-xs text-muted-foreground">
                              {param.description}
                            </p>
                          </div>
                        ))}

                        <Button 
                          onClick={handleTestRun} 
                          disabled={isLoading}
                          className="w-full gradient-cyber-primary hover:gradient-cyber-secondary"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Test Tool
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {testResults?.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : testResults ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Info className="w-5 h-5 text-muted-foreground" />
                          )}
                          Test Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {testResults ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge variant={testResults.success ? "default" : "destructive"}>
                                {testResults.success ? "Success" : "Error"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {testResults.execution_time_ms}ms
                              </span>
                            </div>
                            
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <pre className="text-sm whitespace-pre-wrap">
                                {testResults.output || testResults.error}
                              </pre>
                            </div>

                            {testResults.suggestions && (
                              <div>
                                <h4 className="font-medium mb-2">Suggestions:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {testResults.suggestions.map((suggestion: string, index: number) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Run a test to see results here</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="glass-card">
                    <CardContent className="text-center py-12">
                      <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Select a Tool to Test</h3>
                      <p className="text-muted-foreground mb-4">
                        Choose a tool from the overview to start testing its functionality
                      </p>
                      <Button onClick={() => setActiveTab('overview')}>
                        Browse Tools
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Examples */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Quick Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mcpTools.map(tool => (
                        <div key={tool.id} className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            {tool.icon}
                            {tool.name}
                          </h4>
                          <div className="space-y-1">
                            {tool.examples.slice(0, 2).map((example, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left h-auto p-2"
                                onClick={() => {
                                  setSelectedTool(tool);
                                  setTestParams(example.params);
                                  setTestResults(null);
                                }}
                              >
                                <div>
                                  <div className="font-medium">{example.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {example.description}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>MCP Tools Documentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">What are MCP Tools?</h3>
                      <p className="text-muted-foreground">
                        Model Context Protocol (MCP) tools are AI-powered utilities that can be integrated 
                        into your applications to provide advanced functionality. These tools leverage various 
                        AI models and APIs to perform complex tasks like code analysis, web scraping, data 
                        processing, and content generation.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Available Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mcpTools.map(tool => (
                          <div key={tool.id} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {tool.icon}
                              <h4 className="font-medium">{tool.name}</h4>
                              <Badge variant="outline">{tool.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {tool.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <strong>Parameters:</strong> {tool.parameters.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        All MCP tools are currently running in simulation mode. In production, 
                        these tools would connect to real APIs and services to provide actual functionality.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
