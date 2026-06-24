/**
 * GoogleAnalyticsProvider - Google Analytics 4 (GA4) provider plugin
 *
 * Implements AnalyticsProvider interface for Google Analytics integration
 *
 * Features:
 * - gtag.js script loading
 * - Event tracking using gtag() API
 * - User identification
 * - Page view tracking
 * - State management
 */

import type { AnalyticsProvider, ProviderConfig } from './ProviderInterface';
import type { AnalyticsEvent } from '../types/AnalyticsEvent';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'google-analytics';
  readonly version = '1.0.0';

  private ready: boolean = false;
  private measurementId: string = '';

  /**
   * Initialize Google Analytics provider
   *
   * @param config - Provider configuration
   * @returns Promise that resolves when initialization completes
   *
   * Configuration format:
   * {
   *   scriptUrl: "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
   *   config: {
   *     measurementId: "G-XXXXXXXXXX"
   *   }
   * }
   */
  async init(config: ProviderConfig): Promise<void> {
    try {
      // Extract measurement ID from config
      this.measurementId = config.config.measurementId || '';

      if (!this.measurementId) {
        throw new Error('measurementId is required in config');
      }

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer!.push(args);
      };

      // Configure gtag
      window.gtag('js', new Date());
      window.gtag('config', this.measurementId, {
        send_page_view: false, // We'll handle page views manually
      });

      // Wait for script to load (script is loaded by ScriptLoader before init())
      await this.waitForGtag();

      this.ready = true;
    } catch (error) {
      this.ready = false;
      throw error;
    }
  }

  /**
   * Track an analytics event
   *
   * @param event - Standard analytics event
   *
   * Translates to gtag('event', event_name, parameters)
   */
  track(event: AnalyticsEvent): void {
    if (!this.ready) {
      console.warn('[GoogleAnalyticsProvider] Not ready, event dropped', event);
      return;
    }

    try {
      // Map our event structure to GA4 format
      const eventParams = {
        ...event.properties,
        event_category: event.category,
        timestamp: event.timestamp,
      };

      // Send to GA4
      window.gtag!('event', event.name, eventParams);
    } catch (error) {
      console.error('[GoogleAnalyticsProvider] track() error', error);
      // Don't throw - fail silently per contract
    }
  }

  /**
   * Identify a user
   *
   * @param userId - Unique user identifier
   * @param traits - User properties
   *
   * Sets GA4 user_id and user properties
   */
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.ready) {
      console.warn('[GoogleAnalyticsProvider] Not ready, identify dropped');
      return;
    }

    try {
      // Set user ID
      window.gtag!('config', this.measurementId, {
        user_id: userId,
      });

      // Set user properties if provided
      if (traits) {
        window.gtag!('set', 'user_properties', traits);
      }
    } catch (error) {
      console.error('[GoogleAnalyticsProvider] identify() error', error);
    }
  }

  /**
   * Track a page view
   *
   * @param name - Page name or title
   * @param properties - Page properties
   */
  page(name?: string, properties?: Record<string, any>): void {
    if (!this.ready) {
      console.warn('[GoogleAnalyticsProvider] Not ready, page view dropped');
      return;
    }

    try {
      const pageParams: Record<string, any> = {
        page_title: name || document.title,
        page_location: properties?.url || window.location.href,
        page_path: properties?.path || window.location.pathname,
        ...properties,
      };

      window.gtag!('event', 'page_view', pageParams);
    } catch (error) {
      console.error('[GoogleAnalyticsProvider] page() error', error);
    }
  }

  /**
   * Check if provider is ready to accept events
   *
   * @returns true if initialized and gtag is available
   */
  isReady(): boolean {
    return this.ready && typeof window.gtag === 'function';
  }

  /**
   * Wait for gtag to be available
   * Polls for window.gtag with timeout
   */
  private async waitForGtag(timeout: number = 5000): Promise<void> {
    const startTime = Date.now();

    while (!window.gtag) {
      if (Date.now() - startTime > timeout) {
        throw new Error('gtag not available after timeout');
      }

      // Wait 100ms before checking again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
