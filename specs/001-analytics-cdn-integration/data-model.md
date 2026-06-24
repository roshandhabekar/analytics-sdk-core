# Data Model: Analytics SDK - Centralized CDN Integration Layer

**Purpose**: Define core entities, relationships, and state management for the Analytics SDK

**Date**: 2026-06-04

**Status**: Complete

---

## Core Entities

### 1. AnalyticsSDK (Singleton)

**Purpose**: Main SDK instance that orchestrates all analytics functionality

**Attributes**:
- `instance: AnalyticsSDK | null` - Static singleton instance
- `initialized: boolean` - Tracks initialization state
- `configUrl: string` - Remote configuration endpoint URL
- `providerRegistry: ProviderRegistry` - Manages all providers
- `eventQueue: EventQueue` - Queues events before initialization
- `eventRouter: EventRouter` - Routes events to providers
- `configManager: ConfigManager` - Fetches and manages configuration
- `scriptLoader: ScriptLoader` - Loads external CDN scripts
- `logger: Logger` - Handles logging and observability

**State Transitions**:
```
[Uninitialized] 
    ↓ init(configUrl)
[Fetching Config]
    ↓ config loaded
[Initializing Providers]
    ↓ providers ready
[Ready] ← can accept track() calls
    ↓ optional: config refresh
[Updating Config] → [Ready]
```

**Key Methods**:
- `static getInstance(): AnalyticsSDK` - Get/create singleton
- `init(configUrl: string): Promise<void>` - Initialize SDK
- `track(event: AnalyticsEvent): void` - Track analytics event
- `identify(userId: string, traits?: object): void` - Identify user
- `page(name?: string, properties?: object): void` - Track page view

**Validation Rules**:
- `init()` can be called multiple times (idempotent)
- Only first `init()` call processes, subsequent calls return immediately
- Events tracked before initialization are queued
- Maximum one instance per window (enforced via `window.__ANALYTICS_SDK__`)

---

### 2. SDKConfiguration

**Purpose**: Runtime configuration fetched from remote API

**Attributes**:
- `enabled: boolean` - Master switch for all analytics
- `debug: boolean` - Enable verbose logging
- `queueTimeout: number` - Max time to queue events (ms)
- `maxQueueSize: number` - Max events in queue before overflow
- `providers: ProviderConfiguration[]` - Array of provider configs
- `enrichment?: EnrichmentConfig` - Event enrichment settings
- `routing?: RoutingRule[]` - Event routing rules
- `schemaVersion?: string` - Configuration schema version

**Relationships**:
- Contains 0..n `ProviderConfiguration` objects
- Referenced by `ConfigManager`

**Validation Rules**:
- `enabled` is required (boolean)
- `queueTimeout` must be > 0
- `maxQueueSize` must be > 0 and <= 1000
- `providers` must be an array (can be empty)
- Schema validation enforced via Zod

**JSON Schema**:
```json
{
  "enabled": true,
  "debug": false,
  "queueTimeout": 5000,
  "maxQueueSize": 100,
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "https://www.googletagmanager.com/gtag/js?id=GA_ID",
      "config": {
        "measurementId": "G-XXXXXXXXXX"
      }
    }
  ]
}
```

---

### 3. ProviderConfiguration

**Purpose**: Configuration for a single analytics provider

**Attributes**:
- `provider: string` - Provider identifier (e.g., "google-analytics", "clevertap")
- `enabled: boolean` - Enable/disable this provider
- `scriptUrl: string` - HTTPS URL to provider's CDN script
- `config: Record<string, any>` - Provider-specific settings
- `integrity?: string` - Optional SRI hash for script verification
- `priority?: number` - Optional loading priority (lower = first)

**Relationships**:
- Belongs to `SDKConfiguration` (composition)
- Maps to `AnalyticsProvider` implementation

**Validation Rules**:
- `provider` must be non-empty string
- `enabled` is required (boolean)
- `scriptUrl` must be HTTPS URL
- `scriptUrl` must pass whitelist validation (if whitelist configured)
- `config` is provider-specific, validated by provider implementation

---

### 4. AnalyticsProvider (Interface)

**Purpose**: Contract that all provider plugins must implement

**Attributes**:
- `readonly name: string` - Provider identifier
- `readonly version: string` - Provider plugin version

**Methods** (contract):
- `init(config: ProviderConfig): Promise<void>` - Initialize provider with config
- `track(event: AnalyticsEvent): void` - Send tracking event
- `identify(userId: string, traits?: object): void` - Identify user
- `page(name?: string, properties?: object): void` - Track page view
- `isReady(): boolean` - Check if provider is ready to accept events

**Implementations**:
- `GoogleAnalyticsProvider` - Google Analytics 4 integration
- `CleverTapProvider` - CleverTap engagement platform integration
- [Future providers implement this interface]

**State** (per provider):
```
[Not Loaded]
    ↓ init() called
[Loading Script]
    ↓ script loaded
[Initializing]
    ↓ provider API ready
[Ready] ← isReady() = true
    ↓ init() error
[Failed] ← isReady() = false
```

