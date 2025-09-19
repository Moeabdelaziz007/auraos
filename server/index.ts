import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { initializeRealTimeAIStreaming } from "./real-time-streaming";
import { setupVite, serveStatic, log } from "./vite";
import { autopilotAgent } from "./autopilot-agent";
import { getSelfImprovingAISystem } from "./self-improving-ai";
import { getDebugStream } from "./debug-stream";

const app = express();
const server = createServer(app);
const debugStream = getDebugStream();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/events', (req, res) => {
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
  await registerRoutes(app);
  initializeRealTimeAIStreaming(server);
  autopilotAgent.start();

  const selfImprovingSystem = getSelfImprovingAISystem();
  selfImprovingSystem.start();

  // Run a self-improvement cycle shortly after startup
  setTimeout(() => {
    selfImprovingSystem.runImprovementCycle();
  }, 10000);


  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

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
  }, () => {
    log(`serving on port ${port}`);
  });
})();
