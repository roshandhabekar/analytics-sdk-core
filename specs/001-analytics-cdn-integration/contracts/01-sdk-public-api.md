# SDK Public API Contract

**Purpose**: Define the public API surface that applications use to interact with the Analytics SDK

**Audience**: Application developers integrating the SDK

**Version**: 1.0.0

---

## Core SDK API

### AnalyticsSDK.getInstance()

**Purpose**: Get or create the singleton SDK instance

**Signature**:
```typescript
static getInstance(): AnalyticsSDK
```

**Returns**: The singleton `AnalyticsSDK` instance

**Behavior**:
- First call creates the instance and stores in `window.__ANALYTICS_SDK__`
- Subsequent calls return the existing instance
- Thread-safe across Module Federation boundaries

**Example**:
```typescript
import { AnalyticsSDK } from 'analytics-sdk-core';

const sdk = AnalyticsSDK.getInstance();
```

---

### init(configUrl)

**Purpose**: Initialize the SDK with configuration from remote API

**Signature**:
```typescript
init(configUrl: string, options?: InitOptions): Promise<void>
```

**Parameters**:
- `configUrl`: HTTPS URL to remote configuration API
- `options` (optional):
  - `enablePolling?: boolean` - Enable automatic config refresh (default: false)
  - `pollingInterval?: number` - Polling interval in milliseconds (default: 300000 = 5min)
  - `timeout?: number` - Config fetch timeout in milliseconds (default: 10000)

**Returns**: Promise that resolves when initialization completes

**Behavior**:
- Fetches configuration from `configUrl`
- Validates configuration schema
- Initializes enabled providers
- Replays queued events
- Idempotent: Multiple calls are safe (subsequent calls are no-ops)

**Errors**:
- Never throws - all errors logged and handled gracefully
- Falls back to cached config or safe defaults on failure

**Example**:
```typescript
await sdk.init('https://api.example.com/analytics-config', {
  enablePolling: true,
  pollingInterval: 300000 // 5 minutes
});
```

---

### track(event)

**Purpose**: Track an analytics event

**Signature**:
```typescript
track(event: AnalyticsEvent): void
track(eventName: string, properties?: Record<string, any>): void
```

**Parameters**:
- `event`: Full event object with name, properties, metadata
- OR `eventName`: Event name string + optional `properties` object

**Returns**: void (fire-and-forget)

**Behavior**:
- If SDK not initialized: Event is queued
- If SDK initialized: Event is enriched and routed to all enabled providers
- Never blocks - always returns immediately
- Errors are logged, never thrown

**Example**:
```typescript
// Option 1: Object syntax
sdk.track({
  name: 'button_click',
  properties: { button_id: 'checkout', page: '/cart' }
});

// Option 2: String syntax
sdk.track('button_click', { button_id: 'checkout', page: '/cart' });
```

---

### identify(userId, traits)

**Purpose**: Identify the current user

**Signature**:
```typescript
identify(userId: string, traits?: Record<string, any>): void
```

**Parameters**:
- `userId`: Unique user identifier
- `traits` (optional): User attributes (name, email, plan, etc.)

**Returns**: void

**Behavior**:
- Sends user identification to all enabled providers
- Traits are provider-specific (e.g., Google Analytics user properties)
- If SDK not initialized: Queued as a special "identify" event

**Example**:
```typescript
sdk.identify('user_123', {
  email: 'user@example.com',
  plan: 'premium',
  signupDate: '2026-01-15'
});
```

---

### page(name, properties)

**Purpose**: Track a page view

**Signature**:
```typescript
page(name?: string, properties?: Record<string, any>): void
```

**Parameters**:
- `name` (optional): Page name or title
- `properties` (optional): Page metadata (url, referrer, etc.)

**Returns**: void

**Behavior**:
- Sends page view event to all enabled providers
- Auto-detects current URL if not provided in properties
- If SDK not initialized: Queued

**Example**:
```typescript
sdk.page('Checkout', {
  url: '/checkout',
  referrer: '/cart',
  category: 'ecommerce'
});
```

---

### registerProvider(provider)

**Purpose**: Register a custom analytics provider plugin

**Signature**:
```typescript
registerProvider(provider: AnalyticsProvider): void
```

**Parameters**:
- `provider`: Instance of a class implementing `AnalyticsProvider` interface

