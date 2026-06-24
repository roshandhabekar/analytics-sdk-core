# Provider Plugin Interface Contract

**Purpose**: Define the interface that all analytics provider plugins must implement

**Audience**: Provider plugin developers (internal or third-party)

**Version**: 1.0.0

---

## Interface Definition

### AnalyticsProvider (TypeScript Interface)

```typescript
interface AnalyticsProvider {
  // Identification
  readonly name: string;
  readonly version: string;
  
  // Lifecycle methods
  init(config: ProviderConfig): Promise<void>;
  
  // Tracking methods
  track(event: AnalyticsEvent): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name?: string, properties?: Record<string, any>): void;
  
  // Status
  isReady(): boolean;
}
```

---

## Required Properties

### name: string

**Purpose**: Unique identifier for the provider

**Contract**:
- MUST be a non-empty string
- MUST match the provider identifier in configuration
- SHOULD use kebab-case (e.g., "google-analytics", "clevertap")
- MUST be unique across all registered providers

**Example**:
```typescript
readonly name = 'google-analytics';
```

---

### version: string

**Purpose**: Provider plugin version

**Contract**:
- MUST follow semantic versioning (e.g., "1.0.0")
- Used for debugging and compatibility checks

**Example**:
```typescript
readonly version = '1.0.0';
```

---

## Required Methods

### init(config): Promise<void>

**Purpose**: Initialize the provider with configuration

**Signature**:
```typescript
init(config: ProviderConfig): Promise<void>
```

**Parameters**:
- `config`: Provider-specific configuration object

**ProviderConfig Type**:
```typescript
interface ProviderConfig {
  scriptUrl: string;           // CDN script URL
  integrity?: string;          // Optional SRI hash
  [key: string]: any;          // Provider-specific settings
}
```

**Contract**:
- MUST be asynchronous (return Promise)
- MUST load required external scripts via `scriptUrl`
- MUST initialize provider's global API
- MUST set internal ready state to `true` on success
- MAY throw errors - SDK will catch and log
- SHOULD use ScriptLoader if available, or implement idempotent loading
- MUST complete within reasonable time (<30 seconds)

**Example** (Google Analytics):
```typescript
async init(config: ProviderConfig): Promise<void> {
  // Load gtag script
  await this.loadScript(config.scriptUrl);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', config.measurementId);
  
  this.ready = true;
}
```

---

### track(event): void

**Purpose**: Send an analytics event to the provider

**Signature**:
```typescript
track(event: AnalyticsEvent): void
```

**Parameters**:
- `event`: Standardized event object

**AnalyticsEvent Type**:
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

**Contract**:
- MUST handle events even if provider not fully ready (queue or drop gracefully)
- MUST NOT throw exceptions - wrap in try-catch
- SHOULD return immediately (fire-and-forget)
- MAY transform event to provider-specific format
- MAY filter events based on provider capabilities

**Example** (Google Analytics):
```typescript
track(event: AnalyticsEvent): void {
  if (!this.ready) {
    console.warn('GoogleAnalyticsProvider not ready, dropping event');
    return;
  }
  
  try {
    window.gtag('event', event.name, {
      ...event.properties,
      event_category: event.metadata?.appName,
      event_label: event.metadata?.mfeName
    });
  } catch (error) {
    console.error('GA track error:', error);
  }
}
```

---

### identify(userId, traits?): void

**Purpose**: Identify the current user

**Signature**:
```typescript
identify(userId: string, traits?: Record<string, any>): void
```

**Parameters**:
- `userId`: Unique user identifier (required)
- `traits`: Optional user attributes

**Contract**:
- MUST accept userId as string
- MUST handle missing traits gracefully
- MUST NOT throw exceptions
- MAY store userId for future events
- MAY send to provider's user identification API

**Example** (Google Analytics):
```typescript
identify(userId: string, traits?: Record<string, any>): void {
  if (!this.ready) return;
  
  try {
    window.gtag('set', { user_id: userId });
    if (traits) {
      window.gtag('set', 'user_properties', traits);
    }
  } catch (error) {
    console.error('GA identify error:', error);
  }
}
```

---

### page(name?, properties?): void

**Purpose**: Track a page view

**Signature**:
```typescript
page(name?: string, properties?: Record<string, any>): void
```

**Parameters**:
- `name`: Optional page name or title
- `properties`: Optional page metadata (url, referrer, etc.)

**Contract**:
- MUST handle missing parameters (use defaults)
- MUST NOT throw exceptions
- SHOULD auto-detect current URL if not provided
- MAY treat as a special tracking event

**Example** (Google Analytics):
```typescript
page(name?: string, properties?: Record<string, any>): void {
  if (!this.ready) return;
  
  try {
    window.gtag('event', 'page_view', {
      page_title: name || document.title,
      page_location: properties?.url || window.location.href,
      page_referrer: properties?.referrer || document.referrer,
      ...properties
    });
  } catch (error) {
    console.error('GA page error:', error);
  }
}
```

---

### isReady(): boolean

**Purpose**: Check if provider is initialized and ready to accept events

