/**
 * LoggerHooks - Observability hooks for SDK logging
 *
 * Allows applications to intercept and process SDK logs
 * for custom monitoring, debugging, or analytics
 */

import type { LogEntry } from '../types';

/**
 * Logger hooks interface
 *
 * Applications can implement these hooks to receive log events
 */
export interface LoggerHooks {
  /**
   * Called when a debug message is logged
   *
   * @param message - Debug message
   * @param data - Optional structured data
   */
  onDebug?(message: string, data?: any): void;

  /**
   * Called when an info message is logged
   *
   * @param message - Info message
   * @param data - Optional structured data
   */
  onInfo?(message: string, data?: any): void;

  /**
   * Called when a warning is logged
   *
   * @param message - Warning message
   * @param data - Optional structured data
   */
  onWarn?(message: string, data?: any): void;

  /**
   * Called when an error is logged
   *
   * @param message - Error message
   * @param error - Error object or structured data
   */
  onError?(message: string, error?: any): void;

  /**
   * Called for all log entries
   * Provides unified hook for custom log processing
   *
   * @param entry - Complete log entry
   */
  onLog?(entry: LogEntry): void;
}

/**
 * No-op hooks implementation (default)
 */
export const NoOpHooks: LoggerHooks = {
  onDebug: () => {},
  onInfo: () => {},
  onWarn: () => {},
  onError: () => {},
  onLog: () => {},
};
