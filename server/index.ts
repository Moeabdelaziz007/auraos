import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { initializeRealTimeAIStreaming } from "./real-time-streaming";
import { setupVite, serveStatic, log } from "./vite";
import { autopilotAgent } from "./autopilot-agent";
import { getSelfImprovingAISystem } from "./self-improving-ai";
import { getDebugStream } from "./debug-stream";
import { initializeFirebase } from "./firebase";
import { enhancedLogger } from "./enhanced-logger.js";

const app = express();
const server = createServer(app);
const debugStream = getDebugStream();

// Initialize Firebase
initializeFirebase();

// Initialize Enhanced Logger
enhancedLogger.info('AuraOS Server starting up', 'server', {
  nodeVersion: process.version,
  platform: process.platform,
  pid: process.pid
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/events', (req, res) => {
  // Set proper headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  debugStream.addClient(res);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);

      // Enhanced logging
      enhancedLogger.logRequest(req.method, path, res.statusCode, duration, req.headers['user-id'] as string);

      // Also send the log to the debug stream
      debugStream.broadcast({ 
        timestamp: new Date().toISOString(), 
        message: logLine 
      });
    }
  });

  next();
});

(async () => {
  try {
    enhancedLogger.info('Registering API routes', 'server');
    await registerRoutes(app);
    
    enhancedLogger.info('Initializing real-time AI streaming', 'server');
    initializeRealTimeAIStreaming(server);
    
    enhancedLogger.info('Starting autopilot agent', 'autopilot');
    autopilotAgent.start();

    const selfImprovingSystem = getSelfImprovingAISystem();
    enhancedLogger.info('Starting self-improving AI system', 'ai');
    selfImprovingSystem.start();

    // Run a self-improvement cycle shortly after startup
    setTimeout(() => {
      enhancedLogger.info('Running initial self-improvement cycle', 'ai');
      selfImprovingSystem.runImprovementCycle();
    }, 10000);


    enhancedLogger.info('Server initialization completed successfully', 'server');
  } catch (error) {
    enhancedLogger.error('Failed to initialize server', 'server', undefined, error as Error);
    process.exit(1);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Enhanced error logging
    enhancedLogger.error(`HTTP Error ${status}: ${message}`, 'http', {
      status,
      url: _req.url,
      method: _req.method
    }, err);

    // Also send the error to the debug stream
    debugStream.broadcast({ 
      timestamp: new Date().toISOString(), 
      error: message,
      status: status,
    });

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`🚀 Amrikyy server running on port ${port}`);
    enhancedLogger.info(`Amrikyy Server started on port ${port}`, 'server', {
      port,
      host: '0.0.0.0',
      environment: app.get('env')
    });
    
    // Initialize real-time AI streaming
    try {
      const streaming = await initializeRealTimeAIStreaming({
        port: port,
        path: '/ws',
        enableCompression: true
      });
      log('✅ Real-time AI streaming initialized');
      enhancedLogger.info('Real-time AI streaming initialized successfully', 'streaming');
    } catch (error) {
      log(`❌ Failed to initialize real-time AI streaming: ${error}`);
      enhancedLogger.error('Failed to initialize real-time AI streaming', 'streaming', undefined, error as Error);
    }
  });
})();
