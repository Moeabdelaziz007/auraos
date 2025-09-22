import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TelegramBotStatus {
  connected: boolean;
  botInfo: {
    id: number;
    username: string;
    firstName: string;
  };
}

interface TelegramMessage {
  chatId: string;
  message: string;
}

const TelegramBotPanel = () => {
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState('');
  const queryClient = useQueryClient();

  const { data: botStatus, isLoading: statusLoading, error: statusError } = useQuery<TelegramBotStatus>({
    queryKey: ['/api/telegram/status'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: TelegramMessage) => {
      const response = await fetch('/api/telegram/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setMessage('');
      setChatId('');
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/status'] });
    },
  });

  const handleSendMessage = () => {
    if (!message || !chatId) return;
    sendMessageMutation.mutate({ chatId, message });
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fab fa-telegram text-blue-500"></i>
          Telegram Bot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusLoading ? (
          <div className="animate-pulse h-6 bg-muted rounded w-3/4"></div>
        ) : statusError ? (
          <Badge variant="destructive">Error</Badge>
        ) : botStatus ? (
          <div className="flex items-center justify-between text-sm">
            <Badge variant={botStatus.connected ? "default" : "secondary"}>
              {botStatus.connected ? "🟢 Connected" : "🔴 Disconnected"}
            </Badge>
            <span className="text-muted-foreground">@{botStatus.botInfo.username}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <Input
            placeholder="Chat ID"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            className="cyber-input"
          />
          <Textarea
            placeholder="Send a quick message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="cyber-input"
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message || !chatId || sendMessageMutation.isPending}
          className="w-full"
          size="sm"
        >
          {sendMessageMutation.isPending ? "Sending..." : "Send"}
        </Button>
        {sendMessageMutation.isError && (
          <Alert variant="destructive" className="p-2 text-xs">
            <AlertDescription>
              {sendMessageMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}
        {sendMessageMutation.isSuccess && (
            <Alert className="p-2 text-xs">
              <AlertDescription>
                ✅ Message sent successfully!
              </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramBotPanel;
