import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Settings, Plug, Zap, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  dependencies: string[];
  icon: React.ReactNode;
}

interface PluginConfig {
  id: string;
  pluginId: string;
  name: string;
  settings: { [key: string]: any };
  enabled: boolean;
}

const availablePlugins: Plugin[] = [
  {
    id: 'cursor_cli',
    name: 'Cursor CLI',
    description: 'AI-powered code analysis and generation',
    category: 'Development',
    version: '1.2.0',
    status: 'active',
    capabilities: ['Code Analysis', 'Refactoring', 'Debugging', 'Code Generation', 'Testing'],
    dependencies: ['node', 'typescript'],
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'comet_chrome',
    name: 'Comet Chrome',
    description: 'Web browsing and content analysis',
    category: 'Web',
    version: '2.1.0',
    status: 'active',
    capabilities: ['Page Analysis', 'Content Extraction', 'Translation', 'Sentiment Analysis'],
    dependencies: ['chrome-extension'],
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'web_scraper',
    name: 'Web Scraper',
    description: 'Extract content from web pages',
    category: 'Web',
    version: '1.0.5',
    status: 'active',
    capabilities: ['Content Scraping', 'Data Extraction', 'Link Analysis'],
    dependencies: ['puppeteer'],
    icon: <Plug className="w-4 h-4" />
  },
  {
    id: 'data_analyzer',
    name: 'Data Analyzer',
    description: 'Statistical analysis and insights',
    category: 'Analytics',
    version: '1.5.2',
    status: 'active',
    capabilities: ['Statistical Analysis', 'Trend Detection', 'Outlier Detection'],
    dependencies: ['numpy', 'pandas'],
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'text_processor',
    name: 'Text Processor',
    description: 'NLP operations and text analysis',
    category: 'Text',
    version: '1.3.1',
    status: 'active',
    capabilities: ['Text Summarization', 'Sentiment Analysis', 'Keyword Extraction'],
    dependencies: ['nltk', 'spacy'],
    icon: <Plug className="w-4 h-4" />
  },
  {
    id: 'ai_generation_tool',
    name: 'AI Generator',
    description: 'Content and code generation',
    category: 'AI',
    version: '2.0.0',
    status: 'active',
    capabilities: ['Content Generation', 'Code Generation', 'Creative Writing'],
    dependencies: ['openai', 'anthropic'],
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'file_operations',
    name: 'File Operations',
    description: 'File system interactions',
    category: 'System',
    version: '1.1.0',
    status: 'active',
    capabilities: ['File Reading', 'File Writing', 'Directory Operations'],
    dependencies: ['fs-extra'],
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'image_processor',
    name: 'Image Processor',
    description: 'Image analysis and manipulation',
    category: 'Media',
    version: '1.4.0',
    status: 'inactive',
    capabilities: ['Image Analysis', 'Resizing', 'Format Conversion'],
    dependencies: ['sharp', 'opencv'],
    icon: <Plug className="w-4 h-4" />
  },
  {
    id: 'database_operations',
    name: 'Database Operations',
    description: 'Database management',
    category: 'Data',
    version: '1.2.3',
    status: 'active',
    capabilities: ['Query Execution', 'Data Insertion', 'Schema Management'],
    dependencies: ['prisma', 'drizzle'],
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'api_tester',
    name: 'API Tester',
    description: 'HTTP request testing',
    category: 'Development',
    version: '1.0.8',
    status: 'active',
    capabilities: ['API Testing', 'Request Validation', 'Performance Testing'],
    dependencies: ['axios', 'supertest'],
    icon: <Plug className="w-4 h-4" />
  },
  {
    id: 'code_generator',
    name: 'Code Generator',
    description: 'Template-based code generation',
    category: 'Development',
    version: '1.6.0',
    status: 'active',
    capabilities: ['Template Generation', 'Boilerplate Code', 'Component Creation'],
    dependencies: ['handlebars', 'mustache'],
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'data_visualizer',
    name: 'Data Visualizer',
    description: 'Chart and graph creation',
    category: 'Analytics',
    version: '1.3.5',
    status: 'active',
    capabilities: ['Chart Creation', 'Data Visualization', 'Interactive Graphs'],
    dependencies: ['d3', 'chart.js'],
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Task automation and scheduling',
    category: 'System',
    version: '2.1.2',
    status: 'active',
    capabilities: ['Workflow Automation', 'Task Scheduling', 'Process Orchestration'],
    dependencies: ['node-cron', 'bull'],
    icon: <Plug className="w-4 h-4" />
  },
  {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    description: 'Information retrieval',
    category: 'AI',
    version: '1.4.1',
    status: 'active',
    capabilities: ['Information Retrieval', 'Knowledge Search', 'Document Analysis'],
    dependencies: ['elasticsearch', 'vector-db'],
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'system_info',
    name: 'System Info',
    description: 'System information gathering',
    category: 'System',
    version: '1.0.3',
    status: 'active',
    capabilities: ['System Monitoring', 'Resource Usage', 'Performance Metrics'],
    dependencies: ['systeminformation'],
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'code_formatter',
    name: 'Code Formatter',
    description: 'Code formatting and styling',
    category: 'Development',
    version: '1.2.1',
    status: 'active',
    capabilities: ['Code Formatting', 'Style Enforcement', 'Linting'],
    dependencies: ['prettier', 'eslint'],
    icon: <Plug className="w-4 h-4" />
  }
];

