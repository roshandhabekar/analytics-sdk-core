/**
 * AnalyticsSDK - Main SDK singleton instance
 *
 * Constitutional Principles:
 * - Singleton Enforcement (Principle VII)
 * - Config Over Code (Principle I)
 * - Runtime Safety (Principle V)
 * - Event Queueing (Principle VIII)
 *
 * Features:
 * - Window global singleton pattern for Module Federation
 * - Idempotent initialization
 * - Event queueing before initialization
 * - Fail-safe error handling
 */

import { Logger } from '../logger/Logger';
import { EventQueue } from '../events/EventQueue';
import { EventRouter } from '../events/EventRouter';
import { EventEnricher } from '../events/EventEnricher';
import { ConfigManager } from '../config/ConfigManager';
import { ProviderRegistry } from './ProviderRegistry';
import type { AnalyticsEvent, AnalyticsProvider, InitOptions, SDKConfiguration } from '../types';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __ANALYTICS_SDK__?: AnalyticsSDK;
  }
}

export class AnalyticsSDK {
  private static instance: AnalyticsSDK | null = null;

  private logger: Logger;
  private configManager: ConfigManager;
  private providerRegistry: ProviderRegistry;
  private eventQueue: EventQueue;
  private eventRouter: EventRouter;
  private eventEnricher: EventEnricher;

  private initialized: boolean = false;
  private initializing: boolean = false;

  /**
   * Get or create the singleton SDK instance
   *
   * Constitutional Principle VII: Singleton Enforcement
   * - Checks window global first (Module Federation boundary)
   * - Creates instance if none exists
   * - Stores in window for cross-module access
   *
   * @returns Singleton AnalyticsSDK instance
   */
  static getInstance(): AnalyticsSDK {
    // Check window global first (Module Federation failsafe)
    if (typeof window !== 'undefined' && window.__ANALYTICS_SDK__) {
      return window.__ANALYTICS_SDK__;
    }

    // Create new instance if none exists
    if (!AnalyticsSDK.instance) {
      AnalyticsSDK.instance = new AnalyticsSDK();

      // Store in window for Module Federation
      if (typeof window !== 'undefined') {
        window.__ANALYTICS_SDK__ = AnalyticsSDK.instance;
      }
    }

    return AnalyticsSDK.instance;
  }

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor() {
    this.logger = new Logger();
    this.configManager = new ConfigManager(this.logger);
    this.providerRegistry = new ProviderRegistry(this.logger);
    this.eventQueue = new EventQueue(100, this.logger);
    this.eventRouter = new EventRouter(this.providerRegistry, this.logger);
    this.eventEnricher = new EventEnricher({}, this.logger);

    this.logger.debug('AnalyticsSDK instance created');
  }

  /**
   * Initialize SDK with remote configuration
   *
   * Constitutional Principle IV: Idempotent Operations
   * - Multiple calls are safe (subsequent calls are no-ops)
   * - Never throws - all errors handled gracefully
   *
   * @param configUrl - HTTPS URL to remote configuration API
   * @param options - Optional initialization options
   * @returns Promise that resolves when initialization completes
   */
  async init(configUrl: string, options?: InitOptions): Promise<void> {
    // Idempotent: ignore subsequent calls
    if (this.initialized) {
      this.logger.debug('SDK already initialized, ignoring init() call');
      return;
    }

    // Prevent concurrent initialization
    if (this.initializing) {
      this.logger.warn('SDK initialization already in progress');
      return;
    }

    this.initializing = true;

    try {
      this.logger.info('Initializing Analytics SDK', { configUrl, options });

      // 1. Fetch configuration
      const config = await this.configManager.fetchConfig(configUrl, options?.timeout);

      // 2. Apply configuration
      this.applyConfiguration(config);

      // 3. Initialize enabled providers
      await this.initializeProviders(config);

      // 4. Replay queued events
      this.replayQueuedEvents();

      // Mark as initialized
      this.initialized = true;
      this.initializing = false;

      this.logger.info('Analytics SDK initialized successfully', {
        providersEnabled: this.providerRegistry.getEnabled().length,
        queuedEvents: this.eventQueue.size(),
      });

      // Start polling if enabled
      if (options?.enablePolling) {
        this.configManager.startPolling(configUrl, options.pollingInterval || 300000, (newConfig) =>
          this.handleConfigUpdate(newConfig)
        );
      }
    } catch (error) {
      this.initializing = false;
      this.logger.error('SDK initialization failed', error);
      // Don't throw - fail gracefully
      // Events will remain queued and SDK will use defaults
    }
  }

