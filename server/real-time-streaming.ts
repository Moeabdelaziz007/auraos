import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { getMultiModalAIEngine, MultiModalInput, MultiModalOutput } from './multi-modal-ai.js';
import { Server as HttpServer } from 'http';
import { verifyToken } from './firebase.js'; // Import Firebase token verification

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
  maxConnections: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  enableCompression: boolean;
  path: string; // Add path to config
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

  async start(server?: HttpServer): Promise<void> {
    // Skip starting if already running or if main WebSocket server is handling connections
    if (this.wss) {
      console.log('⚠️ Real-Time AI Streaming already started');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Use a different port to avoid conflicts with main WebSocket server
        const aiStreamingPort = this.config.port + 1; // Use port 8081 instead of 8080
        
        this.wss = new WebSocketServer({
          port: aiStreamingPort,
          path: this.config.path, // Use the path from config
          perMessageDeflate: this.config.enableCompression,
          verifyClient: async (info, done) => { // Add client verification
            const token = new URL(info.req.url, `http://${info.req.headers.host}`).searchParams.get('token');
            if (!token) {
              return done(false, 401, 'Unauthorized');
            }
            try {
              const decodedToken = await verifyToken(token);
              (info.req as any).user = decodedToken;
              done(true);
            } catch (error) {
              done(false, 401, 'Unauthorized');
            }
          }
        });

        this.wss.on('connection', (ws: WebSocket, request) => {
          this.handleNewConnection(ws, request);
        });

        this.wss.on('error', (error) => {
          console.error('❌ Real-Time AI Streaming WebSocket error:', error);
          this.emit('error', error);
          // Don't reject here as it might be a port conflict
        });

        this.startHeartbeat();
        this.startCleanup();

        console.log(`🚀 Real-Time AI Streaming started on port ${aiStreamingPort}`);
        this.emit('started');
        resolve();

      } catch (error) {
        console.warn('⚠️ Real-Time AI Streaming failed to start (likely port conflict):', error.message);
        // Don't reject - let the main WebSocket server handle connections
        resolve();
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
    const userId = (request as any).user.uid;
    
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

    ws.on('message', (data: Buffer) => {
      this.handleMessage(connectionId, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });

    ws.on('error', (error) => {
      this.handleConnectionError(connectionId, error);
    });

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
      this.sendError(connectionId, `Message processing error: ${(error as Error).message}`);
    }
  }

  // ... (rest of the methods remain the same)
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
    }, 60000); 
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

let realTimeAIStreaming: RealTimeAIStreaming | null = null;

export function initializeRealTimeAIStreaming(server: HttpServer): RealTimeAIStreaming {
  if (!realTimeAIStreaming) {
    const config: StreamingConfig = {
      maxConnections: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 300000,
      enableCompression: true,
      path: '/api/ws' // Define a specific path for WebSocket
    };
    realTimeAIStreaming = new RealTimeAIStreaming(config);
    realTimeAIStreaming.start(server);
  }
  return realTimeAIStreaming;
}

export function getRealTimeAIStreaming(): RealTimeAIStreaming {
  if (!realTimeAIStreaming) {
    throw new Error('RealTimeAIStreaming is not initialized. Call initializeRealTimeAIStreaming first.');
  }
  return realTimeAIStreaming;
}
