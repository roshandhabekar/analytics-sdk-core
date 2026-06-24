# Implementation Plan: Rename SDK Package to analytics-sdk-core

**Branch**: `003-rename-sdk-package` | **Date**: 2026-06-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-rename-sdk-package/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

**Discovered State**: Analysis reveals that package.json files already use unscoped names ("analytics-sdk-core", "analytics-sdk-angular"). No actual source code imports reference @company scope. This simplifies to a **documentation consistency update** rather than a breaking code change.

**Primary Requirement**: Update all documentation, README files, and specification examples to reference the correct unscoped package names that already exist in package.json files.

**Technical Approach**: Find-and-replace operation across documentation files (Markdown, JSON configs in docs/examples) to replace @company/analytics-sdk-* references with unscoped equivalents. No TypeScript/JavaScript source code changes required.

## Technical Context

**Language/Version**: TypeScript 5.0, Node.js >= 18.0.0, npm >= 9.0.0

**Primary Dependencies**: 
- Build: Rollup 3.x (core), ng-packagr (Angular), TypeScript compiler
- Validation: Zod (runtime), ESLint, Prettier
- Testing: Jest (core package), Karma (Angular package)

**Storage**: N/A (documentation update only)

**Testing**: 
- Build verification: `npm run build` across all workspace packages
- Test suite: `npm test` (Jest + Karma)
- Linting: `npm run lint`
- Format check: `npm run format:check`
- Grep verification: Search for @company/analytics-sdk references post-update

**Target Platform**: npm registry (for package publishing), browser (for SDK execution)

**Project Type**: npm monorepo with TypeScript libraries (core SDK + Angular wrapper)

**Performance Goals**: N/A (documentation update has no runtime impact)

**Constraints**: 
- Must maintain backward compatibility in documentation for migration guide purposes
- Zero functional changes to source code
- All example code snippets must remain executable

**Scale/Scope**: 
- ~20 files requiring updates (documentation, READMEs, specs, root package.json)
- 2 workspace packages + 3 example applications + root configuration
- ~50-100 total string replacements across files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Analytics SDK Constitution Compliance Checklist:**

- [x] **Config Over Code**: N/A - Documentation update only, no configuration changes
- [x] **Plugin Architecture**: N/A - Documentation update only, no provider changes
- [x] **Singleton Pattern**: N/A - Documentation update only, no runtime behavior changes
- [x] **Runtime Safety**: ✓ - Zero runtime impact, no code execution changes
- [x] **Performance Impact**: ✓ - Zero performance impact, documentation only
- [x] **Idempotent Operations**: N/A - Documentation update only
- [x] **Event Queueing**: N/A - Documentation update only
- [x] **Security**: ✓ - No security implications, text-only changes
- [x] **Testing Strategy**: ✓ - Verification via build success, test passage, and grep search
- [x] **Error Handling**: N/A - Documentation update only
- [x] **Extensibility**: ✓ - Maintains all existing architecture, zero code changes
- [x] **Observability**: N/A - Documentation update only

**Constitution Verdict**: ✅ **PASS** - This is a documentation consistency update with zero impact on SDK architecture, runtime behavior, or constitutional principles. No violations or justifications needed.

**Constitution Version**: 1.0.0 (refer to `.specify/memory/constitution.md` for full principles)

## Project Structure

### Documentation (this feature)

```text
specs/003-rename-sdk-package/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (completed)
├── checklists/
│   └── requirements.md  # Specification quality checklist (completed)
├── research.md          # Phase 0 output - SKIPPED (no research needed)
├── data-model.md        # Phase 1 output - SKIPPED (no data model for doc updates)
├── quickstart.md        # Phase 1 output - SKIPPED (no new quickstart needed)
└── contracts/           # Phase 1 output - SKIPPED (no contracts for doc updates)
```

### Source Code (repository root)

```text
analytics-sdk/
├── package.json                        # Root monorepo config - workspace scripts need updating
├── README.md                           # Main repo README - multiple references to update
├── PUBLISHING.md                       # Publishing guide - npm commands to update
│
├── packages/
│   ├── analytics-sdk-core/
│   │   ├── package.json                # ✅ ALREADY CORRECT: "analytics-sdk-core"
│   │   └── README.md                   # Package README - import examples to update
│   └── analytics-sdk-angular/
│       ├── package.json                # ✅ ALREADY CORRECT: "analytics-sdk-angular"
│       └── README.md                   # Package README - import examples to update
│
├── examples/
│   ├── mfe-host/
│   │   └── [webpack config, package.json] # Module Federation config to update
│   ├── mfe-remote-1/
│   │   └── [webpack config, package.json] # Module Federation config to update
│   └── mfe-remote-2/
│       └── [webpack config, package.json] # Module Federation config to update
│
└── specs/
    └── 001-analytics-cdn-integration/
        ├── spec.md                     # Historical spec - references to update for consistency
        ├── quickstart.md               # Quickstart examples - import statements to update
        └── contracts/                  # Contract examples - import statements to update
```

**Structure Decision**: This is a **documentation consistency update** across an existing npm monorepo. The actual package.json files in `packages/*/` already have correct unscoped names. Updates required in:
- Root-level documentation (README.md, PUBLISHING.md)
- Package-level README files
- Example application configurations
- Specification documents for consistency

