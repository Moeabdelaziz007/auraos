import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgentTask {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'failed' | 'cancelled';
  priority: string;
  createdAt: Date;
  completedAt?: Date;
}

const statusColors = {
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const TaskHistory = () => {
  const { data: tasks = [], isLoading, error } = useQuery<AgentTask[]>({
    queryKey: ['/api/tasks'],
  });

  const historicalTasks = tasks.filter(task => ['completed', 'failed', 'cancelled'].includes(task.status));

  if (isLoading) return <p>Loading history...</p>;
  if (error) return <p>Error loading history: {error.message}</p>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historicalTasks.map(task => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>{task.type}</TableCell>
              <TableCell>
                <Badge className={`${statusColors[task.status]}`}>{task.status}</Badge>
              </TableCell>
              <TableCell>{task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>
                {task.status === 'failed' && <Button size="sm" variant="outline">Retry</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Pagination will be added later */}
    </div>
  );
};

export default TaskHistory;
