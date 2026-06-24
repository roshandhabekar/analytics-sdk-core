# Quickstart Guide: Analytics SDK

**Purpose**: Practical guide for developers to integrate and test the Analytics SDK

**Audience**: Application developers

**Updated**: 2026-06-04

---

## Installation

### NPM Package Installation

```bash
# Core SDK (framework-agnostic)
npm install analytics-sdk-core

# Angular wrapper
npm install analytics-sdk-angular
```

---

## Basic Usage (Core SDK)

### 1. Initialize the SDK

```typescript
import { AnalyticsSDK } from 'analytics-sdk-core';

// Get singleton instance
const sdk = AnalyticsSDK.getInstance();

// Initialize with config URL
await sdk.init('https://api.example.com/analytics-config');

// SDK is ready - events will now be sent to enabled providers
```

---

### 2. Track Events

```typescript
// Track a simple event
sdk.track('button_click', {
  button_id: 'checkout',
  page: '/cart'
});

// Track with full event object
sdk.track({
  name: 'purchase',
  properties: {
    amount: 99.99,
    currency: 'USD',
    items: ['item1', 'item2']
  }
});
```

---

### 3. Identify Users

```typescript
sdk.identify('user_12345', {
  email: 'user@example.com',
  plan: 'premium',
  signupDate: '2026-01-15'
});
```

---

### 4. Track Page Views

```typescript
sdk.page('Checkout Page', {
  url: '/checkout',
  category: 'ecommerce'
});
```

---

## Angular Integration

### 1. Import Module in App

```typescript
// app.module.ts
import { AnalyticsModule } from 'analytics-sdk-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AnalyticsModule.forRoot({
      configUrl: 'https://api.example.com/analytics-config',
      enablePolling: true,
      pollingInterval: 300000 // 5 minutes
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

---

### 2. Use Service in Components

```typescript
// checkout.component.ts
import { Component } from '@angular/core';
import { AnalyticsService } from 'analytics-sdk-angular';

@Component({
  selector: 'app-checkout',
  template: `<button (click)="onCheckout()">Checkout</button>`
})
export class CheckoutComponent {
  constructor(private analytics: AnalyticsService) {}
  
  onCheckout() {
    this.analytics.track('checkout_started', {
      cart_value: 99.99,
      items_count: 3
    });
  }
}
```

---

## Module Federation Setup

### Host App Configuration

**webpack.config.js** (Host):
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        checkout: 'checkout@http://localhost:3001/remoteEntry.js',
        products: 'products@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        'analytics-sdk-core': {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^1.0.0'
        },
        '@angular/core': {
          singleton: true,
          strictVersion: true
        }
      }
    })
  ]
};
```

**Host App Module**:
```typescript
// Host initializes SDK
@NgModule({
  imports: [
    AnalyticsModule.forRoot({
      configUrl: 'https://api.example.com/analytics-config'
    })
  ]
})
export class HostAppModule {}
```

---

### Remote App Configuration

**webpack.config.js** (Remote):
```javascript
new ModuleFederationPlugin({
  name: 'checkout',
  filename: 'remoteEntry.js',
  exposes: {
    './CheckoutModule': './src/app/checkout/checkout.module.ts'
  },
  shared: {
    'analytics-sdk-core': {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^1.0.0'
    },
    '@angular/core': {
      singleton: true,
      strictVersion: true
    }
  }
})
```

**Remote App Module**:
```typescript
// Remote reuses SDK singleton (no init needed)
@Component({
  selector: 'app-checkout-page'
})
export class CheckoutPageComponent {
  constructor(private analytics: AnalyticsService) {
    // SDK is already initialized by host
    // Just track events
    this.analytics.track('checkout_page_viewed');
  }
}
```

---

## Configuration Examples

### Example 1: Single Provider (Google Analytics)

**Configuration API Response**:
```json
{
  "enabled": true,
  "debug": false,
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
      "config": {
        "measurementId": "G-ABC123XYZ",
        "cookieDomain": "auto"
      }
    }
  ]
}
```

**Result**: All events sent to Google Analytics

---

### Example 2: Multiple Providers

```json
{
  "enabled": true,
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
      "config": {
        "measurementId": "G-ABC123XYZ"
      }
    },
    {
      "provider": "clevertap",
      "enabled": true,
      "scriptUrl": "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js",
      "config": {
        "accountId": "CT-ACCOUNT-123",
        "region": "us1"
      }
    }
  ]
}
```

**Result**: Events sent to both Google Analytics and CleverTap

---

### Example 3: Event Routing Rules