---

### 5. AnalyticsEvent

**Purpose**: Standardized event structure sent to providers

**Attributes**:
- `name: string` - Event name (e.g., "page_view", "button_click", "purchase")
- `properties?: Record<string, any>` - Event-specific data
- `timestamp: number` - Event timestamp (Unix ms)
- `sessionId?: string` - Session identifier (if available)
- `userId?: string` - User identifier (if known)
- `metadata?: EventMetadata` - Auto-enriched metadata

**Metadata** (auto-enriched):
- `appName?: string` - Application name
- `mfeName?: string` - Microfrontend name (if Module Federation)
- `sdkVersion: string` - Analytics SDK version
- `queuedAt?: number` - Timestamp when queued (if queued before init)

**Validation Rules**:
- `name` is required and must be non-empty string
- `properties` must be JSON-serializable object
- `timestamp` auto-generated if not provided
- Event name convention: snake_case recommended

**Example**:
```typescript
{
  name: "button_click",
  properties: {
    button_id: "checkout",
    page: "/cart"
  },
  timestamp: 1717545600000,
  sessionId: "abc123",
  metadata: {
    appName: "ecommerce",
    mfeName: "checkout",
    sdkVersion: "1.0.0"
  }
}
```

---

### 6. ProviderRegistry

**Purpose**: Manages lifecycle and collection of provider instances

**Attributes**:
- `providers: Map<string, AnalyticsProvider>` - All registered providers
- `enabledProviders: Set<string>` - Providers successfully initialized
- `failedProviders: Set<string>` - Providers that failed initialization

**Relationships**:
- Contains 0..n `AnalyticsProvider` instances
- Referenced by `AnalyticsSDK`

**Methods**:
- `register(provider: AnalyticsProvider): void` - Register provider plugin
- `initializeProvider(name: string, config: ProviderConfig): Promise<void>` - Init provider
- `getEnabled(): AnalyticsProvider[]` - Get all ready providers
- `getProvider(name: string): AnalyticsProvider | undefined` - Get specific provider
- `isEnabled(name: string): boolean` - Check if provider is enabled

**Validation Rules**:
- Provider names must be unique
- Cannot register provider with same name twice
- Init failures mark provider as failed but don't throw

---

### 7. EventQueue

**Purpose**: Queue events before SDK initialization completes

**Attributes**:
- `queue: AnalyticsEvent[]` - Array of queued events
- `maxSize: number` - Maximum queue capacity (from config)
- `isReplaying: boolean` - Prevents concurrent replay

**Methods**:
- `enqueue(event: AnalyticsEvent): void` - Add event to queue
- `replay(handler: (event) => Promise<void>): Promise<void>` - Replay all queued events
- `size(): number` - Current queue size
- `clear(): void` - Clear queue (if needed)

**Behavior**:
- FIFO ordering: First queued = first replayed
- Overflow: Drop oldest event when max size reached
- Replay: Process all events, clear queue, handle errors gracefully

**State Transitions**:
```
[Empty] → enqueue() → [Has Events] → replay() → [Empty]
                           ↓
                      enqueue() → [At Max] → enqueue() → [At Max] (oldest dropped)
```

---

### 8. EventRouter

**Purpose**: Route events to appropriate providers based on rules

**Attributes**:
- `routingRules: RoutingRule[]` - Optional event routing rules
- `enrichers: EventEnricher[]` - Event enrichment functions

**Methods**:
- `route(event: AnalyticsEvent, providers: AnalyticsProvider[]): void` - Route to providers
- `enrich(event: AnalyticsEvent): AnalyticsEvent` - Add metadata
- `shouldRouteToProvider(event: AnalyticsEvent, provider: string): boolean` - Check routing rules

**Routing Rules** (optional):
```typescript
interface RoutingRule {
  eventNamePattern: string | RegExp;  // Event name matcher
  providers: string[];                 // Provider whitelist
  exclude?: string[];                  // Provider blacklist
}

// Example: Send "purchase" events only to CleverTap
{
  eventNamePattern: "purchase",
  providers: ["clevertap"],
  exclude: ["google-analytics"]
}
```

---

### 9. ConfigManager

**Purpose**: Fetch, validate, cache, and refresh configuration

**Attributes**:
- `config: SDKConfiguration | null` - Current configuration
- `cacheKey: string` - localStorage cache key
- `pollingIntervalId: number | null` - Polling timer ID

**Methods**:
- `fetchConfig(url: string): Promise<SDKConfiguration>` - Fetch from remote API
- `validateConfig(data: any): SDKConfiguration` - Validate using Zod schema
- `cacheConfig(config: SDKConfiguration): void` - Store in localStorage
- `getCachedConfig(): SDKConfiguration | null` - Retrieve from cache
- `getDefaultConfig(): SDKConfiguration` - Safe fallback config
- `startPolling(url: string, interval: number): void` - Enable config refresh

