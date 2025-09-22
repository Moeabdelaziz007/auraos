import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskItem {
  id: string;
  name: string;
  description: string;
  type: 'automation' | 'workflow' | 'ai' | 'mcp' | 'telegram' | 'system';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
}

interface TaskCardProps {
  task: TaskItem;
  isSelected: boolean;
  onSelect: (taskId: string, isSelected: boolean) => void;
  onAction: (taskId: string, action: 'pause' | 'resume' | 'cancel' | 'retry') => void;
}

const statusColors = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
  retrying: 'bg-purple-500',
};

const priorityColors = {
  low: 'border-gray-500',
  medium: 'border-blue-500',
  high: 'border-yellow-500',
  critical: 'border-red-500',
};

const TaskCard = ({ task, isSelected, onSelect, onAction }: TaskCardProps) => {
  return (
    <Card className={`border-l-4 ${priorityColors[task.priority]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(task.id, !!checked)} />
          <CardTitle className="text-base font-medium">{task.name}</CardTitle>
        </div>
        <Badge variant="outline">{task.type}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${statusColors[task.status]}`}>{task.status}</Badge>
          {task.status === 'running' && task.progress !== undefined && (
            <div className="w-1/2">
              <Progress value={task.progress} className="h-2" />
              <span className="text-xs text-muted-foreground">{task.progress}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end space-x-2">
          {task.status === 'running' && <Button size="sm" variant="outline" onClick={() => onAction(task.id, 'pause')}>Pause</Button>}
          {task.status === 'paused' && <Button size="sm" variant="outline" onClick={() => onAction(task.id, 'resume')}>Resume</Button>}
          {task.status === 'failed' && <Button size="sm" variant="outline" onClick={() => onAction(task.id, 'retry')}>Retry</Button>}
          {(task.status === 'pending' || task.status === 'running') && <Button size="sm" variant="destructive" onClick={() => onAction(task.id, 'cancel')}>Cancel</Button>}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
