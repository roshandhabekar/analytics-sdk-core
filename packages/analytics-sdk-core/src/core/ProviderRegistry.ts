/**
 * ProviderRegistry - Manages lifecycle of analytics provider plugins
 *
 * Constitutional Principle III: Plugin-Based Architecture
 * - Providers are independent plugins
 * - Isolated initialization and error handling
 * - Dynamic registration support
 *
 * Features:
 * - Provider registration and initialization
 * - Lifecycle state tracking (registered, enabled, failed)
 * - Error isolation per provider
 */

import { Logger } from '../logger/Logger';
import { ScriptLoader } from '../loader/ScriptLoader';
import { UrlValidator } from '../loader/UrlValidator';
import type { AnalyticsProvider, ProviderConfig } from '../providers/ProviderInterface';

export class ProviderRegistry {
  private logger: Logger;
  private scriptLoader: ScriptLoader;
  private providers: Map<string, AnalyticsProvider> = new Map();
  private enabledProviders: Set<string> = new Set();
  private failedProviders: Set<string> = new Set();

  constructor(logger: Logger) {
    this.logger = logger;
    const urlValidator = new UrlValidator();
    this.scriptLoader = new ScriptLoader(logger, urlValidator);
  }

  /**
   * Register a provider plugin
   *
   * @param provider - Provider instance implementing AnalyticsProvider interface
   * @throws Error if provider with same name already registered
   */
  register(provider: AnalyticsProvider): void {
    if (this.providers.has(provider.name)) {
      const error = `Provider '${provider.name}' is already registered`;
      this.logger.error(error);
      throw new Error(error);
    }

    this.providers.set(provider.name, provider);
    this.logger.debug('Provider registered', {
      name: provider.name,
      version: provider.version,
    });
  }

  /**
   * Initialize a provider with configuration
   *
   * @param name - Provider name
   * @param config - Provider-specific configuration
   * @returns Promise that resolves when provider is ready
   *
   * Contract:
   * - Does not throw on provider init failure
   * - Marks provider as failed if init fails
   * - Marks provider as enabled if init succeeds
   */
  async initializeProvider(name: string, config: ProviderConfig): Promise<void> {
    try {
      const provider = this.providers.get(name);

      if (!provider) {
        this.logger.warn('Provider not found for initialization', { name });
        this.failedProviders.add(name);
        return;
      }

      this.logger.debug('Initializing provider', { name });

      // Load provider script if needed
      if (config.scriptUrl) {
        try {
          await this.scriptLoader.load({
            url: config.scriptUrl,
            integrity: config.integrity,
          });
        } catch (error) {
          this.logger.error('Failed to load provider script', { name, error });
          this.failedProviders.add(name);
          return;
        }
      }

      // Initialize provider
      await provider.init(config);

      // Mark as enabled if ready
      if (provider.isReady()) {
        this.enabledProviders.add(name);
        this.logger.info('Provider initialized successfully', { name });
      } else {
        this.logger.warn('Provider not ready after init', { name });
        this.failedProviders.add(name);
      }
    } catch (error) {
      this.logger.error('Provider initialization failed', { name, error });
      this.failedProviders.add(name);
      // Don't throw - fail gracefully
    }
  }

  /**
   * Get all enabled (ready) providers
   *
   * @returns Array of ready provider instances
   */
  getEnabled(): AnalyticsProvider[] {
    const enabled: AnalyticsProvider[] = [];

    for (const name of this.enabledProviders) {
      const provider = this.providers.get(name);
      if (provider && provider.isReady()) {
        enabled.push(provider);
      }
    }

    return enabled;
  }

  /**
   * Get a specific provider by name
   *
   * @param name - Provider name
   * @returns Provider instance or undefined if not found
   */
  getProvider(name: string): AnalyticsProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Check if a provider is enabled and ready
   *
   * @param name - Provider name
   * @returns true if provider is enabled
   */
  isEnabled(name: string): boolean {
    return this.enabledProviders.has(name);
  }

  /**
   * Check if a provider failed initialization
   *
   * @param name - Provider name
   * @returns true if provider failed
   */
  isFailed(name: string): boolean {
    return this.failedProviders.has(name);
  }

  /**
   * Get all registered provider names
   *
   * @returns Array of provider names
   */
  getAll(): string[] {
    return Array.from(this.providers.keys());
  }
}
