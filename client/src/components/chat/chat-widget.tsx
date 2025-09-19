import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import { ErrorHandler } from "@/lib/error-handling";
import type { ChatMessage } from "@shared/schema";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; type: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isConnected } = useWebSocket('/ws', (data: any) => {
    if (data.type === 'chat_message') {
      setMessages(prev => [
        ...prev,
        { id: data.id, type: 'ai', content: data.content, timestamp: new Date(data.timestamp) }
      ]);
    }
  });

  const { data: chatHistory, isError: isHistoryError, error: historyError } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/history'],
    queryFn: () => fetch('/api/chat/history?userId=user-1&limit=10').then(res => {
      if (!res.ok) throw new Error('Failed to fetch chat history');
      return res.json();
    }),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isHistoryError) {
      ErrorHandler.getInstance().handleError(historyError, {
        logToConsole: true,
        reportToService: true,
        // Assuming the handler will show a non-intrusive toast for this type of error
      });
    }
  }, [isHistoryError, historyError]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message: userMessage,
        userId: 'user-1',
      });
      // apiRequest should throw on non-ok responses
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'ai', content: data.response, timestamp: new Date() }
      ]);
    },
    onError: (error) => {
      // Report to centralized handler, but don't show a global toast 
      // as we have a local error UI.
      ErrorHandler.getInstance().handleError(error, {
        logToConsole: true,
        reportToService: true,
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const userMessage = { id: Date.now().toString(), type: 'user' as const, content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && chatHistory) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai' as const,
        content: "Hi! I'm your AI assistant. How can I help you today?",
        timestamp: new Date()
      };
      const history = chatHistory.map(m => ({...m, type: m.role, timestamp: new Date(m.timestamp)}));
      setMessages([welcomeMessage, ...history]);
    } else if (isOpen && messages.length === 0) {
        setMessages([{
            id: 'welcome',
            type: 'ai',
            content: "Hi! I'm your AI assistant. I can help you create content, set up automations, or analyze your social media performance. What would you like to do?",
            timestamp: new Date()
        }]);
    }
  }, [isOpen, chatHistory]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-toggle-chat"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-lg group-hover:scale-110 transition-transform`}></i>
        </Button>
        
        {isOpen && (
          <Card className="absolute bottom-16 right-0 w-80 shadow-xl glass-card neon-glow-md" data-testid="chat-widget">
            <CardHeader className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src="" alt="AI Assistant" />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                            <i className="fas fa-robot text-sm"></i>
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h4 className="font-medium text-foreground">AI Assistant</h4>
                        <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                            {isConnected ? 'Online' : 'Offline'}
                        </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} data-testid="button-close-chat">
                        <i className="fas fa-times"></i>
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-60 p-4 cyber-scrollbar">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'ai' && (
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <i className="fas fa-robot text-xs"></i>
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.type === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted text-foreground'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-6 h-6 flex-shrink-0"><AvatarFallback className="bg-primary text-primary-foreground"><i className="fas fa-robot text-xs"></i></AvatarFallback></Avatar>
                      <div className="bg-muted text-foreground p-3 rounded-lg text-sm"><LoadingSpinner size="sm" variant="cyber" text="AI is thinking..." /></div>
                    </div>
                  )}
                  {chatMutation.isError && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-6 h-6 flex-shrink-0"><AvatarFallback className="bg-destructive text-destructive-foreground"><i className="fas fa-exclamation-triangle text-xs"></i></AvatarFallback></Avatar>
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm">
                        <p className="font-medium">Error sending message</p>
                        <p className="text-xs mt-1">{(chatMutation.error as Error)?.message || 'Please try again'}</p>
                        <Button variant="ghost" size="sm" onClick={() => chatMutation.reset()} className="mt-2 h-6 text-xs">Try Again</Button>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={chatMutation.isPending}
                    className="neon-input"
                  />
                  <Button onClick={handleSendMessage} disabled={chatMutation.isPending || !message.trim()} className="neon-button">
                    <i className="fas fa-paper-plane"></i>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
