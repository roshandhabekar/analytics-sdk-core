# Tasks: Analytics SDK - Centralized CDN Integration Layer

**Input**: Design documents from `/specs/001-analytics-cdn-integration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Integration tests are included for P1 MVP user stories (US1, US4). Unit tests for all core components.

**Organization**: Tasks are grouped by user story priority to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses monorepo structure:
- **Core SDK**: `packages/analytics-sdk-core/src/`
- **Angular wrapper**: `packages/analytics-sdk-angular/src/`
- **Examples**: `examples/`
- **Tests**: `packages/analytics-sdk-core/tests/` and `packages/analytics-sdk-angular/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [X] T001 Create monorepo structure with packages/ directory
- [X] T002 Initialize TypeScript 5.0+ configuration for analytics-sdk-core package
- [X] T003 [P] Initialize TypeScript configuration for analytics-sdk-angular package
- [X] T004 [P] Setup Jest test framework for core SDK in packages/analytics-sdk-core/jest.config.js
- [X] T005 [P] Setup Karma/Jasmine for Angular tests in packages/analytics-sdk-angular/karma.conf.js
- [X] T006 Setup Zod for schema validation in packages/analytics-sdk-core/package.json
- [X] T007 Create package.json with zero runtime dependencies for core SDK
- [X] T008 Setup build scripts (rollup/webpack) to generate ES2020+ output <20KB gzipped
- [X] T009 [P] Create ESLint and Prettier configurations for code quality
- [X] T010 [P] Setup Git hooks for pre-commit linting

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create TypeScript type definitions in packages/analytics-sdk-core/src/types/index.ts
- [X] T012 [P] Define AnalyticsEvent interface in packages/analytics-sdk-core/src/types/AnalyticsEvent.ts
- [X] T013 [P] Define SDKConfiguration and ProviderConfiguration interfaces in packages/analytics-sdk-core/src/types/Configuration.ts
- [X] T014 [P] Define AnalyticsProvider interface in packages/analytics-sdk-core/src/providers/ProviderInterface.ts
- [X] T015 Create Logger class with debug/warn/error/log methods in packages/analytics-sdk-core/src/logger/Logger.ts
- [X] T016 Add LoggerHooks interface for observability in packages/analytics-sdk-core/src/logger/LoggerHooks.ts
- [X] T017 Create UrlValidator utility for HTTPS validation in packages/analytics-sdk-core/src/loader/UrlValidator.ts
- [X] T018 Implement ScriptLoader with duplicate prevention registry in packages/analytics-sdk-core/src/loader/ScriptLoader.ts
- [X] T019 Add script load error handling with Promise-based loading in ScriptLoader
- [X] T020 Create EventQueue with FIFO queueing and max size limit in packages/analytics-sdk-core/src/events/EventQueue.ts
- [X] T021 Implement EventEnricher for adding timestamp and metadata in packages/analytics-sdk-core/src/events/EventEnricher.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: US1 + US4 (MVP - Priority P1) 🎯

**Combined Goals**: 
- US1: Single Provider Integration with Google Analytics
- US4: Module Federation Singleton Behavior

**Why Combined**: Both are P1 MVP requirements and the singleton pattern (US4) is needed for proper US1 implementation in Module Federation environments

**Independent Test**: Initialize SDK with Google Analytics in Module Federation host + 2 remotes, track events from each, verify single script tag and no event duplication

### Core SDK Singleton (US4)

- [X] T022 [P] [US4] Create AnalyticsSDK singleton class with getInstance() in packages/analytics-sdk-core/src/core/AnalyticsSDK.ts
- [X] T023 [US4] Implement window global singleton pattern (window.__ANALYTICS_SDK__) in AnalyticsSDK
- [X] T024 [US4] Add idempotent init() method that ignores subsequent calls in AnalyticsSDK
- [ ] T025 [P] [US4] Write unit test for singleton pattern in packages/analytics-sdk-core/tests/unit/AnalyticsSDK.test.ts

