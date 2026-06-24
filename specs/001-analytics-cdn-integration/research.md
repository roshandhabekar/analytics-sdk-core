# Research: Analytics SDK - Centralized CDN Integration Layer

**Purpose**: Resolve technical decisions and establish best practices for SDK implementation

**Date**: 2026-06-04

**Status**: Complete

---

## Research Questions

### 1. Module Federation Singleton Pattern

**Question**: How do we ensure a single SDK instance across webpack Module Federation host and remote applications?

**Research Findings**:

**Decision**: Use webpack shared singleton + window global fallback

**Rationale**:
- webpack ModuleFederationPlugin supports `shared` configuration with `singleton: true` and `strictVersion: false`
- Window global (`window.__ANALYTICS_SDK__`) provides failsafe when webpack module resolution fails
- Double-check pattern: Check window first, then create/store if not exists

**Implementation Pattern**:
```typescript
// Singleton enforcement in SDK core
class AnalyticsSDK {
  private static instance: AnalyticsSDK | null = null;
  
  static getInstance(): AnalyticsSDK {
    // Check window global first (Module Federation boundary)
    if (typeof window !== 'undefined' && window.__ANALYTICS_SDK__) {
      return window.__ANALYTICS_SDK__;
    }
    
    // Create new instance if none exists
    if (!AnalyticsSDK.instance) {
      AnalyticsSDK.instance = new AnalyticsSDK();
      if (typeof window !== 'undefined') {
        window.__ANALYTICS_SDK__ = AnalyticsSDK.instance;
      }
    }
    
    return AnalyticsSDK.instance;
  }
  
  private constructor() {
    // Prevent direct instantiation
  }
}
```

**Webpack Configuration**:
```javascript
// Module Federation config for host and remotes
new ModuleFederationPlugin({
  shared: {
    'analytics-sdk-core': {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^1.0.0'
    }
  }
})
```

**Alternatives Considered**:
- **Pure webpack shared**: Rejected - doesn't handle window boundary crossing reliably
- **Only window global**: Rejected - bypasses webpack module system benefits
- **Service worker singleton**: Rejected - too complex, limited browser support

**References**:
- webpack Module Federation documentation on singletons
- Micro-frontends.org patterns for shared dependencies

---

### 2. Dynamic CDN Script Loading

**Question**: What's the safest and most reliable way to dynamically inject third-party CDN scripts?

**Research Findings**:

**Decision**: Programmatic script element creation with Promise-based loading + registry tracking

**Rationale**:
- Creating script elements via `document.createElement('script')` is safer than `innerHTML` (prevents XSS)
- Promise wrapper around `onload`/`onerror` events enables async/await patterns
- Registry of loaded URLs prevents duplicate script tags
- Subresource Integrity (SRI) hashes when available add security

**Implementation Pattern**:
```typescript
class ScriptLoader {
  private loadedScripts: Map<string, Promise<void>> = new Map();
  
  async loadScript(url: string, integrity?: string): Promise<void> {
    // Return existing promise if already loading/loaded
    if (this.loadedScripts.has(url)) {
      return this.loadedScripts.get(url)!;
    }
    
    // Validate URL (HTTPS only)
    if (!url.startsWith('https://')) {
      throw new Error(`Invalid script URL: ${url}. Only HTTPS allowed.`);
    }
    
    // Create loading promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      if (integrity) {
        script.integrity = integrity;
        script.crossOrigin = 'anonymous';
      }
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      
      document.head.appendChild(script);
    });
    
    this.loadedScripts.set(url, loadPromise);
    return loadPromise;
  }
}
```

**Security Considerations**:
- Enforce HTTPS-only URLs
- Optional whitelist of allowed domains (e.g., `['googletagmanager.com', 'clevertap.com']`)
- Use SRI hashes when provided by vendors
- Never use `eval()` or `new Function()` with dynamic content
- Validate URLs against XSS injection patterns

**Error Handling**:
- Script load failures should log warning, mark provider as unavailable, continue with other providers
- Network timeouts handled by browser (typical 30s default)
- Retry logic optional (not in MVP)

**Alternatives Considered**:
- **innerHTML injection**: Rejected - XSS risk
- **Fetch + eval**: Rejected - CSP violations, security risk
- **Preloading all scripts**: Rejected - performance impact, defeats lazy loading

**References**:
- MDN: HTMLScriptElement
- OWASP: Dynamic Script Loading Security

---

### 3. Event Queueing Before Initialization

**Question**: How should we queue events tracked before SDK initialization completes?

**Research Findings**:

**Decision**: In-memory array queue with max size limit and FIFO replay

