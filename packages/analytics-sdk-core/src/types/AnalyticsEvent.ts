/**
 * AnalyticsEvent - Core event structure
 *
 * Standard event format used throughout the SDK
 * Events are enriched with metadata before being sent to providers
 */

export interface AnalyticsEvent {
  /**
   * Event name (e.g., "button_clicked", "page_viewed")
   */
  name: string;

  /**
   * Event properties/attributes
   */
  properties?: Record<string, any>;

  /**
   * Event metadata (added by EventEnricher)
   */
  metadata?: EventMetadata;

  /**
   * Event category for routing (optional)
   */
  category?: string;

  /**
   * Event timestamp (ISO 8601 format)
   * Auto-populated by EventEnricher if not provided
   */
  timestamp?: string;
}

/**
 * Event metadata added during enrichment
 */
export interface EventMetadata {
  /**
   * Timestamp when event was created (ISO 8601)
   */
  timestamp: string;

  /**
   * Page URL where event occurred
   */
  url?: string;

  /**
   * Page referrer
   */
  referrer?: string;

  /**
   * User agent string
   */
  userAgent?: string;

  /**
   * Screen resolution (e.g., "1920x1080")
   */
  screenResolution?: string;

  /**
   * Viewport size (e.g., "1440x900")
   */
  viewportSize?: string;

  /**
   * SDK version that generated the event
   */
  sdkVersion?: string;

  /**
   * Custom metadata fields
   */
  [key: string]: any;
}