### Configuration Management (US1)

- [X] T026 [P] [US1] Create ConfigSchema with Zod validation in packages/analytics-sdk-core/src/config/ConfigSchema.ts
- [X] T027 [US1] Implement ConfigManager with fetchConfig() method in packages/analytics-sdk-core/src/config/ConfigManager.ts
- [X] T028 [US1] Add localStorage caching in ConfigManager.cacheConfig() and getCachedConfig()
- [X] T029 [US1] Implement fallback to safe defaults (all providers disabled) in ConfigManager.getDefaultConfig()
- [ ] T030 [P] [US1] Write unit tests for ConfigManager in packages/analytics-sdk-core/tests/unit/ConfigManager.test.ts

### Provider Registry (US1)

- [X] T031 [P] [US1] Create ProviderRegistry class in packages/analytics-sdk-core/src/core/ProviderRegistry.ts
- [X] T032 [US1] Implement provider registration in ProviderRegistry.register()
- [X] T033 [US1] Implement provider initialization in ProviderRegistry.initializeProvider()
- [X] T034 [US1] Add getEnabled() to return ready providers from ProviderRegistry
- [ ] T035 [P] [US1] Write unit tests for ProviderRegistry in packages/analytics-sdk-core/tests/unit/ProviderRegistry.test.ts

### Event Routing (US1)

- [X] T036 [P] [US1] Create EventRouter class in packages/analytics-sdk-core/src/events/EventRouter.ts
- [X] T037 [US1] Implement EventRouter.route() to send events to enabled providers
- [X] T038 [US1] Add try-catch error isolation per provider in EventRouter
- [ ] T039 [P] [US1] Write unit tests for EventRouter in packages/analytics-sdk-core/tests/unit/EventRouter.test.ts

### Google Analytics Provider (US1)

- [X] T040 [P] [US1] Implement GoogleAnalyticsProvider implementing AnalyticsProvider interface in packages/analytics-sdk-core/src/providers/GoogleAnalyticsProvider.ts
- [X] T041 [US1] Implement GoogleAnalyticsProvider.init() to load gtag script
- [X] T042 [US1] Implement GoogleAnalyticsProvider.track() using window.gtag()
- [X] T043 [US1] Implement GoogleAnalyticsProvider.identify() and page() methods
- [X] T044 [US1] Add isReady() state management to GoogleAnalyticsProvider
- [ ] T045 [P] [US1] Write unit tests for GoogleAnalyticsProvider in packages/analytics-sdk-core/tests/unit/GoogleAnalyticsProvider.test.ts

### SDK Integration (US1 + US4)

- [X] T046 [US1] Wire all components in AnalyticsSDK.init() (ConfigManager → ProviderRegistry → EventQueue replay)
- [X] T047 [US1] Implement AnalyticsSDK.track() to route through EventRouter
- [X] T048 [US1] Implement AnalyticsSDK.identify() and page() methods
- [X] T049 [US1] Add event queueing before initialization in AnalyticsSDK.track()
- [X] T050 [US1] Implement EventQueue.replay() after initialization completes
- [X] T051 [US1] Create public API exports in packages/analytics-sdk-core/src/index.ts

### Integration Tests (US1 + US4)

- [ ] T052 [US1] [US4] Write integration test: SDK init with Google Analytics config in packages/analytics-sdk-core/tests/integration/single-provider.test.ts
- [ ] T053 [US1] Write integration test: Event tracking before and after init
- [ ] T054 [US1] Write integration test: Script load failure handling
- [ ] T055 [US4] Write integration test: Multiple getInstance() calls return same instance
- [ ] T056 [US4] Write integration test: Window global singleton across modules

**Checkpoint**: At this point, US1 and US4 are fully functional - MVP can be tested with Google Analytics in Module Federation environment

---

## Phase 4: US2 - Multi-Provider Plugin Architecture (Priority: P2)

**Goal**: Enable multiple analytics providers simultaneously (Google Analytics + CleverTap)

