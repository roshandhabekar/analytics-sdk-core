/**
 * SDK Configuration - Runtime configuration for the Analytics SDK
 *
 * Configuration is fetched from a remote API and validated with Zod
 * Supports caching and safe fallbacks
 */

import { z } from 'zod';

/**
 * Provider-specific configuration
 */
export interface ProviderConfiguration {
  /**
   * Provider identifier (e.g., "google-analytics", "clevertap")
   */
  provider: string;

  /**
   * Enable/disable this provider
   */
  enabled: boolean;

  /**
   * HTTPS URL to provider's CDN script
   */
  scriptUrl: string;

  /**
   * Provider-specific configuration object
   */
  config: Record<string, any>;

  /**
   * Optional SRI hash for script integrity verification
   */
  integrity?: string;

  /**
   * Loading priority (lower number = higher priority)
   * Default: 100
   */
  priority?: number;
}

/**
 * Event routing rule
 */
export interface RoutingRule {
  /**
   * Rule identifier
   */
  id: string;

  /**
   * Event name pattern (exact match or regex)
   */
  eventPattern: string;

  /**
   * Provider names to route matching events to
   */
  providers: string[];

  /**
   * Whether to also send to default providers
   */
  includeDefaults?: boolean;
}

/**
 * Event enrichment configuration
 */
export interface EnrichmentConfig {
  /**
   * Include URL in event metadata
   */
  includeUrl?: boolean;

  /**
   * Include referrer in event metadata
   */
  includeReferrer?: boolean;

  /**
   * Include user agent in event metadata
   */
  includeUserAgent?: boolean;

  /**
   * Include screen/viewport dimensions
   */
  includeScreenInfo?: boolean;

  /**
   * Custom enrichment fields to add
   */
  customFields?: Record<string, any>;
}

/**
 * Main SDK configuration
 */
export interface SDKConfiguration {
  /**
   * Master switch - disable all analytics
   */
  enabled: boolean;

  /**
   * Enable debug/verbose logging
   */
  debug?: boolean;

  /**
   * Maximum time to queue events before initialization (ms)
   * Default: 5000
   */
  queueTimeout?: number;

  /**
   * Maximum number of events to queue
   * Default: 100
   */
  maxQueueSize?: number;

  /**
   * Provider configurations
   */
  providers: ProviderConfiguration[];

  /**
   * Event enrichment settings
   */
  enrichment?: EnrichmentConfig;

  /**
   * Event routing rules
   */
  routing?: RoutingRule[];

  /**
   * Configuration schema version
   */
  schemaVersion?: string;
}

/**
 * Zod schema for runtime validation
 */
export const ProviderConfigurationSchema = z.object({
  provider: z.string().min(1),
  enabled: z.boolean(),
  scriptUrl: z.string().url().startsWith('https://'),
  config: z.record(z.any()),
  integrity: z.string().optional(),
  priority: z.number().positive().optional(),
});

export const RoutingRuleSchema = z.object({
  id: z.string(),
  eventPattern: z.string(),
  providers: z.array(z.string()),
  includeDefaults: z.boolean().optional(),
});

export const EnrichmentConfigSchema = z.object({
  includeUrl: z.boolean().optional(),
  includeReferrer: z.boolean().optional(),
  includeUserAgent: z.boolean().optional(),
  includeScreenInfo: z.boolean().optional(),
  customFields: z.record(z.any()).optional(),
});

export const SDKConfigurationSchema = z.object({
  enabled: z.boolean(),
  debug: z.boolean().optional(),
  queueTimeout: z.number().positive().optional(),
  maxQueueSize: z.number().positive().max(1000).optional(),
  providers: z.array(ProviderConfigurationSchema),
  enrichment: EnrichmentConfigSchema.optional(),
  routing: z.array(RoutingRuleSchema).optional(),
  schemaVersion: z.string().optional(),
});

/**
 * Safe default configuration (all providers disabled)
 */
export const DEFAULT_CONFIG: SDKConfiguration = {
  enabled: false,
  debug: false,
  queueTimeout: 5000,
  maxQueueSize: 100,
  providers: [],
};