**Rationale**:
- Simple array provides FIFO ordering (first tracked = first replayed)
- Max size prevents memory overflow from runaway event tracking
- Replay after initialization ensures no events lost during bootstrap
- TypeScript ReadonlyArray enforces immutability for queued events

**Implementation Pattern**:
```typescript
class EventQueue {
  private queue: AnalyticsEvent[] = [];
  private readonly maxSize: number = 100;
  private isReplaying: boolean = false;
  
  enqueue(event: AnalyticsEvent): void {
    if (this.queue.length >= this.maxSize) {
      console.warn(`Event queue full (${this.maxSize}). Dropping oldest event.`);
      this.queue.shift(); // Remove oldest
    }
    this.queue.push({ ...event, queuedAt: Date.now() });
  }
  
  async replay(handler: (event: AnalyticsEvent) => Promise<void>): Promise<void> {
    if (this.isReplaying) return; // Prevent concurrent replay
    
    this.isReplaying = true;
    const eventsToReplay = [...this.queue]; // Copy for safe iteration
    this.queue = []; // Clear queue immediately
    
    for (const event of eventsToReplay) {
      try {
        await handler(event);
      } catch (error) {
        console.error('Error replaying event:', event, error);
      }
    }
    
    this.isReplaying = false;
  }
  
  size(): number {
    return this.queue.length;
  }
}
```

**Configuration**:
- `maxQueueSize`: Configurable via remote config (default 100)
- `queueTimeout`: Optional - auto-replay after X seconds even if init not complete (disabled by default)

**Edge Cases**:
- Queue overflow: Drop oldest events (FIFO eviction)
- Events tracked during replay: Add to queue, replayed in next cycle
- Initialization failure: Queue persists, events can be replayed when init retried

**Alternatives Considered**:
- **localStorage persistence**: Rejected - complexity, privacy concerns, not needed for short-lived queue
- **Discard events before init**: Rejected - violates "no event loss" requirement
- **Block until init**: Rejected - creates poor UX, delays application

**References**:
- Queue data structure patterns
- Event sourcing patterns

---

### 4. Provider Plugin Architecture

**Question**: What's the best TypeScript pattern for extensible provider plugins?

**Research Findings**:

**Decision**: Interface-based strategy pattern with async initialization + provider registry

**Rationale**:
- TypeScript interfaces enforce contract without implementation coupling
- Strategy pattern allows runtime provider selection based on config
- Async `init()` supports Promise-based CDN script loading
- Registry pattern centralizes provider lifecycle management

**Implementation Pattern**:
```typescript
// Provider interface contract
interface AnalyticsProvider {
  readonly name: string;
  readonly version: string;
  
  init(config: ProviderConfig): Promise<void>;
  track(event: AnalyticsEvent): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name?: string, properties?: Record<string, any>): void;
  isReady(): boolean;
}

// Provider registry
class ProviderRegistry {
  private providers: Map<string, AnalyticsProvider> = new Map();
  private enabledProviders: Set<string> = new Set();
  
  register(provider: AnalyticsProvider): void {
    this.providers.set(provider.name, provider);
  }
  
  async initializeProvider(name: string, config: ProviderConfig): Promise<void> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider not found: ${name}`);
    }
    
    try {
      await provider.init(config);
      this.enabledProviders.add(name);
    } catch (error) {
      console.error(`Failed to initialize provider ${name}:`, error);
      // Don't add to enabled set - provider is unavailable
    }
  }
  
  getEnabled(): AnalyticsProvider[] {
    return Array.from(this.enabledProviders)
      .map(name => this.providers.get(name)!)
      .filter(p => p.isReady());
  }
}

// Example provider implementation
class GoogleAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'google-analytics';
  readonly version = '1.0.0';
  private ready: boolean = false;
  
  async init(config: ProviderConfig): Promise<void> {
    const scriptLoader = new ScriptLoader();
    await scriptLoader.loadScript(config.scriptUrl);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.measurementId);
    
    this.ready = true;
  }
  
  track(event: AnalyticsEvent): void {
    if (!this.ready) {
      console.warn('GoogleAnalyticsProvider not ready');
      return;
    }
    window.gtag('event', event.name, event.properties);
  }
  
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.ready) return;
    window.gtag('config', { user_id: userId, ...traits });
  }
  
  page(name?: string, properties?: Record<string, any>): void {
    if (!this.ready) return;
    window.gtag('event', 'page_view', { page_title: name, ...properties });
  }
  
  isReady(): boolean {
    return this.ready;
  }
}
```

**Extensibility**:
- New providers implement `AnalyticsProvider` interface
- Register with `registry.register(new CustomProvider())`
- No core SDK changes required

**Error Isolation**:
- Each provider's `init()` wrapped in try-catch
- Provider init failures don't affect other providers
- Failed providers omitted from enabled set

**Alternatives Considered**:
- **Abstract base class**: Rejected - interfaces more flexible, avoid implementation inheritance
- **Dynamic provider loading (import())**: Deferred to future - adds complexity
- **Plugin discovery**: Rejected - requires build-time tooling, over-engineered for MVP

**References**:
- Gang of Four Strategy Pattern
- TypeScript handbook: Interfaces

---

### 5. Configuration Management

**Question**: How should we fetch, validate, cache, and refresh remote configuration?

**Research Findings**:

**Decision**: Fetch API + JSON schema validation + localStorage caching + optional polling

**Rationale**:
- Fetch API is modern, Promise-based, widely supported
- JSON schema validation (using Zod or class-validator) ensures type safety
- localStorage caching provides offline resilience
- Polling is opt-in via config (disabled by default for performance)

**Implementation Pattern**:
```typescript
interface SDKConfiguration {
  enabled: boolean;
  debug: boolean;
  queueTimeout: number;
  maxQueueSize: number;
  providers: ProviderConfiguration[];
  enrichment?: EnrichmentConfig;
  routing?: RoutingRule[];
}

