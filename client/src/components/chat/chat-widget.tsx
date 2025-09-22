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
import "@/styles/theme.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; type: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { isConnected } = useWebSocket('/ws', (data: any) => {
    if (data?.type === 'chat_message') {
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
      ErrorHandler.getInstance().handleError(historyError, { logToConsole: true, reportToService: true });
    }
  }, [isHistoryError, historyError]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('POST', '/api/chat', { message: userMessage, userId: 'user-1' });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [ ...prev, { id: Date.now().toString(), type: 'ai', content: data.response, timestamp: new Date() } ]);
    },
    onError: (error) => {
      ErrorHandler.getInstance().handleError(error, { logToConsole: true, reportToService: true });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const userMessage = { id: Date.now().toString(), type: 'user' as const, content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome', type: 'ai', content: "Hi! I'm your AI assistant. I can help you create content, set up automations, or analyze your social media performance. What would you like to do?", timestamp: new Date()
        }]);
      }
      if (chatHistory && messages.length <= 1) {
        const history = chatHistory.map(m => ({ id: m.id, type: m.role as 'user' | 'ai', content: m.message, timestamp: new Date(m.timestamp) }));
        setMessages(prev => [prev[0], ...history]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chatHistory]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
          onClick={() => setIsOpen(v => !v)}
          aria-expanded={isOpen}
          aria-controls="chat-widget"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          data-testid="button-toggle-chat"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-lg group-hover:scale-110 transition-transform`} />
        </Button>

        {isOpen && (
          <Card id="chat-widget" className="absolute bottom-16 right-0 w-80 shadow-xl glass-card neon-glow-md chat-card" data-testid="chat-widget" role="dialog" aria-label="AI chat widget">
            <CardHeader className="p-4 border-b chat-header">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 chat-avatar">
                  <AvatarImage src="" alt="AI Assistant" />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground"><i className="fas fa-robot text-sm" /></AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-medium text-foreground">AI Assistant</h4>
                  <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">{isConnected ? 'Online' : 'Offline'}</Badge>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} data-testid="button-close-chat" aria-label="Close chat">
                  <i className="fas fa-times" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 chat-content">
              <ScrollArea className="h-60 p-4 cyber-scrollbar">
                <div className="space-y-3" aria-live="polite" aria-relevant="additions">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'ai' && (
                        <Avatar className="w-7 h-7 flex-shrink-0 chat-message-avatar">
                          <AvatarFallback className="bg-primary text-primary-foreground"><i className="fas fa-robot text-xs" /></AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`chat-bubble ${msg.type === 'user' ? 'user' : 'ai'}`}>
                        <div className="chat-bubble-content">{msg.content}</div>
                        <div className="chat-bubble-meta">
                          <time className="chat-timestamp" dateTime={msg.timestamp.toISOString()}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                        </div>
                      </div>

                      {msg.type === 'user' && (
                        <Avatar className="w-7 h-7 flex-shrink-0 chat-message-avatar user-avatar">
                          <AvatarFallback className="bg-accent text-accent-foreground">U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {chatMutation.isPending && (
                    <div className="flex gap-3 justify-start items-center">
                      <Avatar className="w-7 h-7 flex-shrink-0 chat-message-avatar">
                        <AvatarFallback className="bg-primary text-primary-foreground"><i className="fas fa-robot text-xs" /></AvatarFallback>
                      </Avatar>
                      <div className="chat-bubble ai"><div className="chat-bubble-content"><LoadingSpinner size="sm" variant="cyber" text="AI is thinking..." /></div></div>
                    </div>
                  )}

                  {chatMutation.isError && (
                    <div className="flex gap-3 justify-start items-center">
                      <Avatar className="w-7 h-7 flex-shrink-0 chat-message-avatar"><AvatarFallback className="bg-destructive text-destructive-foreground"><i className="fas fa-exclamation-triangle text-xs" /></AvatarFallback></Avatar>
                      <div className="chat-bubble error">
                        <div className="chat-bubble-content">
                          <p className="font-medium">Error sending message</p>
                          <p className="text-xs mt-1">{(chatMutation.error as Error)?.message || 'Please try again'}</p>
                          <Button variant="ghost" size="sm" onClick={() => chatMutation.reset()} className="mt-2 h-6 text-xs">Try Again</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t chat-input-area">
                <label htmlFor="chat-input" className="sr-only">Type a message</label>
                <div className="flex gap-2">
                  <Input id="chat-input" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={chatMutation.isPending} className="neon-input chat-input" aria-label="Message input" />
                  <Button onClick={handleSendMessage} disabled={chatMutation.isPending || !message.trim()} className="neon-button chat-send-button" aria-label="Send message"><i className="fas fa-paper-plane" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
