/**
 * Core type definitions and exports
 *
 * Central export point for all SDK types
 */

export type { AnalyticsEvent, EventMetadata } from './AnalyticsEvent';
export type {
  SDKConfiguration,
  ProviderConfiguration,
  RoutingRule,
  EnrichmentConfig,
} from './Configuration';
export {
  SDKConfigurationSchema,
  ProviderConfigurationSchema,
  RoutingRuleSchema,
  EnrichmentConfigSchema,
  DEFAULT_CONFIG,
} from './Configuration';
export type { AnalyticsProvider, ProviderConfig } from '../providers/ProviderInterface';

/**
 * SDK initialization options
 */
export interface InitOptions {
  /**
   * Enable automatic configuration polling
   * Default: false
   */
  enablePolling?: boolean;

  /**
   * Polling interval in milliseconds
   * Default: 300000 (5 minutes)
   */
  pollingInterval?: number;

  /**
   * Configuration fetch timeout in milliseconds
   * Default: 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Override logger instance
   */
  logger?: any;
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}
