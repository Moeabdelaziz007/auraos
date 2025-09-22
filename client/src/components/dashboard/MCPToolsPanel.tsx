import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const operationTypes = ["explain", "refactor", "debug", "optimize", "generate", "review", "test"];
const models = ["claude-3.5-sonnet", "gpt-4", "claude-3-opus"];

interface MCPToolArguments {
  command: string;
  operation_type: string;
  model: string;
  file_path?: string;
  context?: string;
}

interface MCPMessage {
  id: string;
  type: 'request';
  method: 'tools/call';
  params: {
    name: 'cursor_cli';
    arguments: MCPToolArguments;
  };
  timestamp: string;
}

interface MCPResponse {
  id: string;
  type: 'response' | 'error';
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

const MCPToolsPanel = () => {
  const [command, setCommand] = useState('');
  const [operationType, setOperationType] = useState(operationTypes[0]);
  const [model, setModel] = useState(models[0]);
  const [filePath, setFilePath] = useState('');
  const [context, setContext] = useState('');

  const mcpMutation = useMutation<MCPResponse, Error, MCPToolArguments>({
    mutationFn: async (variables) => {
      const message: MCPMessage = {
        id: `mcp-req-${Date.now()}`,
        type: 'request',
        method: 'tools/call',
        params: {
          name: 'cursor_cli',
          arguments: variables,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/mcp/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }), // The endpoint expects a 'message' property
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestArgs: MCPToolArguments = {
      command,
      operation_type: operationType,
      model,
    };
    if (filePath) requestArgs.file_path = filePath;
    if (context) requestArgs.context = context;

    mcpMutation.mutate(requestArgs);
  };

  const output = mcpMutation.data?.result ? JSON.stringify(mcpMutation.data.result, null, 2) : null;
  const error = mcpMutation.isError ? mcpMutation.error.message : (mcpMutation.data?.error ? mcpMutation.data.error.message : null);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="gradient-cyber-primary bg-clip-text text-transparent">MCP Tools Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="command">Command</Label>
            <Textarea
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., explain this React component"
              className="cyber-input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operationType">Operation</Label>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger id="operationType" className="cyber-input">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" className="cyber-input">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filePath">File Path (optional)</Label>
            <Input
              id="filePath"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="e.g., src/components/UserCard.tsx"
              className="cyber-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context (optional)</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., This component handles user profile display"
              className="cyber-input"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full gradient-cyber-primary" disabled={mcpMutation.isPending}>
            {mcpMutation.isPending ? 'Running...' : 'Run'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {output && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold neon-text">Output</h3>
            <div className="p-4 bg-muted/30 rounded-lg prose prose-invert prose-sm max-w-none cyber-scrollbar">
              <pre>{output}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MCPToolsPanel;
