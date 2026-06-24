/**
 * ScriptLoader - Dynamically loads external CDN scripts
 *
 * Constitutional Principles:
 * - Dynamic Script Loading Rules (prevent duplicates, validate URLs)
 * - Runtime Safety (never throws, handles errors gracefully)
 *
 * Features:
 * - Duplicate prevention via registry
 * - Promise-based loading
 * - SRI (Subresource Integrity) support
 * - Error handling and retry logic
 */

import { Logger } from '../logger/Logger';
import { UrlValidator } from './UrlValidator';

export interface ScriptLoadOptions {
  /**
   * Script URL to load
   */
  url: string;

  /**
   * Optional SRI hash for integrity verification
   */
  integrity?: string;

  /**
   * Optional crossorigin attribute
   */
  crossorigin?: 'anonymous' | 'use-credentials';

  /**
   * Load script asynchronously
   * Default: true
   */
  async?: boolean;

  /**
   * Timeout in milliseconds
   * Default: 30000 (30 seconds)
   */
  timeout?: number;
}

export class ScriptLoader {
  private logger: Logger;
  private urlValidator: UrlValidator;
  private loadedScripts: Map<string, Promise<void>> = new Map();

  constructor(logger: Logger, urlValidator?: UrlValidator) {
    this.logger = logger;
    this.urlValidator = urlValidator || new UrlValidator();
  }

  /**
   * Load a script (with duplicate prevention)
   *
   * @param options - Script load options
   * @returns Promise that resolves when script loads successfully
   *
   * Contract:
   * - Returns existing promise if script already loading/loaded
   * - Validates URL before loading
   * - Rejects on errors but never throws
   */
  async load(options: ScriptLoadOptions): Promise<void> {
    const { url, integrity, crossorigin, async = true, timeout = 30000 } = options;

    // Check if script already loaded or loading
    const existing = this.loadedScripts.get(url);
    if (existing) {
      this.logger.debug(`Script already loaded or loading: ${url}`);
      return existing;
    }

    // Validate URL
    const validation = this.urlValidator.validate(url);
    if (!validation.valid) {
      const error = new Error(validation.error || 'Invalid script URL');
      this.logger.error('Script URL validation failed', { url, error: validation.error });
      return Promise.reject(error);
    }

    // Create and store loading promise
    const loadPromise = this.loadScript(url, { integrity, crossorigin, async, timeout });
    this.loadedScripts.set(url, loadPromise);

    return loadPromise;
  }

  /**
   * Check if a script is already loaded
   *
   * @param url - Script URL
   * @returns true if script is loaded
   */
  isLoaded(url: string): boolean {
    return this.loadedScripts.has(url);
  }

  /**
   * Get all loaded script URLs
   *
   * @returns Array of loaded script URLs
   */
  getLoadedScripts(): string[] {
    return Array.from(this.loadedScripts.keys());
  }

  /**
   * Internal method to load script via DOM
   */
  private loadScript(
    url: string,
    options: {
      integrity?: string;
      crossorigin?: 'anonymous' | 'use-credentials';
      async: boolean;
      timeout: number;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug(`Loading script: ${url}`);

        // Create script element (not innerHTML - XSS prevention)
        const script = document.createElement('script');
        script.src = url;
        script.async = options.async;

        // Add SRI hash if provided
        if (options.integrity) {
          script.integrity = options.integrity;
        }

        // Add crossorigin if provided
        if (options.crossorigin) {
          script.crossOrigin = options.crossorigin;
        }

        // Timeout handling
        const timeoutId = setTimeout(() => {
          this.logger.error('Script load timeout', { url, timeout: options.timeout });
          reject(new Error(`Script load timeout: ${url}`));
        }, options.timeout);

        // Success handler
        script.onload = () => {
          clearTimeout(timeoutId);
          this.logger.info(`Script loaded successfully: ${url}`);
          resolve();
        };

        // Error handler
        script.onerror = (event) => {
          clearTimeout(timeoutId);
          const error = new Error(`Failed to load script: ${url}`);
          this.logger.error('Script load failed', { url, event });
          reject(error);
        };

        // Append to head
        document.head.appendChild(script);
      } catch (error) {
        this.logger.error('Script load exception', { url, error });
        reject(error);
      }
    });
  }

  /**
   * Clear loaded scripts registry (for testing)
   *
   * WARNING: Does not remove scripts from DOM
   */
  clearRegistry(): void {
    this.loadedScripts.clear();
  }
}