class ConfigManager {
  private config: SDKConfiguration | null = null;
  private readonly cacheKey = 'analytics-sdk-config';
  
  async fetchConfig(url: string): Promise<SDKConfiguration> {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Config fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      const validated = this.validateConfig(data);
      
      // Cache for offline resilience
      this.cacheConfig(validated);
      this.config = validated;
      
      return validated;
    } catch (error) {
      console.error('Failed to fetch config:', error);
      // Fallback to cached config
      return this.getCachedConfig() || this.getDefaultConfig();
    }
  }
  
  private validateConfig(data: any): SDKConfiguration {
    // Use Zod schema validation
    return configSchema.parse(data);
  }
  
  private cacheConfig(config: SDKConfiguration): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(config));
      localStorage.setItem(`${this.cacheKey}-timestamp`, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache config:', error);
    }
  }
  
  private getCachedConfig(): SDKConfiguration | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
  
  private getDefaultConfig(): SDKConfiguration {
    return {
      enabled: false, // Safe default - disable all tracking
      debug: false,
      queueTimeout: 5000,
      maxQueueSize: 100,
      providers: []
    };
  }
  
  async startPolling(url: string, intervalMs: number): Promise<void> {
    setInterval(async () => {
      await this.fetchConfig(url);
      // Emit config change event for SDK to react
    }, intervalMs);
  }
}
```

**Validation Schema** (using Zod):
```typescript
import { z } from 'zod';

const providerConfigSchema = z.object({
  provider: z.string(),
  enabled: z.boolean(),
  scriptUrl: z.string().url().startsWith('https://'),
  config: z.record(z.any())
});

const configSchema = z.object({
  enabled: z.boolean(),
  debug: z.boolean().optional().default(false),
  queueTimeout: z.number().positive().optional().default(5000),
  maxQueueSize: z.number().positive().optional().default(100),
  providers: z.array(providerConfigSchema)
});
```

**Configuration Refresh**:
- Polling interval configurable (e.g., 300000ms = 5 minutes)
- Emit events when config changes to reinitialize providers
- Graceful degradation: Keep using old config if refresh fails

**Alternatives Considered**:
- **WebSocket live config**: Deferred to future - adds complexity
- **No caching**: Rejected - breaks offline resilience
- **Runtime schema generation**: Rejected - Zod/class-validator provide better DX

**References**:
- Zod documentation
- Fetch API specification
- localStorage best practices

---

### 6. Angular Integration Pattern

**Question**: How should we wrap the SDK for Angular dependency injection?

**Research Findings**:

**Decision**: Injectable service with `providedIn: 'root'` + APP_INITIALIZER for early init

**Rationale**:
- `providedIn: 'root'` ensures Angular creates singleton service
- APP_INITIALIZER runs before app bootstrap, ideal for SDK initialization
- Observable-based API aligns with Angular patterns
- Injection token allows configuration override

**Implementation Pattern**:
```typescript
// analytics.config.ts
export interface AnalyticsConfig {
  configUrl: string;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('ANALYTICS_CONFIG');

// analytics.service.ts
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private sdk: AnalyticsSDK;
  private initialized = false;
  
  constructor(@Inject(ANALYTICS_CONFIG) private config: AnalyticsConfig) {
    this.sdk = AnalyticsSDK.getInstance();
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await this.sdk.init(this.config.configUrl);
    
    if (this.config.enablePolling) {
      await this.sdk.startConfigPolling(this.config.pollingInterval || 300000);
    }
    
    this.initialized = true;
  }
  
