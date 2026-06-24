# Implementation Plan: Analytics SDK - Centralized CDN Integration Layer

**Branch**: `001-analytics-cdn-integration` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-analytics-cdn-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a TypeScript SDK that provides a centralized, configuration-driven integration layer for third-party analytics CDNs (Google Analytics, CleverTap) in Angular applications using Module Federation. The SDK fetches runtime configuration from a remote API, dynamically loads provider scripts, maintains singleton behavior across microfrontends, and queues events before initialization. Key capabilities: plugin architecture for providers, event routing and enrichment, idempotent operations, and fail-safe error handling that never crashes the host application.

## Technical Context

**Language/Version**: TypeScript 5.0+ (compiled for ES2020+, supports modern browsers)

**Primary Dependencies**: 
- Angular 12+ (peer dependency for service wrapper)
- webpack 5+ ModuleFederationPlugin (for singleton sharing)
- No runtime dependencies for core SDK (zero-dependency library)

**Storage**: Browser localStorage for configuration caching, sessionStorage for session IDs

**Testing**: Jest for unit tests, Karma/Jasmine for Angular integration tests, Playwright for Module Federation e2e tests

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - evergreen versions, no IE11)

**Project Type**: TypeScript library/SDK with Angular service wrapper

**Performance Goals**: 
- SDK initialization <500ms (excluding external script loads)
- Core bundle <20KB gzipped
- Event tracking non-blocking (<1ms synchronous overhead)
- Provider script loading asynchronous and parallel

**Constraints**: 
- Singleton instance across Module Federation boundaries (window global + webpack shared)
- Never throw uncaught exceptions (all errors caught and logged)
- Runtime configuration required (no hardcoded provider settings)
- Idempotent operations (safe to call init/track multiple times)
- Zero impact on Time to Interactive (+0-50ms acceptable)

**Scale/Scope**: 
- Support 2-10 analytics providers per application
- Handle 100+ events queued before initialization
- 3-5 microfrontends per application
- Configuration updates within 5 minutes (polling)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Analytics SDK Constitution Compliance Checklist:**

- [x] **Config Over Code**: ✅ All provider behavior driven by remote configuration API (FR-005 to FR-011)
- [x] **Plugin Architecture**: ✅ AnalyticsProvider interface defines init/track/isReady contract (FR-002, FR-017)
- [x] **Singleton Pattern**: ✅ Window global + webpack shared singleton enforces single instance (FR-026, FR-027)
- [x] **Runtime Safety**: ✅ All provider calls wrapped in try-catch, errors logged never thrown (FR-014, FR-044)
- [x] **Performance Impact**: ✅ <500ms init, <20KB bundle, async script loading (FR-036, FR-037, FR-045, FR-046)
- [x] **Idempotent Operations**: ✅ Multiple init calls return same instance, duplicate scripts prevented (FR-013, FR-027)
- [x] **Event Queueing**: ✅ Events queued before init with max 100 size, replayed after (FR-021, FR-022, FR-025)
- [x] **Security**: ✅ HTTPS-only URLs, whitelist validation, no eval/innerHTML (FR-016, FR-043)
- [x] **Testing Strategy**: ✅ Integration tests for Module Federation singleton, provider plugins, script loading (FR-013)
- [x] **Error Handling**: ✅ Fail-safe design, partial provider failures don't break app (FR-035, FR-044)
- [x] **Extensibility**: ✅ Provider registry, no circular deps, core remains provider-agnostic (FR-003, Architecture Rules)
- [x] **Observability**: ✅ Debug mode, monitoring hooks (onEventTracked, onProviderError) (FR-040, FR-047)

**Constitution Version**: 1.0.0 (refer to `.specify/memory/constitution.md` for full principles)

