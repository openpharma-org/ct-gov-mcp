import { LogLevel } from '../types.js';

class Logger {
  private levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  } as const;

  public level: LogLevel;
  private useHttp: boolean;

  constructor(level: LogLevel = 'info', useHttp: boolean = false) {
    this.level = level;
    this.useHttp = useHttp;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({ timestamp, level, message, ...meta });
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[this.level] >= this.levels[level];
  }

  private writeMessage(level: LogLevel, message: string): void {
    const formattedMessage = this.formatMessage(level, message) + '\n';
    
    if (level === 'error' || level === 'warn') {
      process.stderr.write(formattedMessage);
    } else {
      if (!this.useHttp) {
        process.stderr.write(formattedMessage);
      } else {
        process.stdout.write(formattedMessage);
      }
    }
  }

  error(message: string, _meta?: any): void {
    if (this.shouldLog('error')) {
      this.writeMessage('error', message);
    }
  }

  warn(message: string, _meta?: any): void {
    if (this.shouldLog('warn')) {
      this.writeMessage('warn', message);
    }
  }

  info(message: string, _meta?: any): void {
    if (this.shouldLog('info')) {
      this.writeMessage('info', message);
    }
  }

  debug(message: string, _meta?: any): void {
    if (this.shouldLog('debug')) {
      this.writeMessage('debug', message);
    }
  }
}

export const createLogger = (level: LogLevel = 'info', useHttp: boolean = false): Logger => {
  return new Logger(level, useHttp);
}; 