**Signature**:
```typescript
isReady(): boolean
```

**Returns**: `true` if provider is ready, `false` otherwise

**Contract**:
- MUST return boolean
- MUST return `true` only after successful initialization
- MUST return `false` if initialization failed
- MUST be synchronous (no async/await)

**Example**:
```typescript
private ready: boolean = false;

isReady(): boolean {
  return this.ready;
}
```

---

## Implementation Guidelines

### Error Handling

**Rule**: Providers MUST NEVER throw uncaught exceptions

**Pattern**:
```typescript
track(event: AnalyticsEvent): void {
  if (!this.ready) {
    console.warn(`${this.name} not ready`);
    return;
  }
  
  try {
    // Provider-specific tracking code
    this.sendToProvider(event);
  } catch (error) {
    console.error(`${this.name} track error:`, error);
    // Do NOT re-throw
  }
}
```

---

### State Management

**Rule**: Providers MUST track their own ready state

**Pattern**:
```typescript
class MyProvider implements AnalyticsProvider {
  private ready: boolean = false;
  private config: ProviderConfig | null = null;
  
  async init(config: ProviderConfig): Promise<void> {
    this.config = config;
    // Load script, initialize API
    this.ready = true;
  }
  
  isReady(): boolean {
    return this.ready && this.config !== null;
  }
}
```

---

### Script Loading

**Recommended**: Use SDK's ScriptLoader for idempotent loading

**Pattern**:
```typescript
class MyProvider implements AnalyticsProvider {
  constructor(private scriptLoader: ScriptLoader) {}
  
  async init(config: ProviderConfig): Promise<void> {
    // ScriptLoader prevents duplicate loading
    await this.scriptLoader.loadScript(
      config.scriptUrl,
      config.integrity
    );
    
    // Initialize provider API
    this.initializeProviderAPI(config);
    this.ready = true;
  }
}
```

---

## Reference Implementations

### Google Analytics Provider

**File**: `packages/analytics-sdk-core/src/providers/GoogleAnalyticsProvider.ts`

**Configuration**:
```typescript
{
  scriptUrl: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
  measurementId: 'G-XXXXXXXXXX',
  cookieDomain: 'auto'
}
```

**API**: Uses `window.gtag()` and `window.dataLayer`

---

### CleverTap Provider

**File**: `packages/analytics-sdk-core/src/providers/CleverTapProvider.ts`

**Configuration**:
```typescript
{
  scriptUrl: 'https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js',
  accountId: 'CLEVERTAP_ACCOUNT_ID',
  region: 'us1'
}
```

**API**: Uses `window.clevertap`

---

## Testing Requirements

**Contract**: All providers MUST include:

1. **Unit Tests**:
   - Test `init()` with valid/invalid configs
   - Test `track()`, `identify()`, `page()` when ready/not ready
   - Test error handling (script load failures)

2. **Integration Tests**:
   - Test with real provider SDKs in browser environment
   - Verify events reach provider's API correctly

**Example Test Structure**:
```typescript
describe('GoogleAnalyticsProvider', () => {
  it('should initialize with valid config', async () => {
    const provider = new GoogleAnalyticsProvider();
    await provider.init({ scriptUrl: 'https://...', measurementId: 'GA-XXX' });
    expect(provider.isReady()).toBe(true);
  });
  
  it('should track event when ready', () => {
    // Mock window.gtag
    const provider = new GoogleAnalyticsProvider();
    provider.track({ name: 'test', properties: {} });
    // Assert gtag called
  });
  
  it('should handle errors gracefully', () => {
    const provider = new GoogleAnalyticsProvider();
    expect(() => provider.track({ name: 'test' })).not.toThrow();
  });
});
```

---

## Versioning and Compatibility

**Provider Interface Version**: 1.0.0

**Breaking Changes** (require major version bump):
- Adding required methods to interface
- Changing method signatures
- Removing methods

**Non-Breaking Changes** (minor/patch):
- Adding optional methods
- Deprecating methods (with migration period)

**Compatibility Promise**: Providers implementing v1.x interface will work with SDK v1.x

---

## Registration Pattern

**How to Add a Provider**:

```typescript
import { AnalyticsSDK } from 'analytics-sdk-core';
import { CustomProvider } from './custom-provider';

// Register provider plugin
const sdk = AnalyticsSDK.getInstance();
sdk.registerProvider(new CustomProvider());

// Configure in remote config
{
  "providers": [
    {
      "provider": "custom-provider",
      "enabled": true,
      "scriptUrl": "https://cdn.example.com/custom.js",
      "config": {
        "apiKey": "xxx"
      }
    }
  ]
}
```

**Result**: Provider will be initialized and receive events automatically.

---

## Best Practices

1. **Idempotency**: Multiple `init()` calls should be safe (check if already initialized)
2. **Logging**: Use descriptive error messages with provider name
3. **Performance**: Minimize synchronous work in `track()` - delegate to provider's async queue
4. **Security**: Validate config parameters before use
5. **Documentation**: Document provider-specific config schema and limitations