**Independent Test**: Configure both providers, send test event, verify it appears in both dashboards

### CleverTap Provider Implementation

- [ ] T057 [P] [US2] Implement CleverTapProvider implementing AnalyticsProvider interface in packages/analytics-sdk-core/src/providers/CleverTapProvider.ts
- [ ] T058 [US2] Implement CleverTapProvider.init() to load CleverTap script
- [ ] T059 [US2] Implement CleverTapProvider.track() using window.clevertap
- [ ] T060 [US2] Implement CleverTapProvider.identify() and page() methods
- [ ] T061 [US2] Add isReady() state management to CleverTapProvider
- [ ] T062 [P] [US2] Write unit tests for CleverTapProvider in packages/analytics-sdk-core/tests/unit/CleverTapProvider.test.ts

### Multi-Provider Support

- [X] T063 [US2] Update EventRouter to iterate over all enabled providers
- [X] T064 [US2] Ensure error in one provider doesn't affect others (isolation)
- [X] T065 [US2] Add registerProvider() method to AnalyticsSDK for custom providers
- [ ] T066 [P] [US2] Write unit test for registerProvider() in packages/analytics-sdk-core/tests/unit/AnalyticsSDK.test.ts

### Integration Tests (US2)

- [ ] T067 [US2] Write integration test: Multiple providers enabled in config
- [ ] T068 [US2] Write integration test: Event sent to all enabled providers
- [ ] T069 [US2] Write integration test: Disabled provider doesn't receive events
- [ ] T070 [US2] Write integration test: One provider failure doesn't break others

**Checkpoint**: Multi-provider architecture complete - events route to multiple platforms simultaneously

---

## Phase 5: US3 - Remote Dynamic Configuration (Priority: P2)

**Goal**: Enable/disable providers via remote configuration without redeploy

**Independent Test**: Change provider flags remotely, verify SDK behavior changes without app restart

### Configuration API Integration

- [ ] T071 [US3] Enhance ConfigManager to use Fetch API for remote config in fetchConfig()
- [ ] T072 [US3] Add HTTP error handling (404, 500, network errors) in ConfigManager
- [ ] T073 [US3] Implement schema validation using Zod in ConfigValidator
- [ ] T074 [US3] Add ConfigValidator.validateConfig() with detailed error messages
- [ ] T075 [P] [US3] Write unit tests for fetch error scenarios in packages/analytics-sdk-core/tests/unit/ConfigManager.test.ts

### Configuration Caching

- [ ] T076 [US3] Implement cache key generation in ConfigManager
- [ ] T077 [US3] Add cache timestamp tracking for staleness detection
- [ ] T078 [US3] Implement cache retrieval fallback on fetch failure
- [ ] T079 [P] [US3] Write unit tests for caching behavior in packages/analytics-sdk-core/tests/unit/ConfigManager.test.ts

### Integration Tests (US3)

- [ ] T080 [US3] Write integration test: Successful config fetch from remote API
- [ ] T081 [US3] Write integration test: Fallback to cached config on network error
- [ ] T082 [US3] Write integration test: Fallback to safe defaults when no cache exists
- [ ] T083 [US3] Write integration test: Invalid config schema rejected with error

**Checkpoint**: Remote configuration complete - providers controlled via API

---

## Phase 6: US5 - Event Routing and Enrichment (Priority: P3)

**Goal**: Auto-enrich events with metadata and route based on rules

**Independent Test**: Send event from specific microfrontend, verify enrichment metadata and routing rules applied

### Event Enrichment

- [ ] T084 [P] [US5] Enhance EventEnricher to add appName and mfeName from config in packages/analytics-sdk-core/src/events/EventEnricher.ts
- [ ] T085 [US5] Add sessionId generation and tracking in EventEnricher
- [ ] T086 [US5] Implement automatic timestamp enrichment if not provided
- [ ] T087 [US5] Add sdkVersion to metadata in EventEnricher
- [ ] T088 [P] [US5] Write unit tests for EventEnricher in packages/analytics-sdk-core/tests/unit/EventEnricher.test.ts

