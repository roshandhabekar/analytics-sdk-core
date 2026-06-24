/**
 * analytics-sdk-core
 *
 * Centralized analytics SDK for third-party CDN integration
 * Framework-agnostic TypeScript library with Module Federation support
 *
 * @packageDocumentation
 */

// Type exports
export type {
  AnalyticsEvent,
  EventMetadata,
  SDKConfiguration,
  ProviderConfiguration,
  RoutingRule,
  EnrichmentConfig,
  InitOptions,
  LogEntry,
  AnalyticsProvider,
  ProviderConfig,
} from './types';

export {
  LogLevel,
  SDKConfigurationSchema,
  ProviderConfigurationSchema,
  DEFAULT_CONFIG,
} from './types';

// Core SDK exports
export { AnalyticsSDK } from './core/AnalyticsSDK';
export { ProviderRegistry } from './core/ProviderRegistry';

// Configuration exports
export { ConfigManager } from './config/ConfigManager';

// Logger exports
export { Logger } from './logger/Logger';
export type { LoggerHooks } from './logger/LoggerHooks';
export { NoOpHooks } from './logger/LoggerHooks';

// Loader exports
export { UrlValidator } from './loader/UrlValidator';
export type { UrlValidationResult } from './loader/UrlValidator';
export { ScriptLoader } from './loader/ScriptLoader';
export type { ScriptLoadOptions } from './loader/ScriptLoader';

// Event exports
export { EventQueue } from './events/EventQueue';
export { EventEnricher } from './events/EventEnricher';
export { EventRouter } from './events/EventRouter';

// Provider exports
export { GoogleAnalyticsProvider } from './providers/GoogleAnalyticsProvider';
