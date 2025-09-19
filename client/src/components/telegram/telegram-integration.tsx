import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface TelegramBotStatus {
  connected: boolean;
  botInfo: {
    id: number;
    username: string;
    firstName: string;
    canJoinGroups: boolean;
    canReadAllGroupMessages: boolean;
  };
}

interface TelegramMessage {
  chatId: string;
  message: string;
  options?: any;
}

export default function TelegramIntegration() {
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [chatIds, setChatIds] = useState('');
  const queryClient = useQueryClient();

  // Fetch Telegram bot status
  const { data: botStatus, isLoading: statusLoading, error: statusError } = useQuery<TelegramBotStatus>({
    queryKey: ['/api/telegram/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Send message mutation
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
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/status'] });
    },
  });

  // Broadcast message mutation
  const broadcastMutation = useMutation({
    mutationFn: async (data: { message: string; chatIds: string[] }) => {
      const response = await fetch('/api/telegram/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to broadcast message');
      return response.json();
    },
    onSuccess: () => {
      setBroadcastMessage('');
      setChatIds('');
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/status'] });
    },
  });

  const handleSendMessage = () => {
    if (!message || !chatId) return;
    sendMessageMutation.mutate({ chatId, message });
  };

  const handleBroadcast = () => {
    if (!broadcastMessage || !chatIds) return;
    const chatIdArray = chatIds.split(',').map(id => id.trim()).filter(id => id);
    if (chatIdArray.length === 0) return;
    broadcastMutation.mutate({ message: broadcastMessage, chatIds: chatIdArray });
  };

  return (
    <div className="space-y-6">
      {/* Bot Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fab fa-telegram text-blue-500"></i>
            Telegram Bot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : statusError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load Telegram bot status. Please check your configuration.
              </AlertDescription>
            </Alert>
          ) : botStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={botStatus.connected ? "default" : "secondary"}>
                    {botStatus.connected ? "🟢 Connected" : "🔴 Disconnected"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    @{botStatus.botInfo.username}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Bot ID:</span> {botStatus.botInfo.id}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {botStatus.botInfo.firstName}
                </div>
                <div>
                  <span className="font-medium">Can Join Groups:</span> 
                  {botStatus.botInfo.canJoinGroups ? " ✅" : " ❌"}
                </div>
                <div>
                  <span className="font-medium">Read Group Messages:</span> 
                  {botStatus.botInfo.canReadAllGroupMessages ? " ✅" : " ❌"}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Send Message */}
      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Chat ID</label>
              <Input
                placeholder="Enter chat ID (e.g., 123456789)"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message || !chatId || sendMessageMutation.isPending}
            className="w-full"
          >
            {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
          
          {sendMessageMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to send message: {sendMessageMutation.error?.message}
              </AlertDescription>
            </Alert>
          )}
          
          {sendMessageMutation.isSuccess && (
            <Alert>
              <AlertDescription>
                ✅ Message sent successfully! Message ID: {sendMessageMutation.data?.messageId}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Broadcast Message */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Chat IDs (comma-separated)</label>
            <Input
              placeholder="123456789, 987654321, 555666777"
              value={chatIds}
              onChange={(e) => setChatIds(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter multiple chat IDs separated by commas
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Broadcast Message</label>
            <Textarea
              placeholder="Enter your broadcast message..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleBroadcast}
            disabled={!broadcastMessage || !chatIds || broadcastMutation.isPending}
            className="w-full"
            variant="outline"
          >
            {broadcastMutation.isPending ? "Broadcasting..." : "Broadcast Message"}
          </Button>
          
          {broadcastMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to broadcast message: {broadcastMutation.error?.message}
              </AlertDescription>
            </Alert>
          )}
          
          {broadcastMutation.isSuccess && (
            <Alert>
              <AlertDescription>
                ✅ Broadcast completed! Check results: {broadcastMutation.data?.results?.length} messages processed
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setChatId('123456789');
                setMessage('/start');
              }}
            >
              <i className="fas fa-play mr-2"></i>
              Send /start Command
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setChatId('123456789');
                setMessage('/help');
              }}
            >
              <i className="fas fa-question-circle mr-2"></i>
              Send /help Command
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setChatId('123456789');
                setMessage('/status');
              }}
            >
              <i className="fas fa-chart-bar mr-2"></i>
              Send /status Command
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setChatId('123456789');
                setMessage('/posts');
              }}
            >
              <i className="fas fa-list mr-2"></i>
              Send /posts Command
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