### Event Routing Rules

- [ ] T089 [P] [US5] Define RoutingRule interface in packages/analytics-sdk-core/src/types/RoutingRule.ts
- [ ] T090 [US5] Implement EventRouter.shouldRouteToProvider() based on rules
- [ ] T091 [US5] Add event name pattern matching (string and regex) in EventRouter
- [ ] T092 [US5] Implement provider whitelist and blacklist logic in EventRouter
- [ ] T093 [P] [US5] Write unit tests for routing rules in packages/analytics-sdk-core/tests/unit/EventRouter.test.ts

### Integration Tests (US5)

- [ ] T094 [US5] Write integration test: Event enriched with all metadata fields
- [ ] T095 [US5] Write integration test: Routing rule filters events by pattern
- [ ] T096 [US5] Write integration test: Provider blacklist works correctly

**Checkpoint**: Event enrichment and routing complete - advanced event control enabled

---

## Phase 7: US6 - Runtime Configuration Refresh (Priority: P4)

**Goal**: Periodically refresh configuration from remote API

**Independent Test**: Start app, change config remotely, wait for poll interval, verify new config applied

### Configuration Polling

- [ ] T097 [US6] Implement ConfigManager.startPolling() with setInterval in packages/analytics-sdk-core/src/config/ConfigManager.ts
- [ ] T098 [US6] Add polling interval configuration option to InitOptions
- [ ] T099 [US6] Implement config comparison to detect changes
- [ ] T100 [US6] Add provider reinitialization on config change
- [ ] T101 [US6] Implement polling cleanup on SDK shutdown (stopPolling)
- [ ] T102 [P] [US6] Write unit tests for polling behavior in packages/analytics-sdk-core/tests/unit/ConfigManager.test.ts

### Integration Tests (US6)

- [ ] T103 [US6] Write integration test: Polling triggers config refresh
- [ ] T104 [US6] Write integration test: Config changes applied without restart
- [ ] T105 [US6] Write integration test: Failed refresh uses last known good config

**Checkpoint**: Runtime configuration refresh complete - live config updates work

---

## Phase 8: US7 - Advanced Features (Priority: P5)

**Goal**: Event batching, retry mechanisms, and debug mode

**Independent Test**: Enable batch mode, send 10 events rapidly, verify single batch request

### Debug Mode

- [ ] T106 [P] [US7] Implement debug mode toggle based on config.debug in Logger
- [ ] T107 [US7] Add verbose logging for all SDK operations in Logger
- [ ] T108 [US7] Add performance timing logs (init duration, track overhead)
- [ ] T109 [P] [US7] Write unit tests for debug logging in packages/analytics-sdk-core/tests/unit/Logger.test.ts

### Event Batching (Optional)

- [ ] T110 [P] [US7] Design EventBatcher interface for future implementation
- [ ] T111 [US7] Add batch size and time window configuration placeholders
- [ ] T112 [US7] Document batching strategy in research.md (deferred to future version)

### Retry Mechanism (Optional)

- [ ] T113 [P] [US7] Design retry strategy with exponential backoff (documented, not implemented)
- [ ] T114 [US7] Add retry configuration placeholders to SDKConfiguration

### Monitoring Hooks

- [ ] T115 [US7] Implement setLoggerHooks() in AnalyticsSDK
- [ ] T116 [US7] Add onEventTracked hook invocation in EventRouter
- [ ] T117 [US7] Add onProviderError hook invocation in error handlers
- [ ] T118 [US7] Add onConfigLoaded hook invocation in ConfigManager
- [ ] T119 [P] [US7] Write unit tests for hooks in packages/analytics-sdk-core/tests/unit/AnalyticsSDK.test.ts

**Checkpoint**: Advanced features complete - debugging and observability enabled

---

## Phase 9: Angular Service Wrapper (Cross-Story)

**Purpose**: Angular DI integration for easy framework integration

