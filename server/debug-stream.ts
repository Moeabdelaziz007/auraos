import { Response } from 'express';
import { enhancedLogger } from './enhanced-logger.js';

interface Client {
  id: string;
  res: Response;
}

class DebugStream {
  private clients: Client[] = [];
  private nextClientId = 1;

  addClient(res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('\n'); // Initial empty message to open the connection

    const clientId = (this.nextClientId++).toString();
    const newClient: Client = { id: clientId, res };
    this.clients.push(newClient);

    console.log(`[DebugStream] Client ${clientId} connected.`);
    enhancedLogger.info(`Client connected to debug stream`, 'debug-stream', { clientId });

    res.on('close', () => {
      this.removeClient(clientId);
      console.log(`[DebugStream] Client ${clientId} disconnected.`);
      enhancedLogger.info(`Client disconnected from debug stream`, 'debug-stream', { clientId });
    });
  }

  removeClient(clientId: string) {
    this.clients = this.clients.filter(client => client.id !== clientId);
  }

  broadcast(event: Record<string, any>) {
    if (this.clients.length === 0) {
      return;
    }

    const eventString = `data: ${JSON.stringify(event)}\n\n`;

    this.clients.forEach(client => {
      try {
        client.res.write(eventString);
      } catch (e) {
        console.error(`[DebugStream] Error writing to client ${client.id}`, e);
        enhancedLogger.error(`Error writing to debug stream client`, 'debug-stream', { clientId: client.id }, e as Error);
        this.removeClient(client.id);
      }
    });
  }
}

// Singleton instance
const debugStream = new DebugStream();

export function getDebugStream() {
  return debugStream;
}