**Returns**: void

**Behavior**:
- Adds provider to the registry
- Provider must implement required interface methods
- Provider will be initialized if enabled in configuration

**Example**:
```typescript
import { CustomProvider } from './custom-provider';

sdk.registerProvider(new CustomProvider());
```

---

### setLoggerHooks(hooks)

**Purpose**: Register observability/monitoring hooks

**Signature**:
```typescript
setLoggerHooks(hooks: LoggerHooks): void
```

**Parameters**:
- `hooks`: Object with optional callback functions

**Hooks Interface**:
```typescript
interface LoggerHooks {
  onEventTracked?: (event: AnalyticsEvent, providers: string[]) => void;
  onProviderError?: (provider: string, error: Error) => void;
  onConfigLoaded?: (config: SDKConfiguration) => void;
  onScriptLoaded?: (url: string) => void;
}
```

**Example**:
```typescript
sdk.setLoggerHooks({
  onEventTracked: (event, providers) => {
    console.log(`Event ${event.name} sent to`, providers);
  },
  onProviderError: (provider, error) => {
    sendToMonitoring({ provider, error });
  }
});
```

---

### getProviders()

**Purpose**: Get list of enabled provider names

**Signature**:
```typescript
getProviders(): string[]
```

**Returns**: Array of enabled provider names (e.g., `['google-analytics', 'clevertap']`)

**Example**:
```typescript
const enabledProviders = sdk.getProviders();
console.log('Active providers:', enabledProviders);
```

---

### isInitialized()

**Purpose**: Check if SDK initialization is complete

**Signature**:
```typescript
isInitialized(): boolean
```

**Returns**: `true` if SDK is initialized and ready, `false` otherwise

**Example**:
```typescript
if (sdk.isInitialized()) {
  console.log('SDK ready to track events');
}
```

---

## TypeScript Type Definitions

### AnalyticsEvent

```typescript
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  metadata?: {
    appName?: string;
    mfeName?: string;
    sdkVersion: string;
    [key: string]: any;
  };
}
```

### InitOptions

```typescript
interface InitOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  timeout?: number;
}
```

### SDKConfiguration

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
```

---

## Angular Service API

### AnalyticsService (Injectable)

**Import**:
```typescript
import { AnalyticsService, AnalyticsModule } from 'analytics-sdk-angular';
```

**Module Setup**:
```typescript
@NgModule({
  imports: [
    AnalyticsModule.forRoot({
      configUrl: 'https://api.example.com/analytics-config',
      enablePolling: true
    })
  ]
})
export class AppModule {}
```

**Service Methods** (same as core SDK):
- `track(eventName: string, properties?: object): void`
- `identify(userId: string, traits?: object): void`
- `page(name?: string, properties?: object): void`

**Usage**:
```typescript
@Component({ /* ... */ })
export class CheckoutComponent {
  constructor(private analytics: AnalyticsService) {}
  
  onCheckoutClick() {
    this.analytics.track('checkout_started', {
      cart_value: 99.99
    });
  }
}
```

---

## Error Handling Guarantee

**Contract**: The SDK NEVER throws exceptions to application code.

All errors are:
1. Caught internally
2. Logged to console (debug mode) or monitoring hooks
3. Handled gracefully (fallback to safe defaults)

**Application Impact**: Zero. Analytics failures do not affect application functionality.

---

## Performance Guarantees

| Metric | Guarantee |
|--------|-----------|
| Initialization time | <500ms (excluding external script loads) |
| `track()` call overhead | <1ms synchronous, rest async |
| Bundle size (core) | <20KB gzipped |
| Memory footprint | <100KB baseline, <500KB with all providers |
| Time to Interactive impact | +0-50ms |

---

## Versioning

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to public API or provider interface
- **MINOR**: New features, new providers (backward compatible)
- **PATCH**: Bug fixes, performance improvements

**Compatibility**: Backward compatible within major versions. Configuration schema versioned separately.

---

## Module Federation Compatibility

**Guarantee**: Single SDK instance across host + all remote microfrontends

**webpack Configuration Required**:
```javascript
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

**Behavior**:
- First module to load creates the singleton
- Subsequent modules reuse the existing instance
- Events from any module route through the singleton
- Only one set of provider scripts loaded
