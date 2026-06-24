# Analytics SDK

> Centralized analytics integration layer for third-party CDNs with Module Federation support

## Project Structure

```
analytics-sdk/
├── packages/
│   ├── analytics-sdk-core/       # Framework-agnostic TypeScript SDK
│   │   ├── src/
│   │   │   ├── core/             # AnalyticsSDK, ProviderRegistry, EventRouter
│   │   │   ├── config/           # ConfigManager
│   │   │   ├── events/           # EventQueue, EventEnricher
│   │   │   ├── loader/           # ScriptLoader
│   │   │   ├── providers/        # Provider interfaces and implementations
│   │   │   ├── logger/           # Logger
│   │   │   └── types/            # TypeScript type definitions
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   └── analytics-sdk-angular/    # Angular service wrapper
│       ├── src/
│       │   └── lib/
│       └── tests/
│           └── integration/
├── examples/
│   ├── mfe-host/                 # Module Federation host app
│   ├── mfe-remote-1/             # Remote microfrontend 1
│   └── mfe-remote-2/             # Remote microfrontend 2
└── specs/                        # Feature specifications
```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install all dependencies
npm install

# Setup Git hooks
npm run prepare
```

### Build

```bash
# Build all packages
npm run build

# Build specific package
npm run build -w analytics-sdk-core
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch -w analytics-sdk-core
```

### Linting

```bash
# Lint all files
npm run lint

# Format all files
npm run format

# Check formatting
npm run format:check
```

## Packages

### analytics-sdk-core

Framework-agnostic TypeScript SDK for centralized analytics integration.

**Features:**

- Zero runtime dependencies (Zod is the only dependency)
- <20KB gzipped bundle size
- Module Federation singleton pattern
- Plugin-based provider architecture
- Event queueing before initialization
- Remote configuration with caching
- Fail-safe error handling

### analytics-sdk-angular

Angular service wrapper with dependency injection support.

**Features:**

- Injectable service with `providedIn: 'root'`
- APP_INITIALIZER integration
- RxJS observables for event streaming
- Type-safe configuration

## Module Federation Setup

The SDK is designed to work as a singleton across Module Federation microfrontends:

```javascript
// webpack.config.js (Host & Remotes)
new ModuleFederationPlugin({
  shared: {
    'analytics-sdk-core': {
      singleton: true,
      strictVersion: false,
      eager: false,
    },
  },
});
```

## License

MIT

## Documentation

See [specs/001-analytics-cdn-integration/](./specs/001-analytics-cdn-integration/) for detailed specifications.
