import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';

/**
 * The level of a log entry.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * A log entry.
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

/**
 * The configuration for the logger.
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableDatabase: boolean;
  logDirectory: string;
  maxFileSize: number; // in MB
  maxFiles: number;
  enableColors: boolean;
  enableTimestamp: boolean;
  enableSource: boolean;
}

/**
 * An enhanced logger that supports multiple transports and log levels.
 */
class EnhancedLogger {
  private config: LoggerConfig;
  private logStream: fs.WriteStream | null = null;
  private currentLogFile: string = '';
  private logBuffer: LogEntry[] = [];
  private bufferSize: number = 100;
  private flushInterval: NodeJS.Timeout | null = null;

  /**
   * Creates an instance of EnhancedLogger.
   * @param {Partial<LoggerConfig>} [config={}] The configuration for the logger.
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      enableDatabase: false,
      logDirectory: './logs',
      maxFileSize: 10, // 10MB
      maxFiles: 5,
      enableColors: true,
      enableTimestamp: true,
      enableSource: true,
      ...config
    };

    this.initializeLogging();
  }

  /**
   * Initialize logging system
   */
  private initializeLogging(): void {
    // Create logs directory if it doesn't exist
    if (this.config.enableFile && !fs.existsSync(this.config.logDirectory)) {
      fs.mkdirSync(this.config.logDirectory, { recursive: true });
    }

    // Set up log file rotation
    if (this.config.enableFile) {
      this.setupLogFile();
    }

    // Set up buffer flushing
    if (this.config.enableDatabase) {
      this.flushInterval = setInterval(() => {
        this.flushBuffer();
      }, 5000); // Flush every 5 seconds
    }

    // Log initialization
    this.info('Enhanced Logger initialized', 'logger', {
      config: {
        level: LogLevel[this.config.level],
        enableConsole: this.config.enableConsole,
        enableFile: this.config.enableFile,
        enableDatabase: this.config.enableDatabase
      }
    });
  }

  /**
   * Set up log file with rotation
   */
  private setupLogFile(): void {
    const timestamp = new Date().toISOString().split('T')[0];
    this.currentLogFile = path.join(this.config.logDirectory, `auraos-${timestamp}.log`);

    // Close existing stream
    if (this.logStream) {
      this.logStream.end();
    }

    // Create new stream
    this.logStream = createWriteStream(this.currentLogFile, { flags: 'a' });

    // Check file size and rotate if necessary
    this.checkLogRotation();
  }