  track(eventName: string, properties?: Record<string, any>): void {
    this.sdk.track({ name: eventName, properties });
  }
  
  identify(userId: string, traits?: Record<string, any>): void {
    this.sdk.identify(userId, traits);
  }
  
  page(name?: string, properties?: Record<string, any>): void {
    this.sdk.page(name, properties);
  }
}

// analytics.module.ts
@NgModule()
export class AnalyticsModule {
  static forRoot(config: AnalyticsConfig): ModuleWithProviders<AnalyticsModule> {
    return {
      ngModule: AnalyticsModule,
      providers: [
        { provide: ANALYTICS_CONFIG, useValue: config },
        AnalyticsService,
        {
          provide: APP_INITIALIZER,
          useFactory: (analytics: AnalyticsService) => () => analytics.initialize(),
          deps: [AnalyticsService],
          multi: true
        }
      ]
    };
  }
}

// Host app usage
@NgModule({
  imports: [
    AnalyticsModule.forRoot({
      configUrl: 'https://api.example.com/analytics-config',
      enablePolling: true
    })
  ]
})
export class AppModule {}

// Remote app usage (reuses singleton)
@NgModule({
  imports: [
    AnalyticsModule.forRoot({
      configUrl: 'https://api.example.com/analytics-config'
    })
  ]
})
export class RemoteAppModule {}
```

**Module Federation Consideration**:
- Both host and remote import AnalyticsModule
- Service singleton ensured by Angular DI + SDK singleton pattern
- First app to initialize wins (subsequent inits are no-ops)

**Alternatives Considered**:
- **Factory provider**: Rejected - APP_INITIALIZER more explicit
- **Standalone service (no module)**: Possible in Angular 14+, but module provides better encapsulation
- **Observable-based events**: Deferred to future - fire-and-forget sufficient for MVP

**References**:
- Angular DI documentation
- APP_INITIALIZER patterns

---

### 7. Error Handling Strategy

**Question**: How do we ensure provider errors never crash the host application?

**Research Findings**:

**Decision**: Comprehensive try-catch wrapping + error boundary pattern + logging

**Rationale**:
- Every external call (script load, provider init, event track) wrapped in try-catch
- Errors logged to console (debug mode) or monitoring service
- Failed providers isolated - other providers continue to work
- SDK never throws to application code

**Implementation Pattern**:
```typescript
class AnalyticsSDK {
  async init(configUrl: string): Promise<void> {
    try {
      const config = await this.configManager.fetchConfig(configUrl);
      
      for (const providerConfig of config.providers) {
        if (!providerConfig.enabled) continue;
        
        try {
          await this.initializeProvider(providerConfig);
        } catch (error) {
          this.logger.error(`Provider ${providerConfig.provider} init failed:`, error);
          // Continue with other providers
        }
      }
    } catch (error) {
      this.logger.error('SDK initialization failed:', error);
      // SDK continues to function with default/cached config
    }
  }
  
  track(event: AnalyticsEvent): void {
    try {
      const providers = this.registry.getEnabled();
      
      for (const provider of providers) {
        try {
          provider.track(event);
        } catch (error) {
          this.logger.error(`Provider ${provider.name} track failed:`, error);
          // Continue with other providers
        }
      }
    } catch (error) {
      this.logger.error('Event tracking failed:', error);
      // Fail silently - never throw to app
    }
  }
}
```

**Error Categories**:
1. **Critical** (init failures): Log, use fallback config, disable all providers
2. **Provider** (individual provider failures): Log, disable that provider, continue
3. **Tracking** (event send failures): Log, continue (event already queued/sent)

**Logging Strategy**:
- Debug mode: Verbose console.log
- Production: console.error only for critical failures
- Optional: Send errors to monitoring service (Sentry, AppInsights)

**Alternatives Considered**:
- **Throw errors**: Rejected - violates fail-safe requirement
- **Silent failures**: Rejected - need logging for debugging
- **Error events**: Possible future enhancement for app-level handling

**References**:
- Fail-safe design patterns
- Error boundary patterns

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| **Singleton** | webpack shared + window global fallback | Cross-boundary reliability |
| **Script Loading** | Programmatic createElement + Promise + registry | Security + idempotency |
| **Event Queue** | In-memory array, max 100, FIFO | Simple, reliable, bounded memory |
| **Provider Pattern** | Interface + Strategy + Registry | Extensibility + isolation |
| **Configuration** | Fetch + Zod validation + localStorage cache | Type safety + offline resilience |
| **Angular Integration** | Injectable + APP_INITIALIZER | Early init + DI singleton |
| **Error Handling** | Comprehensive try-catch + logging | Fail-safe, never crash app |

All decisions align with constitutional principles and support P1 MVP user stories.
