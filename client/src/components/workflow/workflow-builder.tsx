import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  title: string;
  subtitle: string;
  position: { x: number; y: number };
  color: string;
  icon: string;
}

const defaultNodes: WorkflowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    title: 'Trigger',
    subtitle: 'New Mention',
    position: { x: 100, y: 150 },
    color: 'bg-green-500',
    icon: 'fas fa-play-circle'
  },
  {
    id: 'ai-1',
    type: 'ai',
    title: 'AI Analysis',
    subtitle: 'Sentiment Check',
    position: { x: 350, y: 150 },
    color: 'bg-primary',
    icon: 'fas fa-robot'
  },
  {
    id: 'action-1',
    type: 'action',
    title: 'Auto Reply',
    subtitle: 'Generate Response',
    position: { x: 600, y: 150 },
    color: 'bg-accent',
    icon: 'fas fa-reply'
  }
];

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedNode(nodeId);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedNode(nodeId);
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode) return;
    
    const canvas = e.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    setNodes(prev => prev.map(node => 
      node.id === draggedNode 
        ? { ...node, position: { x: Math.max(0, Math.min(x, 700)), y: Math.max(0, Math.min(y, 350)) } }
        : node
    ));
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === 'trigger' ? 'New Trigger' : type === 'ai' ? 'AI Process' : 'New Action',
      subtitle: 'Configure me',
      position: { x: 200, y: 200 },
      color: type === 'trigger' ? 'bg-green-500' : type === 'ai' ? 'bg-primary' : 'bg-accent',
      icon: type === 'trigger' ? 'fas fa-play' : type === 'ai' ? 'fas fa-brain' : 'fas fa-cog'
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workflow Builder</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" data-testid="button-save-workflow">
              <i className="fas fa-save mr-2"></i>
              Save
            </Button>
            <Button size="sm" data-testid="button-run-workflow">
              <i className="fas fa-play mr-2"></i>
              Run
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 h-full">
          {/* Toolbox */}
          <div className="w-48 space-y-3">
            <h4 className="font-medium text-foreground mb-3">Components</h4>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => addNode('trigger')}
                data-testid="button-add-trigger"
              >
                <i className="fas fa-play-circle text-green-500 mr-2"></i>
                Trigger
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => addNode('ai')}
                data-testid="button-add-ai"
              >
                <i className="fas fa-robot text-primary mr-2"></i>
                AI Process
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => addNode('action')}
                data-testid="button-add-action"
              >
                <i className="fas fa-cog text-accent mr-2"></i>
                Action
              </Button>
            </div>

            {selectedNode && (
              <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium mb-2">Node Properties</h5>
                <p className="text-sm text-muted-foreground">
                  Configure the selected node's settings here.
                </p>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <div 
              className="w-full h-full bg-muted/20 rounded-lg relative overflow-hidden cursor-crosshair border-2 border-dashed border-muted-foreground/20"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              data-testid="workflow-canvas"
            >
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {nodes.map((node, index) => {
                  const nextNode = nodes[index + 1];
                  if (!nextNode) return null;
                  
                  return (
                    <line
                      key={`line-${node.id}-${nextNode.id}`}
                      x1={node.position.x + 80}
                      y1={node.position.y + 25}
                      x2={nextNode.position.x}
                      y2={nextNode.position.y + 25}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.5"
                    />
                  );
                })}
              </svg>

              {/* Workflow Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute cursor-move select-none transition-all duration-200 hover:scale-105 ${
                    selectedNode === node.id ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    transform: draggedNode === node.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  data-testid={`workflow-node-${node.id}`}
                >
                  <div className={`${node.color} text-white px-4 py-3 rounded-lg shadow-lg min-w-[160px]`}>
                    <div className="flex items-center gap-2">
                      <i className={node.icon}></i>
                      <div>
                        <div className="text-sm font-medium">{node.title}</div>
                        <div className="text-xs opacity-80">{node.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Grid pattern */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            </div>

            {/* Canvas Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-sm bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <span className="text-muted-foreground" data-testid="text-node-count">
                  {nodes.length} nodes
                </span>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" data-testid="badge-status">
                    <i className="fas fa-circle text-green-500 mr-1"></i>
                    Ready to run
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
