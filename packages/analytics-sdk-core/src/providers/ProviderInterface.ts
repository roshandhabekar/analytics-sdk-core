/**
 * AnalyticsProvider - Interface that all provider plugins must implement
 *
 * Providers are responsible for:
 * - Loading external CDN scripts
 * - Initializing with provider-specific configuration
 * - Translating standard events to provider-specific format
 * - Handling errors gracefully
 */

import type { AnalyticsEvent } from '../types/AnalyticsEvent';

/**
 * Provider-specific configuration
 * This is passed to the provider's init() method
 */
export interface ProviderConfig {
  /**
   * HTTPS URL to provider's CDN script
   */
  scriptUrl: string;

  /**
   * Provider-specific settings
   */
  config: Record<string, any>;

  /**
   * Optional SRI hash for script verification
   */
  integrity?: string;
}

/**
 * AnalyticsProvider interface
 *
 * All provider plugins MUST implement this interface
 */
export interface AnalyticsProvider {
  /**
   * Provider identifier (e.g., "google-analytics", "clevertap")
   * Must be unique and match the provider name in configuration
   */
  readonly name: string;

  /**
   * Provider plugin version (semantic versioning)
   */
  readonly version: string;

  /**
   * Initialize the provider with configuration
   *
   * @param config - Provider-specific configuration
   * @returns Promise that resolves when initialization is complete
   *
   * Contract:
   * - MUST load external scripts if needed
   * - MUST handle initialization errors gracefully (catch and log)
   * - MUST set internal state to ready when complete
   * - MAY reject promise on fatal errors (SDK will handle gracefully)
   */
  init(config: ProviderConfig): Promise<void>;

  /**
   * Track an analytics event
   *
   * @param event - Standard analytics event
   *
   * Contract:
   * - MUST NOT throw exceptions (catch all errors internally)
   * - MUST handle events even if provider not fully initialized (queue or drop)
   * - SHOULD translate event to provider-specific format
   */
  track(event: AnalyticsEvent): void;

  /**
   * Identify a user
   *
   * @param userId - Unique user identifier
   * @param traits - Optional user attributes/traits
   *
   * Contract:
   * - MUST NOT throw exceptions
   * - MAY ignore if provider doesn't support user identification
   */
  identify(userId: string, traits?: Record<string, any>): void;

  /**
   * Track a page view
   *
   * @param name - Optional page name
   * @param properties - Optional page properties
   *
   * Contract:
   * - MUST NOT throw exceptions
   * - MAY use current window.location if name not provided
   */
  page(name?: string, properties?: Record<string, any>): void;

  /**
   * Check if provider is ready to accept events
   *
   * @returns true if provider is initialized and ready
   *
   * Contract:
   * - MUST return boolean (never throw)
   * - SHOULD return false until init() completes successfully
   */
  isReady(): boolean;
}
