import { useEffect, useRef, useCallback, useState } from "react";

interface WebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export function useWebSocket(path: string, onMessage: (data: any) => void, options: WebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualCloseRef = useRef(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; errorId: string; stack?: string } | null>(null);

  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = options;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      // Use the correct WebSocket URL - check if we're in production
      let wsUrl: string;
      
      if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
        // In production, use the deployed URL
        wsUrl = `wss://aios-97581.web.app${path}`;
      } else {
        // In development or local production, use local server
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        // Use localhost for development, but allow for different ports
        const host = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
        wsUrl = `${protocol}//${host}${path}`;
      }

      console.log('Attempting WebSocket connection to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        reconnectAttemptsRef.current = 0;
        isManualCloseRef.current = false;
        
        // Start heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            return;
          }
          onMessage(data);
        } catch (error) {
          const errorId = `ERR-WS-${Date.now()}-${Math.floor(Math.random()*10000)}`;
          setErrorDetails({ message: 'Failed to parse WebSocket message', errorId, stack: (error as Error).stack });
          console.error(`[${errorId}] Failed to parse WebSocket message:`, error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${reconnectInterval}ms`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const errorId = `ERR-WS-${Date.now()}-${Math.floor(Math.random()*10000)}`;
          setErrorDetails({ message: 'Max reconnection attempts reached. WebSocket connection failed.', errorId });
          console.error(`[${errorId}] Max reconnection attempts reached. WebSocket connection failed.`);
        }
      };

      ws.onerror = (error) => {
        const errorId = `ERR-WS-${Date.now()}-${Math.floor(Math.random()*10000)}`;
        setErrorDetails({ message: 'WebSocket error', errorId, stack: (error as Error).stack });
        console.error(`[${errorId}] WebSocket error:`, error);
      };

    } catch (error) {
      const errorId = `ERR-WS-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      setErrorDetails({ message: 'Failed to create WebSocket connection', errorId, stack: (error as Error).stack });
      console.error(`[${errorId}] Failed to create WebSocket connection:`, error);
    }
  }, [path, onMessage, reconnectInterval, maxReconnectAttempts]);

  const startHeartbeat = useCallback(() => {
    const sendHeartbeat = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        
        heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
      }
    };
    
    heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
  }, [heartbeatInterval]);

  const disconnect = useCallback(() => {
    isManualCloseRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // يمكن إرجاع errorDetails من hook لاستخدامه في إشعارات أو رسائل واجهة المستخدم
  return { connect, errorDetails };
}