```json
{
  "enabled": true,
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "...",
      "config": { "measurementId": "G-ABC123XYZ" }
    },
    {
      "provider": "clevertap",
      "enabled": true,
      "scriptUrl": "...",
      "config": { "accountId": "CT-ACCOUNT-123" }
    }
  ],
  "routing": [
    {
      "eventNamePattern": "purchase",
      "providers": ["clevertap"],
      "exclude": ["google-analytics"]
    }
  ]
}
```

**Result**: 
- "purchase" events → CleverTap only
- All other events → Both providers

---

## Testing Scenarios

### Test 1: Verify SDK Initialization

**Objective**: Confirm SDK initializes successfully

**Steps**:
1. Open browser console
2. Initialize SDK: `await sdk.init('https://api.example.com/analytics-config')`
3. Check for errors in console
4. Verify: `sdk.isInitialized()` returns `true`

**Expected**: No errors, SDK ready

---

### Test 2: Verify Event Tracking

**Objective**: Confirm events are sent to provider

**Steps**:
1. Enable debug mode in config: `"debug": true`
2. Track event: `sdk.track('test_event', { test: 'data' })`
3. Check browser console for debug logs
4. Check provider dashboard (Google Analytics Real-Time, CleverTap Events)

**Expected**: Event appears in console logs and provider dashboard

---

### Test 3: Verify Event Queueing Before Init

**Objective**: Ensure events tracked before init are not lost

**Steps**:
1. Before calling `init()`, track events:
   ```typescript
   sdk.track('early_event_1');
   sdk.track('early_event_2');
   ```
2. Initialize SDK: `await sdk.init('...')`
3. Check provider dashboard for both events

**Expected**: Both early events appear in dashboard after init

---

### Test 4: Verify Module Federation Singleton

**Objective**: Confirm single SDK instance across host + remotes

**Steps**:
1. Load host app with 2 remote microfrontends
2. In browser console, check: `window.__ANALYTICS_SDK__`
3. Track event from host: `sdk.track('host_event')`
4. Track event from remote: `sdk.track('remote_event')`
5. Check network tab: Count script tags for provider CDNs

**Expected**: 
- Only 1 script tag per provider
- Both events sent to providers
- `window.__ANALYTICS_SDK__` exists and is singleton

---

### Test 5: Verify Provider Failure Isolation

**Objective**: Ensure one provider failure doesn't break others

**Steps**:
1. Configure invalid script URL for one provider
2. Initialize SDK
3. Track event
4. Check console for error log for failed provider
5. Verify other providers still receive events

**Expected**: Failed provider logged, other providers work

---

### Test 6: Verify Runtime Config Changes

**Objective**: Test config polling and runtime updates

**Steps**:
1. Initialize with polling enabled:
   ```typescript
   await sdk.init('https://api.example.com/analytics-config', {
     enablePolling: true,
     pollingInterval: 60000 // 1 minute for testing
   });
   ```
2. Track event, verify sent to current providers
3. Change config on server (disable one provider)
4. Wait for polling interval
5. Track another event
6. Verify disabled provider no longer receives events

**Expected**: Config changes applied without app restart

---

### Test 7: Verify Error Handling (No Config API)

**Objective**: Ensure SDK doesn't crash if config fetch fails

**Steps**:
1. Initialize with invalid URL: `sdk.init('https://invalid.url')`
2. Check console for error log
3. Track event: `sdk.track('test')`
4. Verify app continues to function

**Expected**: Error logged, SDK uses safe defaults, app doesn't crash

---

## Debugging

### Enable Debug Mode

**Option 1: Via Configuration**
```json
{
  "debug": true,
  "providers": [...]
}
```

**Option 2: Programmatically**
```typescript
// Not exposed in v1, controlled via config
```

---

### Debug Console Output

When debug mode enabled, SDK logs:

```
[AnalyticsSDK] Initializing with config from: https://...
[AnalyticsSDK] Configuration loaded: { enabled: true, ... }
[AnalyticsSDK] Initializing provider: google-analytics
[AnalyticsSDK] Script loaded: https://www.googletagmanager.com/gtag/js
[AnalyticsSDK] Provider ready: google-analytics
[AnalyticsSDK] Replaying 2 queued events
[AnalyticsSDK] Event tracked: button_click → [google-analytics, clevertap]
```

---

### Monitoring Hooks

