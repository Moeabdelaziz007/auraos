import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { getMultiModalAIEngine, MultiModalInput, MultiModalOutput } from './multi-modal-ai.js';

export interface StreamingConnection {
  id: string;
  userId: string;
  ws: WebSocket;
  sessionId?: string;
  isActive: boolean;
  connectedAt: Date;
  lastActivity: Date;
  messageCount: number;
}

export interface StreamingMessage {
  id: string;
  type: 'input' | 'output' | 'status' | 'error' | 'heartbeat';
  data: any;
  timestamp: Date;
  sessionId?: string;
}

export interface StreamingConfig {
  port: number;
  maxConnections: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  enableCompression: boolean;
}

export class RealTimeAIStreaming extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, StreamingConnection> = new Map();
  private config: StreamingConfig;
  private aiEngine: any;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: StreamingConfig) {
    super();
    this.config = config;
    this.aiEngine = getMultiModalAIEngine();
    this.setupAIEngineListeners();
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({
          port: this.config.port,
          perMessageDeflate: this.config.enableCompression
        });

        this.wss.on('connection', (ws: WebSocket, request) => {
          this.handleNewConnection(ws, request);
        });

        this.wss.on('error', (error) => {
          this.emit('error', error);
          reject(error);
        });

        this.startHeartbeat();
        this.startCleanup();

        console.log(`🚀 Real-Time AI Streaming started on port ${this.config.port}`);
        this.emit('started');
        resolve();

      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all connections
    for (const connection of this.connections.values()) {
      connection.ws.close();
    }

    if (this.wss) {
      this.wss.close();
    }

    console.log('🛑 Real-Time AI Streaming stopped');
    this.emit('stopped');
  }

  private handleNewConnection(ws: WebSocket, request: any): void {
    const connectionId = uuidv4();
    const userId = this.extractUserId(request);
    
    const connection: StreamingConnection = {
      id: connectionId,
      userId,
      ws,
      isActive: true,
      connectedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0
    };

    this.connections.set(connectionId, connection);

    // Setup message handlers
    ws.on('message', (data: Buffer) => {
      this.handleMessage(connectionId, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });

    ws.on('error', (error) => {
      this.handleConnectionError(connectionId, error);
    });

    // Send welcome message
      this.sendMessage(connectionId, {
        id: uuidv4(),
        type: 'status',
        data: {
          message: 'Connected to Real-Time AI Streaming',
          connectionId,
          userId,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

    this.emit('connectionEstablished', connection);
    console.log(`🔗 New streaming connection: ${connectionId} (User: ${userId})`);
  }

  private extractUserId(request: any): string {
    // Extract user ID from request headers or query params
    const url = new URL(request.url, `http://${request.headers.host}`);
    return url.searchParams.get('userId') || 'anonymous';
  }

  private async handleMessage(connectionId: string, data: Buffer): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) {
      return;
    }

    try {
      const message = JSON.parse(data.toString());
      connection.lastActivity = new Date();
      connection.messageCount++;

      switch (message.type) {
        case 'start_session':
          await this.handleStartSession(connectionId, message.data);
          break;
        case 'process_input':
          await this.handleProcessInput(connectionId, message.data);
          break;
        case 'end_session':
          await this.handleEndSession(connectionId, message.data);
          break;
        case 'heartbeat':
          await this.handleHeartbeat(connectionId);
          break;
        case 'get_status':
          await this.handleGetStatus(connectionId);
          break;
        default:
          this.sendError(connectionId, `Unknown message type: ${message.type}`);
      }

    } catch (error) {
      this.sendError(connectionId, `Message processing error: ${error.message}`);
    }
  }

  private async handleStartSession(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const { modelId, userId } = data;
      const sessionId = await this.aiEngine.startStreamingSession(userId || connection.userId, modelId);
      
      connection.sessionId = sessionId;

      this.sendMessage(connectionId, {
        id: uuidv4(),
        type: 'status',
        data: {
          message: 'Streaming session started',
          sessionId,
          modelId,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      this.emit('sessionStarted', { connectionId, sessionId, modelId });

    } catch (error) {
      this.sendError(connectionId, `Failed to start session: ${(error as Error).message}`);
    }
  }

  private async handleProcessInput(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.sessionId) {
      this.sendError(connectionId, 'No active session');
      return;
    }

    try {
      const input: MultiModalInput = data.input;
      const startTime = Date.now();

      // Process input through AI engine
      const output = await this.aiEngine.processStreamingInput(connection.sessionId, input);
      
      const processingTime = Date.now() - startTime;

      this.sendMessage(connectionId, {
        id: uuidv4(),
        type: 'output',
        data: {
          input,
          output,
          processingTime,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      this.emit('inputProcessed', {
        connectionId,
        sessionId: connection.sessionId,
        input,
        output,
        processingTime
      });

    } catch (error) {
      this.sendError(connectionId, `Input processing failed: ${(error as Error).message}`);
    }
  }

  private async handleEndSession(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.sessionId) {
      this.sendError(connectionId, 'No active session');
      return;
    }

    try {
      await this.aiEngine.endStreamingSession(connection.sessionId);
      
      this.sendMessage(connectionId, {
        id: uuidv4(),
        type: 'status',
        data: {
          message: 'Streaming session ended',
          sessionId: connection.sessionId,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      this.emit('sessionEnded', { connectionId, sessionId: connection.sessionId });
      connection.sessionId = undefined;

    } catch (error) {
      this.sendError(connectionId, `Failed to end session: ${(error as Error).message}`);
    }
  }

  private async handleHeartbeat(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
      this.sendMessage(connectionId, {
        id: uuidv4(),
        type: 'heartbeat',
        data: {
          timestamp: new Date(),
          status: 'alive'
        },
        timestamp: new Date()
      });
    }
  }

  private async handleGetStatus(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const status = {
      connectionId: connection.id,
      userId: connection.userId,
      sessionId: connection.sessionId,
      isActive: connection.isActive,
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      messageCount: connection.messageCount,
      timestamp: new Date()
    };

    this.sendMessage(connectionId, {
      id: uuidv4(),
      type: 'status',
      data: status,
      timestamp: new Date()
    });
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isActive = false;
      
      // End any active session
      if (connection.sessionId) {
        this.aiEngine.endStreamingSession(connection.sessionId);
      }

      this.connections.delete(connectionId);
      this.emit('connectionClosed', connection);
      console.log(`🔌 Streaming connection closed: ${connectionId}`);
    }
  }

  private handleConnectionError(connectionId: string, error: Error): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.emit('connectionError', { connectionId, error });
      console.error(`❌ Streaming connection error: ${connectionId}`, error);
    }
  }

  private sendMessage(connectionId: string, message: StreamingMessage): void {
    const connection = this.connections.get(connectionId);
    if (connection && connection.isActive && connection.ws.readyState === WebSocket.OPEN) {
      try {
        connection.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to ${connectionId}:`, error);
      }
    }
  }

  private sendError(connectionId: string, errorMessage: string): void {
    this.sendMessage(connectionId, {
      id: uuidv4(),
      type: 'error',
      data: {
        error: errorMessage,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
    for (const connection of Array.from(this.connections.values())) {
      if (connection.isActive) {
        this.sendMessage(connection.id, {
          id: uuidv4(),
          type: 'heartbeat',
          data: {
            timestamp: new Date(),
            status: 'ping'
          },
          timestamp: new Date()
        });
      }
    }
    }, this.config.heartbeatInterval);
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const timeout = this.config.connectionTimeout;

    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      const lastActivity = connection.lastActivity.getTime();
      if (now - lastActivity > timeout) {
        console.log(`🧹 Cleaning up inactive connection: ${connectionId}`);
        connection.ws.close();
        this.connections.delete(connectionId);
      }
    }
    }, 60000); // Check every minute
  }

  private setupAIEngineListeners(): void {
    this.aiEngine.on('streamingSessionStarted', (session: any) => {
      this.emit('aiSessionStarted', session);
    });

    this.aiEngine.on('streamingSessionEnded', (session: any) => {
      this.emit('aiSessionEnded', session);
    });

    this.aiEngine.on('streamingMessageProcessed', (data: any) => {
      this.emit('aiMessageProcessed', data);
    });

    this.aiEngine.on('processingComplete', (data: any) => {
      this.emit('aiProcessingComplete', data);
    });

    this.aiEngine.on('processingError', (data: any) => {
      this.emit('aiProcessingError', data);
    });
  }

  // Public API Methods
  getConnection(connectionId: string): StreamingConnection | undefined {
    return this.connections.get(connectionId);
  }

  getAllConnections(): StreamingConnection[] {
    return Array.from(this.connections.values());
  }

  getActiveConnections(): StreamingConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.isActive);
  }

  getConnectionStats(): any {
    const connections = Array.from(this.connections.values());
    return {
      total: connections.length,
      active: connections.filter(conn => conn.isActive).length,
      inactive: connections.filter(conn => !conn.isActive).length,
      totalMessages: connections.reduce((sum, conn) => sum + conn.messageCount, 0),
      averageMessagesPerConnection: connections.length > 0 
        ? connections.reduce((sum, conn) => sum + conn.messageCount, 0) / connections.length 
        : 0
    };
  }

  broadcastMessage(message: StreamingMessage, excludeConnectionId?: string): void {
    for (const connection of Array.from(this.connections.values())) {
      if (connection.isActive && connection.id !== excludeConnectionId) {
        this.sendMessage(connection.id, message);
      }
    }
  }

  sendToUser(userId: string, message: StreamingMessage): void {
    for (const connection of Array.from(this.connections.values())) {
      if (connection.isActive && connection.userId === userId) {
        this.sendMessage(connection.id, message);
      }
    }
  }

  getStreamingMetrics(): any {
    const stats = this.getConnectionStats();
    const aiMetrics = this.aiEngine.getPerformanceMetrics();
    
    return {
      connections: stats,
      aiEngine: {
        models: this.aiEngine.getAllModels().length,
        activeModels: this.aiEngine.getActiveModels().length,
        sessions: this.aiEngine.getActiveStreamingSessions().length,
        performance: Object.fromEntries(aiMetrics)
      },
      timestamp: new Date()
    };
  }
}

// Singleton instance
let realTimeAIStreaming: RealTimeAIStreaming | null = null;

export function getRealTimeAIStreaming(): RealTimeAIStreaming {
  if (!realTimeAIStreaming) {
    const config: StreamingConfig = {
      port: 8080,
      maxConnections: 1000,
      heartbeatInterval: 30000, // 30 seconds
      connectionTimeout: 300000, // 5 minutes
      enableCompression: true
    };
    realTimeAIStreaming = new RealTimeAIStreaming(config);
  }
  return realTimeAIStreaming;
}

export function initializeRealTimeAIStreaming(): RealTimeAIStreaming {
  const streaming = getRealTimeAIStreaming();
  console.log('🚀 Real-Time AI Streaming initialized successfully');
  return streaming;
}