**Dependencies**: Requires Phase 3 (US1 + US4) complete

- [ ] T120 Create AnalyticsConfig interface in packages/analytics-sdk-angular/src/lib/analytics.config.ts
- [ ] T121 Create ANALYTICS_CONFIG injection token in packages/analytics-sdk-angular/src/lib/analytics.config.ts
- [ ] T122 [P] Implement AnalyticsService with @Injectable in packages/analytics-sdk-angular/src/lib/analytics.service.ts
- [ ] T123 Add AnalyticsService.initialize() calling SDK.init()
- [ ] T124 Implement AnalyticsService.track() delegating to SDK
- [ ] T125 Implement AnalyticsService.identify() and page() methods
- [ ] T126 [P] Create AnalyticsModule with forRoot() pattern in packages/analytics-sdk-angular/src/lib/analytics.module.ts
- [ ] T127 Add APP_INITIALIZER provider for early SDK initialization
- [ ] T128 Create public-api.ts exports in packages/analytics-sdk-angular/src/public-api.ts
- [ ] T129 [P] Write Karma/Jasmine tests for AnalyticsService in packages/analytics-sdk-angular/tests/integration/analytics.service.spec.ts
- [ ] T130 Write test for APP_INITIALIZER integration

**Checkpoint**: Angular wrapper complete - DI-based integration ready

---

## Phase 10: Module Federation Examples (Cross-Story)

**Purpose**: Demonstrate singleton behavior and integration patterns

**Dependencies**: Requires Phase 3 (US1 + US4) and Phase 9 (Angular wrapper) complete

- [ ] T131 Create MFE host app with webpack Module Federation config in examples/mfe-host/
- [ ] T132 Configure shared singleton for analytics-sdk-core in host webpack config
- [ ] T133 Initialize SDK in host app with AnalyticsModule.forRoot()
- [ ] T134 [P] Create MFE remote-1 app in examples/mfe-remote-1/
- [ ] T135 [P] Create MFE remote-2 app in examples/mfe-remote-2/
- [ ] T136 Configure shared singleton in remote webpack configs
- [ ] T137 Add event tracking in remote components
- [ ] T138 Setup Playwright e2e test infrastructure in examples/tests/
- [ ] T139 Write e2e test: Verify single script tag across host + remotes
- [ ] T140 Write e2e test: Verify events from all MFEs route correctly
- [ ] T141 Write e2e test: Verify no event duplication

**Checkpoint**: Module Federation examples complete - singleton behavior demonstrated

---

## Phase 11: Documentation & Polish

**Purpose**: Finalize documentation, optimize bundle size, and validate performance

- [ ] T142 Write comprehensive README.md with installation and quickstart
- [ ] T143 Document provider plugin development guide in docs/provider-development.md
- [ ] T144 Create API reference documentation from TypeScript types
- [ ] T145 Add inline JSDoc comments to all public APIs
- [ ] T146 [P] Optimize bundle size to meet <20KB gzipped target
- [ ] T147 [P] Run performance benchmarks (init time, track overhead)
- [ ] T148 Validate all performance goals met (see plan.md Performance Goals)
- [ ] T149 Create CHANGELOG.md with initial v1.0.0 release notes
- [ ] T150 Run quickstart.md validation tests to verify all examples work
- [ ] T151 Create LICENSE file (MIT or Apache 2.0)
- [ ] T152 Setup CI/CD pipeline for automated testing and publishing

**Checkpoint**: Project complete and production-ready ✅

---

## Dependencies & Parallel Execution

### Critical Path (Must Complete in Order)
1. Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1 + US4 MVP)
2. Phase 3 → Phase 9 (Angular wrapper)
3. Phase 3 + Phase 9 → Phase 10 (Examples)

### Parallelizable Phases (After MVP)
- Phase 4 (US2), Phase 5 (US3), Phase 6 (US5) can run in parallel after Phase 3
- Phase 7 (US6) can run in parallel after Phase 5 (requires ConfigManager)
- Phase 8 (US7) can run in parallel after Phase 3

