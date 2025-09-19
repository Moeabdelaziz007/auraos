import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AgentTemplate } from "@shared/schema";

interface AgentTemplateCardProps {
  template: AgentTemplate;
  showActions?: boolean;
}

export default function AgentTemplateCard({ template, showActions = false }: AgentTemplateCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useTemplateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/agent-templates/${template.id}/use`);
      return apiRequest('POST', '/api/user-agents', {
        userId: 'user-1',
        templateId: template.id,
        name: template.name,
        config: template.config,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-templates'] });
      toast({
        title: "Agent created!",
        description: `${template.name} has been added to your agents.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getGradientFromCategory = (category: string) => {
    const gradients: Record<string, string> = {
      'Content': 'from-blue-500 to-purple-500',
      'Engagement': 'from-green-500 to-teal-500',
      'Analytics': 'from-orange-500 to-red-500',
      'default': 'from-gray-500 to-gray-600'
    };
    return gradients[category] || gradients.default;
  };

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer" 
      data-testid={`agent-template-${template.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${getGradientFromCategory(template.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <i className={`${template.icon} text-white text-sm`}></i>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground" data-testid={`text-name-${template.id}`}>
              {template.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${template.id}`}>
              {template.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {template.isPopular && (
                <Badge variant="default" className="bg-primary/10 text-primary" data-testid={`badge-popular-${template.id}`}>
                  Popular
                </Badge>
              )}
              <Badge variant="outline" data-testid={`badge-category-${template.id}`}>
                {template.category}
              </Badge>
              <span className="text-xs text-muted-foreground" data-testid={`text-usage-${template.id}`}>
                Used {template.usageCount.toLocaleString()} times
              </span>
            </div>
            {showActions && (
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={() => useTemplateMutation.mutate()}
                  disabled={useTemplateMutation.isPending}
                  data-testid={`button-use-${template.id}`}
                >
                  <i className={`fas ${useTemplateMutation.isPending ? 'fa-spinner fa-spin' : 'fa-plus'} mr-1`}></i>
                  {useTemplateMutation.isPending ? 'Creating...' : 'Use Template'}
                </Button>
                <Button size="sm" variant="outline" data-testid={`button-preview-${template.id}`}>
                  <i className="fas fa-eye mr-1"></i>
                  Preview
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
