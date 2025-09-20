import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plug, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { availablePlugins, Plugin } from "./data";

interface PluginConfig {
  id: string;
  pluginId: string;
  name: string;
  settings: { [key: string]: any };
  enabled: boolean;
}

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
    setPlugins(prev => 
      prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: plugin.status === 'active' ? 'inactive' : 'active' }
          : plugin
      )
    );
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
          {/* Overview content can be added here */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">High-level statistics about your plugins.</p>
            </CardContent>
          </Card>
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
          {/* Dependencies content can be added here */}
           <Card className="glass-card">
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage and view plugin dependencies.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}