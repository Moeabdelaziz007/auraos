// Workflow Marketplace Dashboard
// Comprehensive marketplace for workflow templates and automation

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search,
  Filter,
  Star,
  Download,
  Clock,
  Users,
  Zap,
  Play,
  Eye,
  Heart,
  Share,
  TrendingUp,
  Sparkles,
  Grid,
  List,
  SortAsc,
  RefreshCw
} from 'lucide-react';
import { 
  useWorkflowMarketplace,
  useIntelligentWorkflowRecommendations,
  useWorkflowTemplate,
  useWorkflowExecution
} from '../../hooks/use-workflow-automation';
import { WorkflowFilters } from '../../lib/workflow-automation';

interface WorkflowMarketplaceProps {
  userId?: string;
}

export function WorkflowMarketplace({ userId }: WorkflowMarketplaceProps) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<WorkflowFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'recent'>('popularity');

  const { 
    marketplace, 
    loading: marketplaceLoading, 
    searchTemplates 
  } = useWorkflowMarketplace(filters);

  const { 
    recommendations, 
    loading: recommendationsLoading 
  } = useIntelligentWorkflowRecommendations(6);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchTemplates(searchQuery, filters);
    }
  };

  const handleFilterChange = (newFilters: Partial<WorkflowFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (marketplaceLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading marketplace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Workflow Marketplace
          </h2>
          <p className="text-muted-foreground">Discover and deploy powerful automation workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            My Workflows
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <MarketplaceTab 
            marketplace={marketplace}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSearch={handleSearch}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsTab 
            recommendations={recommendations}
            loading={recommendationsLoading}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <TrendingTab marketplace={marketplace} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MarketplaceTabProps {
  marketplace: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: WorkflowFilters;
  onFilterChange: (filters: Partial<WorkflowFilters>) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onSearch: () => void;
}

function MarketplaceTab({
  marketplace,
  searchQuery,
  setSearchQuery,
  filters,
  onFilterChange,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  onSearch
}: MarketplaceTabProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <Button onClick={onSearch} variant="outline">
          Search
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Button
          variant={!filters.category ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ category: undefined })}
        >
          All
        </Button>
        {marketplace?.categories?.map((category: any) => (
          <Button
            key={category.id}
            variant={filters.category === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ category: category.id })}
            className="flex items-center gap-2"
          >
            <span>{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {marketplace?.templates?.length || 0} workflows
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="recent">Most Recent</option>
          </select>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {(marketplace?.searchResults || marketplace?.templates || []).map((template: any) => (
          <WorkflowTemplateCard
            key={template.id}
            template={template}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}

interface WorkflowTemplateCardProps {
  template: any;
  viewMode: 'grid' | 'list';
}

function WorkflowTemplateCard({ template, viewMode }: WorkflowTemplateCardProps) {
  const { createWorkflow } = useWorkflowTemplate();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    try {
      setInstalling(true);
      await createWorkflow(template.id);
      // Show success message
    } catch (error) {
      console.error('Error installing workflow:', error);
    } finally {
      setInstalling(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="flex">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                {template.isFeatured && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-3">{template.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{template.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{template.downloads}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.estimatedTime}m</span>
                </div>
                <Badge variant="outline">
                  {template.difficulty}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleInstall} 
                disabled={installing}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {installing ? 'Installing...' : 'Install'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {template.isFeatured && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Featured
                </Badge>
              )}
            </div>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <div className="text-2xl">{template.icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{template.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{template.downloads}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{template.estimatedTime}m</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <Badge variant={
              template.difficulty === 'beginner' ? 'default' :
              template.difficulty === 'intermediate' ? 'secondary' : 'destructive'
            }>
              {template.difficulty}
            </Badge>
            <span className="text-sm text-muted-foreground">
              by {template.author.name}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Button 
              onClick={handleInstall} 
              disabled={installing}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {installing ? 'Installing...' : 'Install'}
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecommendationsTabProps {
  recommendations: any[];
  loading: boolean;
}

function RecommendationsTab({ recommendations, loading }: RecommendationsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Finding recommendations for you...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Recommended for You</h3>
        <p className="text-muted-foreground">
          Workflows tailored to your usage patterns and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((template) => (
          <WorkflowTemplateCard
            key={template.id}
            template={template}
            viewMode="grid"
          />
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground">
            Keep using the platform to get personalized workflow recommendations
          </p>
        </div>
      )}
    </div>
  );
}

interface TrendingTabProps {
  marketplace: any;
}

function TrendingTab({ marketplace }: TrendingTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Trending Workflows</h3>
        <p className="text-muted-foreground">
          Most popular and trending automation workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplace?.trending?.map((template: any) => (
          <WorkflowTemplateCard
            key={template.id}
            template={template}
            viewMode="grid"
          />
        ))}
      </div>
    </div>
  );
}

export default WorkflowMarketplace;
