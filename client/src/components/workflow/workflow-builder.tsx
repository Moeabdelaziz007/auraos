import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { WorkflowNode } from "@shared/schema";

interface WorkflowBuilderProps {
  nodes: WorkflowNode[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onSave: () => void;
  onRun: () => void;
  isSaving: boolean;
  isRunning: boolean;
}

// Helper to get presentation properties from a node
const getNodeAppearance = (node: WorkflowNode) => {
  switch (node.type) {
    case 'trigger':
      return {
        color: 'bg-green-500',
        icon: 'fas fa-play-circle',
        title: node.data.title || 'Trigger',
        subtitle: node.data.subtitle || 'New Mention'
      };
    case 'ai':
      return {
        color: 'bg-primary',
        icon: 'fas fa-robot',
        title: node.data.title || 'AI Analysis',
        subtitle: node.data.subtitle || 'Sentiment Check'
      };
    case 'action':
      return {
        color: 'bg-accent',
        icon: 'fas fa-reply',
        title: node.data.title || 'Auto Reply',
        subtitle: node.data.subtitle || 'Generate Response'
      };
    case 'telegram-message-trigger':
      return {
        color: 'bg-blue-500',
        icon: 'fab fa-telegram-plane',
        title: 'Telegram Trigger',
        subtitle: 'On New Message'
      };
    case 'telegram-send-message-action':
        return {
          color: 'bg-blue-600',
          icon: 'fas fa-paper-plane',
          title: 'Telegram Action',
          subtitle: 'Send Message'
        };
    default:
      return {
        color: 'bg-gray-500',
        icon: 'fas fa-question-circle',
        title: 'Unknown Node',
        subtitle: 'Configure me'
      };
  }
};


export default function WorkflowBuilder({
  nodes,
  onNodesChange,
  onSave,
  onRun,
  isSaving,
  isRunning
}: WorkflowBuilderProps) {
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
    
    onNodesChange(nodes.map(node =>
      node.id === draggedNode 
        ? { ...node, position: { x: Math.max(0, Math.min(x, 700)), y: Math.max(0, Math.min(y, 350)) } }
        : node
    ));
  }, [draggedNode, dragOffset, nodes, onNodesChange]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 200, y: 200 },
      data: {
        title: type === 'trigger' ? 'New Trigger' : type === 'ai' ? 'AI Process' : 'New Action',
        subtitle: 'Configure me',
      }
    };
    
    onNodesChange([...nodes, newNode]);
  };

  const handleNodeDataChange = (nodeId: string, newData: any) => {
    onNodesChange(
      nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  };

  const renderNodeProperties = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const otherNodes = nodes.filter(n => n.id !== nodeId);

    const commonProperties = (
      <div className="space-y-2 mt-4 pt-4 border-t">
        <Label>Next Node</Label>
        <Select
          value={node.data.next || ''}
          onValueChange={(value) => handleNodeDataChange(nodeId, { next: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select next node..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {otherNodes.map(n => (
              <SelectItem key={n.id} value={n.id}>{n.data.title || n.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    switch (node.type) {
      case 'telegram-send-message-action':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="message">Message Text</Label>
              <Textarea
                id="message"
                placeholder="Enter the message to send..."
                value={node.data.message || ''}
                onChange={(e) => handleNodeDataChange(nodeId, { message: e.target.value })}
                className="bg-background"
              />
            </div>
            {commonProperties}
          </>
        );
      default:
        return (
          <>
            <p className="text-sm text-muted-foreground">No specific properties for this node type.</p>
            {commonProperties}
          </>
        );
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workflow Builder</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" data-testid="button-save-workflow" onClick={onSave} disabled={isSaving}>
              <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" data-testid="button-run-workflow" onClick={onRun} disabled={isRunning}>
              <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'} mr-2`}></i>
              {isRunning ? 'Running...' : 'Run'}
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

            <h4 className="font-medium text-foreground mb-3 mt-4 pt-4 border-t">Telegram</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addNode('telegram-message-trigger')}
                data-testid="button-add-telegram-trigger"
              >
                <i className="fab fa-telegram-plane text-blue-500 mr-2"></i>
                TG Trigger
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addNode('telegram-send-message-action')}
                data-testid="button-add-telegram-action"
              >
                <i className="fas fa-paper-plane text-blue-600 mr-2"></i>
                TG Action
              </Button>
            </div>

            {selectedNode && (
              <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium mb-2">Node Properties</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Editing node: <span className="font-bold">{selectedNode}</span>
                </p>
                {renderNodeProperties(selectedNode)}
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
                {nodes.map((node) => {
                  const nextNodeId = node.data.next;
                  if (!nextNodeId) return null;
                  const nextNode = nodes.find(n => n.id === nextNodeId);
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
              {nodes.map((node) => {
                const appearance = getNodeAppearance(node);
                return (
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
                    <div className={`${appearance.color} text-white px-4 py-3 rounded-lg shadow-lg min-w-[160px]`}>
                      <div className="flex items-center gap-2">
                        <i className={appearance.icon}></i>
                        <div>
                          <div className="text-sm font-medium">{appearance.title}</div>
                          <div className="text-xs opacity-80">{appearance.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

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
