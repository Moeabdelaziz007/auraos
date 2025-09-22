import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TaskCard from './TaskCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Checkbox } from '@/components/ui/checkbox';
import TaskQueueAnalytics from './TaskQueueAnalytics';
import TaskHistory from './TaskHistory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AgentTask {
  id: string;
  name: string;
  description: string;
  type: 'automation' | 'workflow' | 'ai' | 'mcp' | 'telegram' | 'system';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
}

const TaskQueue = () => {
  const queryClient = useQueryClient();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: tasks = [], isLoading, error } = useQuery<AgentTask[]>({
    queryKey: ['/api/tasks'],
  });

  const [clientTasks, setClientTasks] = useState<AgentTask[]>([]);

  useEffect(() => {
    setClientTasks(tasks);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return clientTasks
      .filter(task => statusFilter === 'all' || task.status === statusFilter)
      .filter(task => priorityFilter === 'all' || task.priority === priorityFilter)
      .filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [clientTasks, statusFilter, priorityFilter, searchTerm]);

  const taskActionMutation = useMutation({
    mutationFn: async ({ taskId, action, status }: { taskId: string, action: string, status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'paused' }) => {
      let url = '';
      let body: any = {};
      let method = 'POST';

      if (['pause', 'resume', 'cancel'].includes(action)) {
        url = `/api/tasks/${taskId}/status`;
        body = { status };
        method = 'PUT';
      } else if (action === 'retry') {
        url = `/api/tasks/${taskId}/retry`;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Failed to perform action: ${action}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const handleTaskAction = (taskId: string, action: 'pause' | 'resume' | 'cancel' | 'retry') => {
    let status;
    if (action === 'pause') status = 'paused';
    if (action === 'resume') status = 'pending';
    if (action === 'cancel') status = 'cancelled';
    taskActionMutation.mutate({ taskId, action, status });
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'task_update') {
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        }
    };

    return () => {
        ws.close();
    };
  }, [queryClient]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(clientTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setClientTasks(items);
  };

  const handleSelectTask = (taskId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkAction = (action: 'pause' | 'cancel') => {
    selectedTasks.forEach(taskId => {
      let status;
      if (action === 'pause') status = 'paused';
      if (action === 'cancel') status = 'cancelled';
      taskActionMutation.mutate({ taskId, action, status });
    });
    setSelectedTasks([]);
  };

  return (
    <Card className="relative overflow-hidden col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="gradient-cyber-tertiary bg-clip-text text-transparent">Task Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">Active Queue</TabsTrigger>
            <TabsTrigger value="history">Execution History</TabsTrigger>
            <TabsTrigger value="analytics">Queue Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="queue" className="mt-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <Input placeholder="Search tasks..." className="max-w-xs cyber-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px] cyber-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                 <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[120px] cyber-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('pause')} disabled={selectedTasks.length === 0}>Pause Selected</Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction('cancel')} disabled={selectedTasks.length === 0}>Cancel Selected</Button>
              </div>
            </div>
            {isLoading && <p>Loading tasks...</p>}
            {error && <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 h-[400px] overflow-y-auto cyber-scrollbar pr-4">
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <TaskCard
                              task={task}
                              onAction={handleTaskAction}
                              isSelected={selectedTasks.includes(task.id)}
                              onSelect={handleSelectTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>
          <TabsContent value="history">
            <TaskHistory />
          </TabsContent>
          <TabsContent value="analytics">
            <TaskQueueAnalytics />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskQueue;