**Gate Result**: ✅ PASS - All constitutional requirements met by design. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── analytics-sdk-core/              # Core TypeScript SDK (framework-agnostic)
│   ├── src/
│   │   ├── core/
│   │   │   ├── AnalyticsSDK.ts      # Main SDK singleton class
│   │   │   ├── ProviderRegistry.ts  # Provider management and lifecycle
│   │   │   └── SingletonManager.ts  # Window global singleton enforcement
│   │   ├── config/
│   │   │   ├── ConfigManager.ts     # Fetch/validate/cache remote config
│   │   │   ├── ConfigSchema.ts      # Configuration type definitions
│   │   │   └── ConfigValidator.ts   # Schema validation logic
│   │   ├── events/
│   │   │   ├── EventQueue.ts        # Queue events before initialization
│   │   │   ├── EventRouter.ts       # Route events to providers
│   │   │   └── EventEnricher.ts     # Add metadata to events
│   │   ├── loader/
│   │   │   ├── ScriptLoader.ts      # Dynamic CDN script injection
│   │   │   └── UrlValidator.ts      # HTTPS and whitelist validation
│   │   ├── providers/
│   │   │   ├── ProviderInterface.ts # AnalyticsProvider contract
│   │   │   ├── GoogleAnalyticsProvider.ts
│   │   │   └── CleverTapProvider.ts
│   │   ├── logger/
│   │   │   └── Logger.ts            # Debug logging and observability
│   │   └── index.ts                 # Public API exports
│   └── tests/
│       ├── unit/                    # Jest unit tests
│       └── integration/             # Integration tests for providers
│
├── analytics-sdk-angular/           # Angular service wrapper
│   ├── src/
│   │   ├── lib/
│   │   │   ├── analytics.service.ts # Angular injectable service
│   │   │   ├── analytics.module.ts  # Angular module
│   │   │   └── analytics.config.ts  # Angular-specific config
│   │   └── public-api.ts            # Public exports
│   └── tests/
│       └── integration/             # Karma/Jasmine Angular tests
│
└── examples/                        # Example applications
    ├── mfe-host/                    # Module Federation host app
    ├── mfe-remote-1/                # Remote microfrontend 1
    └── mfe-remote-2/                # Remote microfrontend 2
```

**Structure Decision**: 

- **Monorepo with packages**: Core SDK is framework-agnostic TypeScript library, Angular wrapper is separate package
- **Separation rationale**: Core SDK can be consumed by non-Angular frameworks (React, Vue) in future
- **Module Federation examples**: Demonstrates singleton behavior across host and remotes
- **Testing isolation**: Unit tests in core, integration tests in Angular wrapper, e2e tests in examples

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: ✅ NO VIOLATIONS - All complexity justified by constitutional requirements

No violations to document. The design adheres to all constitutional principles without requiring exceptions.

---

## Phase Completion Status

### Phase 0: Research ✅ COMPLETE

**Artifacts Generated**:
- [research.md](./research.md) - Technical decisions and best practices

**Research Topics Covered**:
1. Module Federation singleton pattern (webpack shared + window global)
2. Dynamic CDN script loading (createElement + Promise + registry)
3. Event queueing before initialization (in-memory array, FIFO, max size)
4. Provider plugin architecture (interface + strategy + registry)
5. Configuration management (Fetch API + Zod validation + localStorage)
6. Angular integration (Injectable + APP_INITIALIZER)
7. Error handling strategy (comprehensive try-catch + logging)

**All technical unknowns resolved** ✅

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Artifacts Generated**:
- [data-model.md](./data-model.md) - Core entities and relationships
- [contracts/01-sdk-public-api.md](./contracts/01-sdk-public-api.md) - SDK public API contract
- [contracts/02-provider-interface.md](./contracts/02-provider-interface.md) - Provider plugin interface
- [contracts/03-configuration-api.md](./contracts/03-configuration-api.md) - Remote config API contract
- [quickstart.md](./quickstart.md) - Developer integration guide
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Agent context updated

**Key Entities Defined**:
1. AnalyticsSDK (singleton)
2. SDKConfiguration
3. ProviderConfiguration
4. AnalyticsProvider (interface)
5. AnalyticsEvent
6. ProviderRegistry
7. EventQueue
8. EventRouter
9. ConfigManager
10. ScriptLoader
11. Logger

**Contracts Documented**:
- SDK Public API (11 methods)
- Provider Plugin Interface (5 methods)
- Configuration API (HTTP GET endpoint with JSON schema)

**Constitution Re-Check**: ✅ PASS (all checkboxes verified)

---

## Next Steps

**Ready for Task Generation**: Run `/speckit.tasks` to generate actionable implementation tasks.

**Implementation Readiness**:
- ✅ Technical decisions made
- ✅ Architecture defined
- ✅ Entities modeled
- ✅ Contracts documented
- ✅ Integration patterns established
- ✅ Testing strategy defined
- ✅ Constitution compliance verified

**Notes**: 
- No NEEDS CLARIFICATION markers remain
- All design artifacts reference constitutional principles
- Project structure supports P1 MVP (single provider + Module Federation singleton)