**Caching Strategy**:
- Store in localStorage after successful fetch
- Include timestamp for staleness detection
- Use cached config if fetch fails
- Use default config (all providers disabled) if no cache

---

### 10. ScriptLoader

**Purpose**: Dynamically load third-party CDN scripts

**Attributes**:
- `loadedScripts: Map<string, Promise<void>>` - Registry of loaded/loading scripts
- `whitelist?: string[]` - Optional domain whitelist

**Methods**:
- `loadScript(url: string, integrity?: string): Promise<void>` - Load script
- `isLoaded(url: string): boolean` - Check if script already loaded
- `validateUrl(url: string): boolean` - Validate HTTPS and whitelist

**Script Loading Rules**:
- Only HTTPS URLs allowed
- Check registry before creating script tag (idempotent)
- Return existing Promise if already loading
- Append script to `<head>`
- Use SRI integrity hash if provided

---

### 11. Logger

**Purpose**: Centralized logging and observability

**Attributes**:
- `debug: boolean` - Debug mode enabled
- `hooks: LoggerHooks` - Optional monitoring hooks

**Methods**:
- `log(message: string, ...args): void` - Info logging
- `warn(message: string, ...args): void` - Warning logging
- `error(message: string, ...args): void` - Error logging
- `debug(message: string, ...args): void` - Debug logging (only if debug=true)

**Observability Hooks** (optional):
```typescript
interface LoggerHooks {
  onEventTracked?: (event: AnalyticsEvent, providers: string[]) => void;
  onProviderError?: (provider: string, error: Error) => void;
  onConfigLoaded?: (config: SDKConfiguration) => void;
  onScriptLoaded?: (url: string) => void;
}
```

---

## Entity Relationships

```
AnalyticsSDK (singleton)
    ├── owns: ConfigManager
    │   └── manages: SDKConfiguration
    │       └── contains: ProviderConfiguration[] (0..n)
    ├── owns: ProviderRegistry
    │   └── manages: AnalyticsProvider[] (0..n)
    │       ├── GoogleAnalyticsProvider
    │       └── CleverTapProvider
    ├── owns: EventQueue
    │   └── stores: AnalyticsEvent[] (0..maxSize)
    ├── owns: EventRouter
    │   └── uses: RoutingRule[] (optional)
    ├── owns: ScriptLoader
    └── owns: Logger
        └── emits to: LoggerHooks (optional)
```

---

## State Management

### SDK Initialization Flow

```
1. getInstance() → Check window.__ANALYTICS_SDK__ → Create if not exists
2. init(configUrl) → ConfigManager.fetchConfig(url)
3. Config received → Validate schema → Cache to localStorage
4. For each ProviderConfiguration:
   a. If enabled: ProviderRegistry.initializeProvider()
   b. ScriptLoader.loadScript(scriptUrl)
   c. Provider.init(config)
   d. On success: Add to enabledProviders
   e. On failure: Log error, continue with next provider
5. EventQueue.replay() → Send queued events to enabled providers
6. SDK state: Ready
```

### Event Tracking Flow

```
1. app calls sdk.track(event)
2. If !initialized: EventQueue.enqueue(event)
3. If initialized:
   a. EventRouter.enrich(event) → Add metadata
   b. EventRouter.route(event, providers)
   c. For each enabled provider:
      - try: provider.track(event)
      - catch: Log error, continue with next provider
```

### Configuration Refresh Flow (Optional)

```
1. Polling timer triggers every N minutes
2. ConfigManager.fetchConfig(url)
3. New config received → Compare with current
4. If providers changed:
   a. Disable removed providers
   b. Initialize new providers
   c. Update existing provider configs
5. SDK continues operating with new config
```

---

## Validation Rules Summary

| Entity | Key Constraints |
|--------|----------------|
| **AnalyticsSDK** | Only one instance per window; init is idempotent |
| **SDKConfiguration** | enabled, queueTimeout, maxQueueSize required; maxQueueSize <= 1000 |
| **ProviderConfiguration** | scriptUrl must be HTTPS; provider name non-empty |
| **AnalyticsEvent** | name is required; properties must be JSON-serializable |
| **EventQueue** | Max size enforced; FIFO eviction on overflow |
| **ScriptLoader** | HTTPS only; whitelist validation; duplicate prevention |
| **ConfigManager** | Schema validation via Zod; fallback to cache or defaults |

---

## Performance Characteristics

| Entity | Memory Footprint | Performance Impact |
|--------|-----------------|-------------------|
| **AnalyticsSDK** | <5KB baseline | One-time initialization |
| **EventQueue** | ~1KB per 10 events | O(n) replay, bounded by maxSize |
| **ProviderRegistry** | ~1KB per provider | O(n) iteration on event track |
| **ConfigManager** | ~5KB cached config | One-time fetch, optional polling |
| **ScriptLoader** | ~100 bytes per script | Async loads, non-blocking |

**Total**: <20KB core SDK + ~5-10KB per provider plugin (lazy-loaded)
