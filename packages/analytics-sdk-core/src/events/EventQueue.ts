/**
 * EventQueue - FIFO queue for events tracked before SDK initialization
 *
 * Constitutional Principle VIII: Event Queueing
 * - Queues events before providers are ready
 * - Bounded memory (max size limit)
 * - FIFO ordering preserved
 * - Thread-safe replay mechanism
 */

import type { AnalyticsEvent } from '../types/AnalyticsEvent';
import { Logger } from '../logger/Logger';

export class EventQueue {
  private queue: AnalyticsEvent[] = [];
  private maxSize: number;
  private logger: Logger;
  private droppedCount: number = 0;

  constructor(maxSize: number = 100, logger: Logger) {
    this.maxSize = maxSize;
    this.logger = logger;
  }

  /**
   * Add event to queue
   *
   * @param event - Event to queue
   * @returns true if event was queued, false if dropped due to overflow
   */
  enqueue(event: AnalyticsEvent): boolean {
    if (this.queue.length >= this.maxSize) {
      this.droppedCount++;
      this.logger.warn('Event queue overflow - event dropped', {
        eventName: event.name,
        queueSize: this.queue.length,
        maxSize: this.maxSize,
        droppedCount: this.droppedCount,
      });
      return false;
    }

    this.queue.push(event);
    this.logger.debug('Event queued', {
      eventName: event.name,
      queueSize: this.queue.length,
    });
    return true;
  }

  /**
   * Replay all queued events
   *
   * @param handler - Function to call for each queued event
   * @returns Number of events replayed
   *
   * Contract:
   * - Calls handler for each event in FIFO order
   * - Clears queue after replay
   * - Never throws (catches handler errors)
   */
  replay(handler: (event: AnalyticsEvent) => void): number {
    const count = this.queue.length;

    if (count === 0) {
      this.logger.debug('No events to replay');
      return 0;
    }

    this.logger.info(`Replaying ${count} queued events`);

    // Replay in FIFO order
    for (const event of this.queue) {
      try {
        handler(event);
      } catch (error) {
        this.logger.error('Error replaying queued event', {
          event,
          error,
        });
        // Continue with next event - don't let one failure stop replay
      }
    }

    // Clear queue after replay
    this.queue = [];

    this.logger.info(`Event replay complete`, {
      replayed: count,
      dropped: this.droppedCount,
    });

    return count;
  }

  /**
   * Get current queue size
   *
   * @returns Number of events in queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Get number of dropped events
   *
   * @returns Total events dropped due to overflow
   */
  getDroppedCount(): number {
    return this.droppedCount;
  }

  /**
   * Check if queue is empty
   *
   * @returns true if queue has no events
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Check if queue is full
   *
   * @returns true if queue is at max capacity
   */
  isFull(): boolean {
    return this.queue.length >= this.maxSize;
  }

  /**
   * Clear all queued events (for testing or error recovery)
   *
   * @returns Number of events cleared
   */
  clear(): number {
    const count = this.queue.length;
    this.queue = [];
    this.droppedCount = 0;
    this.logger.debug(`Queue cleared`, { eventsCleared: count });
    return count;
  }

  /**
   * Update max queue size
   *
   * @param newMaxSize - New maximum queue size
   */
  setMaxSize(newMaxSize: number): void {
    if (newMaxSize < 1) {
      this.logger.warn('Invalid max queue size, ignoring', { newMaxSize });
      return;
    }

    this.maxSize = newMaxSize;
    this.logger.debug('Max queue size updated', { maxSize: newMaxSize });

    // If current queue exceeds new max, log warning
    if (this.queue.length > newMaxSize) {
      this.logger.warn('Current queue size exceeds new max size', {
        currentSize: this.queue.length,
        newMaxSize,
      });
    }
  }
}