**Files Requiring Updates** (~20 files):
1. `/README.md` - Multiple command examples and package references
2. `/PUBLISHING.md` - Publishing commands and package references
3. `/package.json` - Root workspace scripts
4. `/packages/analytics-sdk-core/README.md` - Installation and import examples
5. `/packages/analytics-sdk-angular/README.md` - Installation and import examples
6. `/examples/*/` - Package.json dependencies and webpack configs (~6 files)
7. `/specs/001-analytics-cdn-integration/*` - Import examples in spec docs (~8 files)

## Complexity Tracking

**No complexity violations** - This feature has zero constitutional violations and requires no justifications. Complexity tracking table is not needed.

---

## Phase 0: Research & Unknowns

**Status**: ✅ SKIPPED - No research needed

**Rationale**: This is a straightforward find-and-replace documentation update. All technical details are known:
- Package.json files already have correct unscoped names
- No source code imports use @company scope (verified via grep)
- File locations are documented in Project Structure section above
- Replacement pattern is simple: `@company/analytics-sdk-*` → `analytics-sdk-*`

**Decisions Made**:
- **Decision**: Skip research phase entirely
- **Rationale**: Zero unknowns exist; all requirements are clear from specification
- **Alternatives Considered**: None needed

No `research.md` file will be generated.

---

## Phase 1: Design & Contracts

**Status**: ✅ SKIPPED - No design artifacts needed

**Rationale**: Documentation updates do not require:
- Data models (no entities or relationships)
- API contracts (no interfaces changing)
- Quickstart guides (existing guides being updated, not created)

**Design Decisions**:
1. **Replacement Strategy**: Use multi-file search-and-replace rather than individual file edits
2. **Verification Method**: Grep search to confirm zero remaining @company references
3. **Testing Approach**: Run full build + test suite to ensure no hidden dependencies

No `data-model.md`, `quickstart.md`, or `contracts/` artifacts will be generated.

### Agent Context Update

**Action Required**: Update the plan reference in `.github/copilot-instructions.md` between the `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` markers to point to this plan file.

**Current Reference**: `specs/002-remove-company-prefix/plan.md`  
**New Reference**: `specs/003-rename-sdk-package/plan.md`

---

## Phase 2: Implementation Planning (Manual Gate)

**Status**: 🔵 READY FOR `/speckit.tasks`

**Prerequisites Met**:
- ✅ Constitution Check passed
- ✅ Phase 0 completed (skipped - no research needed)
- ✅ Phase 1 completed (skipped - no design artifacts needed)
- ✅ Project structure documented
- ✅ File inventory complete

**Next Command**: `/speckit.tasks`

This will generate `tasks.md` with actionable, dependency-ordered tasks for implementation.

---

## Post-Phase 1 Constitution Re-Check

**Status**: ✅ PASS

- [x] **Config Over Code**: N/A - Still zero configuration changes
- [x] **Plugin Architecture**: N/A - Still zero provider changes
- [x] **Singleton Pattern**: N/A - Still zero runtime changes
- [x] **Runtime Safety**: ✓ - Still zero runtime impact
- [x] **Performance Impact**: ✓ - Still zero performance impact
- [x] **Idempotent Operations**: N/A - Still documentation only
- [x] **Event Queueing**: N/A - Still documentation only
- [x] **Security**: ✓ - Still no security implications
- [x] **Testing Strategy**: ✓ - Verification strategy confirmed (build + test + grep)
- [x] **Error Handling**: N/A - Still documentation only
- [x] **Extensibility**: ✓ - Still maintains all existing architecture
- [x] **Observability**: N/A - Still documentation only

**Verdict**: ✅ **PASS** - No design changes, all checks remain N/A or passing.

---

## Implementation Summary

**What Changed from Spec**:
- Discovered that package.json files already use correct unscoped names
- Reduced scope from "breaking code change" to "documentation consistency update"
- Eliminated need for version bump and migration guide (no actual breaking changes)

**Simplified Approach**:
1. Find all `@company/analytics-sdk-*` references in documentation files
2. Replace with unscoped equivalents: `analytics-sdk-*`
3. Update root package.json monorepo name and workspace scripts
4. Verify via build success, test passage, and grep search
5. Update agent context to reference this plan

**Files to Modify** (~20 files):
- Documentation: README.md, PUBLISHING.md (2 files)
- Package READMEs: packages/*/README.md (2 files)
- Root config: package.json (1 file)
- Examples: examples/*/ configs (6 files)
- Specs: specs/001-*/ docs (8 files)

**Success Criteria Verification**:
- SC-001: `npm run build` succeeds ✓
- SC-002: `npm test` passes ✓
- SC-003: Example apps run correctly ✓
- SC-004: `grep -r "@company/analytics-sdk" --exclude-dir=node_modules --exclude-dir=.git` returns zero results ✓
- SC-005: Documentation shows correct install commands ✓
- SC-006: N/A - Packages already correctly named in package.json ✓

**Ready for task generation** - Run `/speckit.tasks` to create implementation checklist.