  /**
   * Check if log rotation is needed
   */
  private checkLogRotation(): void {
    if (!fs.existsSync(this.currentLogFile)) return;

    const stats = fs.statSync(this.currentLogFile);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB >= this.config.maxFileSize) {
      this.rotateLogFile();
    }
  }

  /**
   * Rotate log files
   */
  private rotateLogFile(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = path.join(this.config.logDirectory, `auraos-${timestamp}.log`);

    // Rename current file
    fs.renameSync(this.currentLogFile, rotatedFile);

    // Clean up old files
    this.cleanupOldLogs();

    // Set up new log file
    this.setupLogFile();
  }

  /**
   * Clean up old log files
   */
  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.config.logDirectory)
        .filter(file => file.startsWith('auraos-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDirectory, file),
          mtime: fs.statSync(path.join(this.config.logDirectory, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Remove files beyond maxFiles limit
      if (files.length > this.config.maxFiles) {
        files.slice(this.config.maxFiles).forEach(file => {
          fs.unlinkSync(file.path);
          this.debug(`Removed old log file: ${file.name}`, 'logger');
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, source: string = 'system', context?: Record<string, any>, error?: Error): void {
    if (level < this.config.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      context,
      stack: error?.stack,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File logging
    if (this.config.enableFile) {
      this.logToFile(entry);
    }

    // Database logging
    if (this.config.enableDatabase) {
      this.logBuffer.push(entry);
      if (this.logBuffer.length >= this.bufferSize) {
        this.flushBuffer();
      }
    }
  }

  /**
   * Log to console with colors
   */
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = this.config.enableTimestamp ? `[${entry.timestamp}]` : '';
    const source = this.config.enableSource ? `[${entry.source}]` : '';
    const levelColor = this.getLevelColor(entry.level);
    const message = entry.context ? `${entry.message} ${JSON.stringify(entry.context)}` : entry.message;

    if (this.config.enableColors) {
      console.log(`${levelColor}${levelName}${timestamp}${source} ${message}\x1b[0m`);
    } else {
      console.log(`${levelName}${timestamp}${source} ${message}`);
    }

    // Log stack trace for errors
    if (entry.stack && entry.level >= LogLevel.ERROR) {
      console.error(entry.stack);
    }
  }

  /**
   * Log to file
   */
  private logToFile(entry: LogEntry): void {
    if (!this.logStream) return;

    const logLine = JSON.stringify({
      timestamp: entry.timestamp,
      level: LogLevel[entry.level],
      message: entry.message,
      source: entry.source,
      context: entry.context,
      stack: entry.stack,
      userId: entry.userId,
      sessionId: entry.sessionId,
      requestId: entry.requestId
    }) + '\n';

    this.logStream.write(logLine);
  }

  /**
   * Flush log buffer to database
   */
  private flushBuffer(): void {
    if (this.logBuffer.length === 0) return;

    // This would integrate with your database system
    // For now, we'll just clear the buffer
    this.logBuffer = [];
  }

  /**
   * Get color for log level
   */
  private getLevelColor(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
    };
    return colors[level] || '';
  }

  /**
   * Logs a debug message.
   * @param {string} message The message to log.
   * @param {string} [source='system'] The source of the message.
   * @param {Record<string, any>} [context] Additional context for the message.
   */
  debug(message: string, source: string = 'system', context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, source, context);
  }

  /**
   * Logs an info message.
   * @param {string} message The message to log.
   * @param {string} [source='system'] The source of the message.
   * @param {Record<string, any>} [context] Additional context for the message.
   */
  info(message: string, source: string = 'system', context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, source, context);
  }

  /**
   * Logs a warning message.
   * @param {string} message The message to log.
   * @param {string} [source='system'] The source of the message.
   * @param {Record<string, any>} [context] Additional context for the message.
   */
  warn(message: string, source: string = 'system', context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, source, context);
  }

  /**
   * Logs an error message.
   * @param {string} message The message to log.
   * @param {string} [source='system'] The source of the message.
   * @param {Record<string, any>} [context] Additional context for the message.
   * @param {Error} [error] The error object.
   */
  error(message: string, source: string = 'system', context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, source, context, error);
  }

  /**
   * Logs a critical message.
   * @param {string} message The message to log.
   * @param {string} [source='system'] The source of the message.
   * @param {Record<string, any>} [context] Additional context for the message.
   * @param {Error} [error] The error object.
   */
  critical(message: string, source: string = 'system', context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, source, context, error);
  }

  /**
   * Logs an HTTP request.
   * @param {string} method The HTTP method.
   * @param {string} url The URL of the request.
   * @param {number} statusCode The status code of the response.
   * @param {number} duration The duration of the request in milliseconds.
   * @param {string} [userId] The ID of the user who made the request.
   * @param {string} [requestId] The ID of the request.
   */
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string, requestId?: string): void {
    this.info(`HTTP ${method} ${url}`, 'http', {
      method,
      url,
      statusCode,
      duration,
      userId,
      requestId
    });
  }

  /**
   * Logs an AI agent activity.
   * @param {string} agentId The ID of the agent.
   * @param {string} action The action performed by the agent.
   * @param {any} result The result of the action.
   * @param {Record<string, any>} [context] Additional context for the activity.
   */
  logAgentActivity(agentId: string, action: string, result: any, context?: Record<string, any>): void {
    this.info(`Agent ${agentId}: ${action}`, 'ai-agent', {
      agentId,
      action,
      result,
      ...context
    });
  }

  /**
   * Logs an autopilot activity.
   * @param {string} action The action performed by the autopilot.
   * @param {string} [ruleId] The ID of the rule that triggered the action.
   * @param {string} [workflowId] The ID of the workflow that was executed.
   * @param {Record<string, any>} [context] Additional context for the activity.
   */
  logAutopilotActivity(action: string, ruleId?: string, workflowId?: string, context?: Record<string, any>): void {
    this.info(`Autopilot: ${action}`, 'autopilot', {
      action,
      ruleId,
      workflowId,
      ...context
    });
  }

  /**
   * Logs a system performance metric.
   * @param {string} metric The name of the metric.
   * @param {number} value The value of the metric.
   * @param {string} unit The unit of the metric.
   * @param {Record<string, any>} [context] Additional context for the metric.
   */
  logPerformance(metric: string, value: number, unit: string, context?: Record<string, any>): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, 'performance', {
      metric,
      value,
      unit,
      ...context
    });
  }

  /**
   * Gets recent logs.
   * @param {number} [limit=100] The maximum number of logs to return.
   * @param {LogLevel} [level] The minimum log level to return.
   * @returns {LogEntry[]} A list of recent logs.
   */
  getRecentLogs(limit: number = 100, level?: LogLevel): LogEntry[] {
    // This would read from your database or log files
    // For now, return empty array
    return [];
  }

  /**
   * Searches logs.
   * @param {string} query The search query.
   * @param {Date} [startDate] The start date of the search range.
   * @param {Date} [endDate] The end date of the search range.
   * @param {LogLevel} [level] The minimum log level to search for.
   * @returns {LogEntry[]} A list of matching logs.
   */
  searchLogs(query: string, startDate?: Date, endDate?: Date, level?: LogLevel): LogEntry[] {
    // This would search through your database or log files
    // For now, return empty array
    return [];
  }

  /**
   * Updates the logger configuration.
   * @param {Partial<LoggerConfig>} newConfig The new configuration to apply.
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.info('Logger configuration updated', 'logger', { newConfig });
  }

  /**
   * Cleans up resources used by the logger.
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    if (this.logStream) {
      this.logStream.end();
    }

    // Flush remaining buffer
    this.flushBuffer();
  }
}

// Create singleton instance
const enhancedLogger = new EnhancedLogger({
  level: process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.INFO,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: true,
  enableDatabase: false, // Set to true when you want to store logs in database
  logDirectory: './logs',
  maxFileSize: 10,
  maxFiles: 5
});

export { enhancedLogger, EnhancedLogger };
export default enhancedLogger;
