/**
 * EventRouter - Routes events to enabled analytics providers
 *
 * Constitutional Principles:
 * - Runtime Safety (Principle V) - Never throws, isolates provider errors
 * - Event Handling Standards (Principle XI)
 *
 * Features:
 * - Routes events to all enabled providers
 * - Error isolation per provider (one failure doesn't affect others)
 * - Logging and observability
 */

import { Logger } from '../logger/Logger';
import { ProviderRegistry } from '../core/ProviderRegistry';
import type { AnalyticsEvent } from '../types/AnalyticsEvent';

export class EventRouter {
  private providerRegistry: ProviderRegistry;
  private logger: Logger;

  constructor(providerRegistry: ProviderRegistry, logger: Logger) {
    this.providerRegistry = providerRegistry;
    this.logger = logger;
  }

  /**
   * Route event to all enabled providers
   *
   * Constitutional Principle V: Runtime Safety
   * - Never throws exceptions
   * - Isolates each provider in try-catch
   * - One provider failure doesn't affect others
   *
   * @param event - Analytics event to route
   */
  route(event: AnalyticsEvent): void {
    try {
      const providers = this.providerRegistry.getEnabled();

      if (providers.length === 0) {
        this.logger.debug('No enabled providers to route event to', {
          eventName: event.name,
        });
        return;
      }

      this.logger.debug('Routing event to providers', {
        eventName: event.name,
        providerCount: providers.length,
      });

      // Route to each provider with error isolation
      for (const provider of providers) {
        try {
          provider.track(event);
          this.logger.debug('Event sent to provider', {
            eventName: event.name,
            provider: provider.name,
          });
        } catch (error) {
          // Isolate provider errors - don't let one provider break others
          this.logger.error('Provider failed to track event', {
            provider: provider.name,
            eventName: event.name,
            error,
          });
          // Continue with next provider
        }
      }
    } catch (error) {
      // This should never happen, but catch just in case
      this.logger.error('Unexpected error in EventRouter', { event, error });
    }
  }

  /**
   * Route event to specific providers
   *
   * @param event - Analytics event to route
   * @param providerNames - Array of provider names to route to
   */
  routeToProviders(event: AnalyticsEvent, providerNames: string[]): void {
    try {
      const providers = this.providerRegistry.getEnabled();
      const targetProviders = providers.filter((p) => providerNames.includes(p.name));

      if (targetProviders.length === 0) {
        this.logger.warn('No matching providers found for targeted routing', {
          eventName: event.name,
          targetProviders: providerNames,
        });
        return;
      }

      this.logger.debug('Routing event to specific providers', {
        eventName: event.name,
        providers: providerNames,
      });

      for (const provider of targetProviders) {
        try {
          provider.track(event);
        } catch (error) {
          this.logger.error('Provider failed to track event', {
            provider: provider.name,
            eventName: event.name,
            error,
          });
        }
      }
    } catch (error) {
      this.logger.error('Error in targeted routing', { event, error });
    }
  }
}
