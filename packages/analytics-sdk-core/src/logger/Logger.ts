/**
 * Logger - Centralized logging with debug mode and observability hooks
 *
 * Constitutional Principle V: Runtime Safety
 * - Never throws exceptions
 * - Gracefully handles all errors
 */

import { LogLevel, type LogEntry } from '../types';
import { LoggerHooks, NoOpHooks } from './LoggerHooks';

export class Logger {
  private debugEnabled: boolean = false;
  private hooks: LoggerHooks = NoOpHooks;

  /**
   * Enable or disable debug mode
   *
   * @param enabled - Whether to enable debug logging
   */
  setDebugMode(enabled: boolean): void {
    this.debugEnabled = enabled;
  }

  /**
   * Set custom logger hooks for observability
   *
   * @param hooks - Logger hooks implementation
   */
  setHooks(hooks: Partial<LoggerHooks>): void {
    this.hooks = { ...NoOpHooks, ...hooks };
  }

  /**
   * Log debug message (only if debug mode enabled)
   *
   * @param message - Debug message
   * @param data - Optional structured data
   */
  debug(message: string, data?: any): void {
    if (!this.debugEnabled) return;

    try {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
      console.debug(`[Analytics SDK Debug] ${message}`, data);
      this.hooks.onDebug?.(message, data);
      this.hooks.onLog?.(entry);
    } catch (error) {
      // Never let logging errors break the SDK
      this.safeConsoleError('Logger.debug failed', error);
    }
  }

  /**
   * Log info message
   *
   * @param message - Info message
   * @param data - Optional structured data
   */
  info(message: string, data?: any): void {
    try {
      const entry = this.createLogEntry(LogLevel.INFO, message, data);
      console.info(`[Analytics SDK] ${message}`, data);
      this.hooks.onInfo?.(message, data);
      this.hooks.onLog?.(entry);
    } catch (error) {
      this.safeConsoleError('Logger.info failed', error);
    }
  }

  /**
   * Log warning message
   *
   * @param message - Warning message
   * @param data - Optional structured data
   */
  warn(message: string, data?: any): void {
    try {
      const entry = this.createLogEntry(LogLevel.WARN, message, data);
      console.warn(`[Analytics SDK Warning] ${message}`, data);
      this.hooks.onWarn?.(message, data);
      this.hooks.onLog?.(entry);
    } catch (error) {
      this.safeConsoleError('Logger.warn failed', error);
    }
  }

  /**
   * Log error message
   *
   * @param message - Error message
   * @param error - Error object or structured data
   */
  error(message: string, error?: any): void {
    try {
      const entry = this.createLogEntry(LogLevel.ERROR, message, error);
      console.error(`[Analytics SDK Error] ${message}`, error);
      this.hooks.onError?.(message, error);
      this.hooks.onLog?.(entry);
    } catch (err) {
      this.safeConsoleError('Logger.error failed', err);
    }
  }

  /**
   * Create a log entry object
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Safe console.error that never throws
   */
  private safeConsoleError(message: string, error: any): void {
    try {
      console.error(`[Analytics SDK Logger Error] ${message}`, error);
    } catch {
      // If even console.error fails, we're in a very bad state
      // But we still won't throw - just silently fail
    }
  }
}