### Suggested MVP Scope
**Minimum Viable Product** (Ready for initial deployment):
- Phase 1 (Setup): T001-T010
- Phase 2 (Foundation): T011-T021
- Phase 3 (US1 + US4): T022-T056
- Phase 9 (Angular wrapper): T120-T130
- Phase 10 (Examples): T131-T141

**Total MVP Tasks**: 91 tasks

**Post-MVP Enhancements**:
- Phase 4-8: Additional providers, routing, polling, advanced features
- Phase 11: Documentation polish

---

## Task Summary

| Phase | Task Range | Count | Priority | Description |
|-------|-----------|-------|----------|-------------|
| Phase 1 | T001-T010 | 10 | Setup | Project initialization |
| Phase 2 | T011-T021 | 11 | Foundation | Core infrastructure (blocking) |
| Phase 3 | T022-T056 | 35 | P1 (MVP) | US1 + US4 - Single provider + Singleton |
| Phase 4 | T057-T070 | 14 | P2 | US2 - Multi-provider architecture |
| Phase 5 | T071-T083 | 13 | P2 | US3 - Remote dynamic configuration |
| Phase 6 | T084-T096 | 13 | P3 | US5 - Event routing and enrichment |
| Phase 7 | T097-T105 | 9 | P4 | US6 - Runtime config refresh |
| Phase 8 | T106-T119 | 14 | P5 | US7 - Advanced features (debug, batching) |
| Phase 9 | T120-T130 | 11 | Cross-Story | Angular service wrapper |
| Phase 10 | T131-T141 | 11 | Cross-Story | Module Federation examples |
| Phase 11 | T142-T152 | 11 | Polish | Documentation and optimization |

**Total Tasks**: 152

**MVP Tasks** (Phase 1, 2, 3, 9, 10): 78 tasks
**Enhancement Tasks** (Phase 4-8, 11): 74 tasks

**Parallel Opportunities**: 48 tasks marked with [P] can run in parallel within their phase

---

## Implementation Strategy

### Iteration 1: MVP (US1 + US4)
- Complete Phase 1, 2, 3 (T001-T056)
- Deliverable: Core SDK with Google Analytics, singleton pattern, event queueing
- Testing: Integration tests verify single provider works in Module Federation

### Iteration 2: Angular Integration
- Complete Phase 9, 10 (T120-T141)
- Deliverable: Angular service wrapper + MFE examples
- Testing: E2E tests verify singleton across microfrontends

### Iteration 3: Multi-Provider (US2 + US3)
- Complete Phase 4, 5 (T057-T083)
- Deliverable: CleverTap provider + remote configuration
- Testing: Multi-provider routing verified

### Iteration 4: Advanced Features (US5 + US6 + US7)
- Complete Phase 6, 7, 8 (T084-T119)
- Deliverable: Event enrichment, routing, polling, debug mode
- Testing: Advanced features validated

### Iteration 5: Polish & Release
- Complete Phase 11 (T142-T152)
- Deliverable: Documentation, performance validation, v1.0.0 release
- Testing: All quickstart scenarios validated

---

## Constitution Alignment

All tasks align with Analytics SDK Constitution v1.0.0:

✅ **Config Over Code**: T071-T083 (remote config)
✅ **Plugin Architecture**: T031-T035, T057-T062 (provider registry and plugins)
✅ **Singleton Pattern**: T022-T025, T055-T056 (window global + webpack shared)
✅ **Runtime Safety**: T038, T064 (try-catch error isolation)
✅ **Performance-First**: T008, T146-T148 (<20KB bundle, <500ms init)
✅ **Idempotent Operations**: T024 (init called multiple times)
✅ **Event Queueing**: T020, T049-T050 (queue before init, replay after)
✅ **Security**: T017-T019 (HTTPS validation, script loading)
✅ **Observability**: T015-T016, T106-T119 (logging and hooks)

All 13 constitutional principles enforced through task design.