export default function PluginManagerApp() {
  const [plugins, setPlugins] = useState<Plugin[]>(availablePlugins);
  const [configs, setConfigs] = useState<PluginConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState('overview');

  const categories = ['all', ...Array.from(new Set(plugins.map(p => p.category)))];

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTogglePlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId 
        ? { ...plugin, status: plugin.status === 'active' ? 'inactive' : 'active' }
        : plugin
    ));
  };

  const handleUpdatePlugin = (pluginId: string, updates: Partial<Plugin>) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId ? { ...plugin, ...updates } : plugin
    ));
  };

  const handleCreateConfig = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    const newConfig: PluginConfig = {
      id: `config-${Date.now()}`,
      pluginId,
      name: `${plugin.name} Configuration`,
      settings: {},
      enabled: true
    };

    setConfigs(prev => [...prev, newConfig]);
  };

  const handleDeleteConfig = (configId: string) => {
    setConfigs(prev => prev.filter(config => config.id !== configId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text">Plugin Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage MCP plugins and their configurations for AI agents
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {plugins.filter(p => p.status === 'active').length} Active • {plugins.length} Total
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {plugins.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Plugins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {plugins.filter(p => p.status === 'inactive').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Inactive Plugins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {categories.length - 1}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Plug className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-purple-500">
                      {configs.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Configurations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Plugin Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(1).map(category => {
                    const count = plugins.filter(p => p.category === category).length;
                    const activeCount = plugins.filter(p => p.category === category && p.status === 'active').length;
                    return (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{category}</div>
                          <div className="text-sm text-muted-foreground">
                            {activeCount}/{count} active
                          </div>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Cursor CLI plugin activated</span>
                    <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Comet Chrome configuration updated</span>
                    <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-purple-500/10">
                    <Plug className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">New plugin configuration created</span>
                    <span className="text-xs text-muted-foreground ml-auto">10m ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plugins" className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search plugins..."
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map(plugin => (
              <Card key={plugin.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {plugin.icon}
                      {plugin.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(plugin.status)}
                      <Badge variant="outline" className="text-xs">
                        v{plugin.version}
                      </Badge>
                    </div>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plugin.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Capabilities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {plugin.capabilities.map(capability => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Dependencies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {plugin.dependencies.map(dep => (
                        <Badge key={dep} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={plugin.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => handleTogglePlugin(plugin.id)}
                      className="flex-1"
                    >
                      {plugin.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateConfig(plugin.id)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plugin Configurations</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Configuration
            </Button>
          </div>

          {configs.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Configurations</h3>
                <p className="text-muted-foreground">
                  Create plugin configurations to customize their behavior
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {configs.map(config => {
                const plugin = plugins.find(p => p.id === config.pluginId);
                return (
                  <Card key={config.id} className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {plugin?.icon}
                          {config.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={config.enabled ? 'default' : 'secondary'}>
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteConfig(config.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Plugin: {plugin?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Settings: {Object.keys(config.settings).length} configured
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Dependency Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    All plugin dependencies are automatically managed. Plugins will be disabled if their dependencies are not available.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {Array.from(new Set(plugins.flatMap(p => p.dependencies))).map(dep => {
                    const pluginsUsingDep = plugins.filter(p => p.dependencies.includes(dep));
                    const activePlugins = pluginsUsingDep.filter(p => p.status === 'active');
                    return (
                      <div key={dep} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{dep}</div>
                          <div className="text-sm text-muted-foreground">
                            Used by {activePlugins.length}/{pluginsUsingDep.length} active plugins
                          </div>
                        </div>
                        <Badge variant={activePlugins.length > 0 ? 'default' : 'secondary'}>
                          {activePlugins.length > 0 ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
