# analytics-sdk-core

> Framework-agnostic TypeScript SDK for centralized analytics CDN integration with Module Federation support

[![npm version](https://img.shields.io/npm/v/analytics-sdk-core.svg)](https://www.npmjs.com/package/analytics-sdk-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero runtime dependencies** (only Zod for validation)
- 📦 **<20KB gzipped** bundle size
- 🔌 **Plugin-based** provider architecture
- 🎯 **Module Federation** singleton pattern
- ⚡ **Event queueing** before initialization
- 🌐 **Remote configuration** with localStorage caching
- 🛡️ **Fail-safe** error handling
- 📝 **Full TypeScript** support

## Installation

```bash
npm install analytics-sdk-core
```

## Quick Start

```typescript
import { AnalyticsSDK } from 'analytics-sdk-core';

// Get singleton instance
const sdk = AnalyticsSDK.getInstance();

// Initialize with config URL
await sdk.init('https://api.example.com/analytics-config');

// Track events
sdk.track('button_click', {
  button_id: 'checkout',
  page: '/cart',
});

// Identify users
sdk.identify('user_12345', {
  email: 'user@example.com',
  plan: 'premium',
});

// Track page views
sdk.page('Checkout Page', {
  url: '/checkout',
});
```

## Supported Providers

- Google Analytics 4
- CleverTap
- Custom providers via ProviderInterface

## API Reference

### AnalyticsSDK

#### `getInstance(): AnalyticsSDK`

Get the singleton SDK instance.

#### `init(configUrl: string): Promise<void>`

Initialize the SDK with remote configuration.

#### `track(event: string | AnalyticsEvent, properties?: Record<string, any>): void`

Track a custom event.

#### `identify(userId: string, traits?: Record<string, any>): void`

Identify a user with traits.

#### `page(name?: string, properties?: Record<string, any>): void`

Track a page view.

#### `registerProvider(provider: ProviderInterface): void`

Register a custom analytics provider.

## Configuration Format

The remote configuration endpoint should return:

```json
{
  "providers": {
    "googleAnalytics": {
      "enabled": true,
      "measurementId": "G-XXXXXXXXXX",
      "config": {
        "send_page_view": true
      }
    },
    "clevertap": {
      "enabled": false,
      "accountId": "YOUR-ACCOUNT-ID"
    }
  },
  "globalEnrichment": {
    "app_version": "1.0.0",
    "environment": "production"
  }
}
```

## Module Federation Setup

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  shared: {
    'analytics-sdk-core': {
      singleton: true,
      strictVersion: true,
      requiredVersion: '^1.0.0',
    },
  },
});
```

## License

MIT