  /**
   * Track an analytics event
   *
   * Constitutional Principle VIII: Event Queueing
   * - Events tracked before init are queued
   * - Events after init are routed immediately
   *
   * @param event - Event object or event name
   * @param properties - Event properties (if event is string)
   */
  track(event: AnalyticsEvent | string, properties?: Record<string, any>): void {
    try {
      // Normalize event format
      const analyticsEvent: AnalyticsEvent =
        typeof event === 'string' ? { name: event, properties } : event;

      // Validate event has name
      if (!analyticsEvent.name) {
        this.logger.warn('Event name is required', { event: analyticsEvent });
        return;
      }

      // Enrich event with metadata
      const enrichedEvent = this.eventEnricher.enrich(analyticsEvent);

      // Queue if not initialized, otherwise route immediately
      if (!this.initialized) {
        this.eventQueue.enqueue(enrichedEvent);
        this.logger.debug('Event queued (SDK not initialized)', {
          eventName: enrichedEvent.name,
        });
      } else {
        this.eventRouter.route(enrichedEvent);
        this.logger.debug('Event routed', { eventName: enrichedEvent.name });
      }
    } catch (error) {
      this.logger.error('Error tracking event', { event, error });
      // Never throw - fail silently
    }
  }

  /**
   * Identify a user
   *
   * @param userId - Unique user identifier
   * @param traits - Optional user attributes
   */
  identify(userId: string, traits?: Record<string, any>): void {
    try {
      if (!userId) {
        this.logger.warn('User ID is required for identify()');
        return;
      }

      this.logger.debug('Identifying user', { userId, traits });

      // Route to all enabled providers
      const providers = this.providerRegistry.getEnabled();
      for (const provider of providers) {
        try {
          provider.identify(userId, traits);
        } catch (error) {
          this.logger.error('Provider identify() failed', {
            provider: provider.name,
            error,
          });
          // Continue with other providers
        }
      }
    } catch (error) {
      this.logger.error('Error in identify()', { userId, error });
    }
  }

  /**
   * Track a page view
   *
   * @param name - Optional page name
   * @param properties - Optional page properties
   */
  page(name?: string, properties?: Record<string, any>): void {
    try {
      this.logger.debug('Tracking page view', { name, properties });

      // Route to all enabled providers
      const providers = this.providerRegistry.getEnabled();
      for (const provider of providers) {
        try {
          provider.page(name, properties);
        } catch (error) {
          this.logger.error('Provider page() failed', {
            provider: provider.name,
            error,
          });
          // Continue with other providers
        }
      }
    } catch (error) {
      this.logger.error('Error in page()', { name, error });
    }
  }

  /**
   * Register a custom provider plugin
   *
   * @param provider - Provider instance implementing AnalyticsProvider interface
   */
  registerProvider(provider: AnalyticsProvider): void {
    try {
      this.providerRegistry.register(provider);
      this.logger.info('Provider registered', { provider: provider.name });
    } catch (error) {
      this.logger.error('Failed to register provider', { provider: provider.name, error });
    }
  }

  /**
   * Set logger hooks for observability
   *
   * @param hooks - Logger hooks implementation
   */
  setLoggerHooks(hooks: any): void {
    this.logger.setHooks(hooks);
  }

  /**
   * Get all registered providers
   *
   * @returns Array of provider names
   */
  getProviders(): string[] {
    return Array.from(this.providerRegistry['providers'].keys());
  }

  /**
   * Check if SDK is initialized
   *
   * @returns true if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Apply configuration to SDK components
   */
  private applyConfiguration(config: SDKConfiguration): void {
    // Enable debug mode if configured
    if (config.debug) {
      this.logger.setDebugMode(true);
    }

    // Update event enrichment config
    if (config.enrichment) {
      this.eventEnricher.updateConfig(config.enrichment);
    }

    // Update queue size if configured
    if (config.maxQueueSize) {
      this.eventQueue.setMaxSize(config.maxQueueSize);
    }
  }

  /**
   * Initialize providers from configuration
   */
  private async initializeProviders(config: SDKConfiguration): Promise<void> {
    const providers = config.providers.filter((p) => p.enabled);

    this.logger.debug('Initializing providers', { count: providers.length });

    // Initialize providers in parallel
    const initPromises = providers.map((providerConfig) =>
      this.providerRegistry.initializeProvider(providerConfig.provider, {
        scriptUrl: providerConfig.scriptUrl,
        config: providerConfig.config,
        integrity: providerConfig.integrity,
      })
    );

    // Wait for all (some may fail, that's OK)
    await Promise.allSettled(initPromises);
  }

  /**
   * Replay queued events after initialization
   */
  private replayQueuedEvents(): void {
    this.eventQueue.replay((event) => {
      this.eventRouter.route(event);
    });
  }

  /**
   * Handle configuration updates from polling
   */
  private handleConfigUpdate(newConfig: SDKConfiguration): void {
    try {
      this.logger.info('Configuration updated via polling');
      this.applyConfiguration(newConfig);
      // Note: Provider re-initialization on config change is out of scope for MVP
    } catch (error) {
      this.logger.error('Error handling config update', error);
    }
  }
}
