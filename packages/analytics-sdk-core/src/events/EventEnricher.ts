/**
 * EventEnricher - Adds metadata to analytics events
 *
 * Constitutional Principle XI: Event Handling Standards
 * - Standardized event enrichment
 * - Consistent metadata across all events
 * - Configurable enrichment fields
 */

import type { AnalyticsEvent, EventMetadata } from '../types/AnalyticsEvent';
import type { EnrichmentConfig } from '../types/Configuration';
import { Logger } from '../logger/Logger';

/**
 * SDK version for metadata
 */
const SDK_VERSION = '1.0.0';

export class EventEnricher {
  private config: EnrichmentConfig;
  private logger: Logger;

  constructor(config: EnrichmentConfig = {}, logger: Logger) {
    this.config = {
      includeUrl: true,
      includeReferrer: true,
      includeUserAgent: true,
      includeScreenInfo: true,
      ...config,
    };
    this.logger = logger;
  }

  /**
   * Enrich event with metadata
   *
   * @param event - Event to enrich
   * @returns Enriched event (new object, does not mutate input)
   *
   * Contract:
   * - Never throws (catches all errors)
   * - Returns new event object (immutable pattern)
   * - Preserves existing metadata if present
   */
  enrich(event: AnalyticsEvent): AnalyticsEvent {
    try {
      const metadata: EventMetadata = {
        timestamp: event.timestamp || new Date().toISOString(),
        sdkVersion: SDK_VERSION,
        ...this.gatherMetadata(),
        ...event.metadata, // Preserve existing metadata
      };

      // Add custom fields if configured
      if (this.config.customFields) {
        Object.assign(metadata, this.config.customFields);
      }

      return {
        ...event,
        timestamp: metadata.timestamp,
        metadata,
      };
    } catch (error) {
      this.logger.error('Event enrichment failed', { event, error });
      // Return event unchanged if enrichment fails
      return event;
    }
  }

  /**
   * Gather metadata based on configuration
   */
  private gatherMetadata(): Partial<EventMetadata> {
    const metadata: Partial<EventMetadata> = {};

    try {
      // URL and referrer
      if (this.config.includeUrl && typeof window !== 'undefined') {
        metadata.url = window.location.href;
      }

      if (this.config.includeReferrer && typeof document !== 'undefined') {
        metadata.referrer = document.referrer;
      }

      // User agent
      if (this.config.includeUserAgent && typeof navigator !== 'undefined') {
        metadata.userAgent = navigator.userAgent;
      }

      // Screen and viewport info
      if (this.config.includeScreenInfo && typeof window !== 'undefined') {
        if (window.screen) {
          metadata.screenResolution = `${window.screen.width}x${window.screen.height}`;
        }

        if (window.innerWidth && window.innerHeight) {
          metadata.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
        }
      }
    } catch (error) {
      this.logger.debug('Error gathering metadata', { error });
      // Continue with partial metadata
    }

    return metadata;
  }

  /**
   * Update enrichment configuration
   *
   * @param config - New enrichment configuration
   */
  updateConfig(config: EnrichmentConfig): void {
    this.config = { ...this.config, ...config };
    this.logger.debug('Enrichment config updated', { config: this.config });
  }

  /**
   * Get current enrichment configuration
   *
   * @returns Current enrichment config
   */
  getConfig(): EnrichmentConfig {
    return { ...this.config };
  }
}
