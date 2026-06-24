/**
 * ConfigManager - Remote configuration fetching with caching
 *
 * Constitutional Principles:
 * - Config Over Code (Principle I)
 * - Single Source of Truth (Principle II)
 * - Runtime Safety (Principle V)
 *
 * Features:
 * - Fetch configuration from remote API
 * - localStorage caching for offline resilience
 * - Zod schema validation
 * - Fallback to safe defaults
 * - Optional polling for config updates
 */

import { Logger } from '../logger/Logger';
import type { SDKConfiguration } from '../types';
import { SDKConfigurationSchema, DEFAULT_CONFIG } from '../types/Configuration';

const CACHE_KEY = 'analytics_sdk_config';
const CACHE_TIMESTAMP_KEY = 'analytics_sdk_config_timestamp';

export class ConfigManager {
  private logger: Logger;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Fetch configuration from remote API
   *
   * @param url - HTTPS URL to configuration endpoint
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Validated SDK configuration
   *
   * Fallback chain:
   * 1. Try remote fetch
   * 2. Fall back to cached config
   * 3. Fall back to safe defaults
   */
  async fetchConfig(url: string, timeout: number = 10000): Promise<SDKConfiguration> {
    try {
      this.logger.debug('Fetching configuration from remote', { url });

      // Attempt remote fetch
      const config = await this.fetchRemote(url, timeout);

      // Validate schema
      const validatedConfig = this.validateConfig(config);

      // Cache for offline use
      this.cacheConfig(validatedConfig);

      this.logger.info('Configuration fetched successfully', {
        providers: validatedConfig.providers.length,
      });

      return validatedConfig;
    } catch (error) {
      this.logger.warn('Failed to fetch remote config, trying cache', { error });

      // Fallback to cached config
      const cachedConfig = this.getCachedConfig();
      if (cachedConfig) {
        this.logger.info('Using cached configuration');
        return cachedConfig;
      }

      // Final fallback to safe defaults
      this.logger.warn('No cached config available, using safe defaults');
      return this.getDefaultConfig();
    }
  }

  /**
   * Cache configuration in localStorage
   *
   * @param config - Configuration to cache
   */
  cacheConfig(config: SDKConfiguration): void {
    try {
      if (typeof localStorage === 'undefined') {
        this.logger.debug('localStorage not available, skipping cache');
        return;
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(config));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      this.logger.debug('Configuration cached');
    } catch (error) {
      this.logger.warn('Failed to cache configuration', { error });
      // Non-fatal error - continue without caching
    }
  }

  /**
   * Retrieve cached configuration
   *
   * @returns Cached configuration or null if not found/invalid
   */
  getCachedConfig(): SDKConfiguration | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        return null;
      }

      const config = JSON.parse(cached);
      const validated = this.validateConfig(config);

      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      this.logger.debug('Retrieved cached config', { cachedAt: timestamp });

      return validated;
    } catch (error) {
      this.logger.warn('Failed to retrieve cached config', { error });
      return null;
    }
  }

  /**
   * Get safe default configuration (all providers disabled)
   *
   * @returns Default configuration
   */
  getDefaultConfig(): SDKConfiguration {
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Start polling for configuration updates
   *
   * @param url - Configuration endpoint URL
   * @param interval - Polling interval in milliseconds
   * @param onUpdate - Callback when config changes
   */
  startPolling(url: string, interval: number, onUpdate: (config: SDKConfiguration) => void): void {
    // Stop existing polling if any
    this.stopPolling();

    this.logger.info('Starting config polling', { url, interval });

    this.pollingInterval = setInterval(async () => {
      try {
        const newConfig = await this.fetchConfig(url);
        onUpdate(newConfig);
      } catch (error) {
        this.logger.error('Config polling failed', { error });
      }
    }, interval);
  }

  /**
   * Stop configuration polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.logger.debug('Config polling stopped');
    }
  }

  /**
   * Fetch configuration from remote URL
   */
  private async fetchRemote(url: string, timeout: number): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }

      throw new Error('Unknown fetch error');
    }
  }

  /**
   * Validate configuration against schema
   */
  private validateConfig(config: any): SDKConfiguration {
    try {
      return SDKConfigurationSchema.parse(config);
    } catch (error) {
      this.logger.error('Configuration validation failed', { error });
      throw new Error('Invalid configuration schema');
    }
  }
}