```typescript
sdk.setLoggerHooks({
  onEventTracked: (event, providers) => {
    console.log(`Event ${event.name} sent to:`, providers);
  },
  onProviderError: (provider, error) => {
    // Send to monitoring service
    sendToSentry({ provider, error });
  },
  onConfigLoaded: (config) => {
    console.log('Config loaded:', config);
  },
  onScriptLoaded: (url) => {
    console.log('Script loaded:', url);
  }
});
```

---

## Common Issues and Solutions

### Issue 1: Events Not Appearing in Provider Dashboard

**Symptoms**: SDK initialized, events tracked, but not in dashboard

**Debugging**:
1. Enable debug mode: Check if events are being sent
2. Check provider config: Verify tracking ID / account ID correct
3. Check provider dashboard: May have delay (check Real-Time view)
4. Check browser console: Any provider errors?

**Solution**: Verify config correctness, check network tab for failed requests

---

### Issue 2: Duplicate Events in Dashboard

**Symptoms**: Each event appears multiple times

**Possible Causes**:
- Multiple SDK instances (Module Federation issue)
- Multiple provider script tags loaded

**Debugging**:
1. Check `window.__ANALYTICS_SDK__`: Should be single instance
2. Count script tags in DOM: Should be 1 per provider
3. Check webpack shared config: Ensure `singleton: true`

**Solution**: Fix Module Federation shared config

---

### Issue 3: SDK Initialization Slow

**Symptoms**: `init()` takes >5 seconds

**Possible Causes**:
- Slow config API response
- Slow provider CDN script loads
- Network issues

**Debugging**:
1. Check network tab: Time for config fetch
2. Check network tab: Time for script loads
3. Enable debug mode: Check init timeline

**Solution**: Optimize config API, use CDN with good perf, check network

---

### Issue 4: Configuration Not Updating

**Symptoms**: Changed config on server, SDK not reflecting changes

**Possible Causes**:
- Polling not enabled
- Polling interval too long
- Browser cache

**Debugging**:
1. Check if polling enabled in init options
2. Check polling interval
3. Hard refresh browser (clear cache)

**Solution**: Enable polling, reduce interval for testing, clear cache

---

## Performance Monitoring

### Measure SDK Impact

```typescript
// Before SDK init
performance.mark('sdk-init-start');

await sdk.init('...');

performance.mark('sdk-init-end');
performance.measure('sdk-init', 'sdk-init-start', 'sdk-init-end');

const measure = performance.getEntriesByName('sdk-init')[0];
console.log(`SDK init took: ${measure.duration}ms`);
```

**Expected**: <500ms (excluding external script loads)

---

### Measure Bundle Size Impact

```bash
# Build with webpack bundle analyzer
npm run build -- --analyze

# Check bundle size for analytics SDK packages
```

**Expected**: Core SDK <20KB gzipped

---

## Advanced Patterns

### Custom Provider Plugin

```typescript
import { AnalyticsProvider, ProviderConfig, AnalyticsEvent } from 'analytics-sdk-core';

class CustomProvider implements AnalyticsProvider {
  readonly name = 'custom-provider';
  readonly version = '1.0.0';
  private ready = false;
  
  async init(config: ProviderConfig): Promise<void> {
    // Load external script
    const script = document.createElement('script');
    script.src = config.scriptUrl;
    script.async = true;
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    
    // Initialize provider API
    window.customProvider.init(config.apiKey);
    this.ready = true;
  }
  
  track(event: AnalyticsEvent): void {
    if (!this.ready) return;
    window.customProvider.track(event.name, event.properties);
  }
  
  identify(userId: string, traits?: any): void {
    if (!this.ready) return;
    window.customProvider.setUser(userId, traits);
  }
  
  page(name?: string, properties?: any): void {
    if (!this.ready) return;
    window.customProvider.page(name, properties);
  }
  
  isReady(): boolean {
    return this.ready;
  }
}

// Register custom provider
sdk.registerProvider(new CustomProvider());
```

---

### Event Enrichment (Custom Metadata)

Currently controlled via configuration `enrichment` field. Custom enrichment functions coming in future version.

---

## Next Steps

1. **Read Contracts**: Review [SDK API](./contracts/01-sdk-public-api.md), [Provider Interface](./contracts/02-provider-interface.md), [Config API](./contracts/03-configuration-api.md)
2. **Review Data Model**: Understand entities in [data-model.md](./data-model.md)
3. **Check Research**: Technical decisions in [research.md](./research.md)
4. **Run Tests**: Execute test scenarios above
5. **Integrate**: Add SDK to your application
6. **Monitor**: Use debug mode and hooks for observability

---

## Support

**Issues**: Submit via GitHub Issues
**Documentation**: See `/docs` folder
**Examples**: See `/examples` folder in repository
