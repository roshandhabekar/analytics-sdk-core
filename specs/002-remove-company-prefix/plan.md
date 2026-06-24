# Implementation Plan: Remove @company Prefix from Documentation

**Branch**: `002-remove-company-prefix` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-remove-company-prefix/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Remove all `@company/` scope prefix references from project documentation, configuration files, example applications, and specification documents. Update package names to unscoped variants (`analytics-sdk-core`, `analytics-sdk-angular`) and the monorepo root to `analytics-sdk-monorepo` for consistency. This is a documentation hygiene task with no code functionality changes.

## Technical Context

**Language/Version**: Markdown (documentation), JSON (package.json files), TypeScript (example configuration snippets)

**Primary Dependencies**: N/A - Documentation and configuration updates only

**Storage**: N/A - File system modifications only

**Testing**: Manual verification via grep search for `@company` string, npm workspace command execution tests

**Target Platform**: Cross-platform (documentation consumed by developers on any OS)

**Project Type**: Monorepo documentation and configuration updates

**Performance Goals**: N/A - No runtime impact (documentation only)

**Constraints**: Must maintain backward compatibility in package.json structure; no breaking changes to actual package names (already correct)

**Scale/Scope**: ~20 file modifications across documentation (README.md, PUBLISHING.md), root package.json, 3 example applications, and 1 specification directory

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Analytics SDK Constitution Compliance Checklist:**

- [x] **Config Over Code**: N/A - Documentation update only, no behavioral changes
- [x] **Plugin Architecture**: N/A - No provider modifications
- [x] **Singleton Pattern**: N/A - No runtime behavior changes
- [x] **Runtime Safety**: N/A - Documentation only; cannot impact runtime
- [x] **Performance Impact**: N/A - Zero runtime impact (documentation changes only)
- [x] **Idempotent Operations**: N/A - No SDK operations modified
- [x] **Event Queueing**: N/A - No event handling changes
- [x] **Security**: ✅ PASS - No security implications; documentation hygiene only
- [x] **Testing Strategy**: ✅ PASS - Manual verification via grep + npm workspace command tests
- [x] **Error Handling**: N/A - No error paths modified
- [x] **Extensibility**: ✅ PASS - Maintains clarity for future contributors by using correct package names
- [x] **Observability**: N/A - No logging or monitoring changes

**Constitution Version**: 1.0.0 (refer to `.specify/memory/constitution.md` for full principles)

**Assessment**: ✅ **ALL APPLICABLE CHECKS PASS** - This is a documentation hygiene feature with zero impact on SDK runtime behavior, architecture, or constitution compliance. Most principles are N/A as no code functionality is modified.

## Project Structure

### Documentation (this feature)

```text
specs/002-remove-company-prefix/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (completed)
├── checklists/
│   └── requirements.md  # Quality checklist (completed)
├── research.md          # Phase 0 output (SKIP - minimal research needed)
├── data-model.md        # Phase 1 output (SKIP - no data model for docs)
├── quickstart.md        # Phase 1 output (SKIP - documentation changes)
├── contracts/           # Phase 1 output (SKIP - no external contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

**Note**: Phases 0 and 1 artifacts (research.md, data-model.md, quickstart.md, contracts/) are **SKIPPED** for this feature as it involves only documentation and configuration updates with no architectural decisions, data models, or API contracts.

### Source Code (repository root)

```text
analytics-sdk/                      # Monorepo root
├── package.json                    # ✏️ UPDATE: Root monorepo config
├── README.md                       # ✏️ UPDATE: Main documentation
├── PUBLISHING.md                   # ✏️ UPDATE: Publishing guide
├── packages/
│   ├── analytics-sdk-core/
│   │   └── package.json            # ✅ ALREADY CORRECT: "analytics-sdk-core"
│   └── analytics-sdk-angular/
│       └── package.json            # ✅ ALREADY CORRECT: "analytics-sdk-angular"
├── examples/
│   ├── mfe-host/
│   │   ├── package.json            # ✏️ UPDATE: Example dependencies
│   │   └── webpack.config.js       # ✏️ UPDATE: Module Federation config
│   ├── mfe-remote-1/
│   │   ├── package.json            # ✏️ UPDATE: Example dependencies
│   │   └── webpack.config.js       # ✏️ UPDATE: Module Federation config
│   └── mfe-remote-2/
│       ├── package.json            # ✏️ UPDATE: Example dependencies
│       └── webpack.config.js       # ✏️ UPDATE: Module Federation config
└── specs/
    └── 001-analytics-cdn-integration/  # ✏️ UPDATE: Spec docs for consistency
        ├── spec.md
        ├── plan.md
        ├── quickstart.md
        ├── contracts/
        └── ...
```

**Legend**:
- ✏️ **UPDATE**: Files requiring @company → analytics-sdk-* replacements
- ✅ **ALREADY CORRECT**: Files already using correct package names (no changes needed)

**Structure Decision**: This is a documentation/configuration update feature affecting the monorepo root level documentation (README.md, PUBLISHING.md, package.json), example applications, and existing specification documents. No changes to source code in `packages/*/src/` directories.

## Complexity Tracking

**No Constitution Violations** - This feature has zero complexity and no architectural implications.

All constitution checks are N/A or passing. This is a straightforward documentation update with no justification needed.

---

## Phase 0: Research (SKIPPED)

**Status**: ✅ SKIPPED - No research artifacts needed

**Rationale**: This is a simple find-and-replace operation across documentation and configuration files. All decisions have been clarified during specification:

- **What to change**: `@company/analytics-sdk-core` → `analytics-sdk-core`, `@company/analytics-sdk-angular` → `analytics-sdk-angular`, `@company/analytics-sdk-monorepo` → `analytics-sdk-monorepo`
- **Where to change**: README.md, PUBLISHING.md, root package.json, examples/*, specs/001-analytics-cdn-integration/*
- **What NOT to change**: Source code in packages/*/src (confirmed no references exist)

**No technical decisions required**:
- No architecture patterns to research
- No library/framework evaluations
- No performance considerations
- No integration patterns

**Outcome**: Proceed directly to Phase 2 (task generation)

---

## Phase 1: Design & Contracts (SKIPPED)

**Status**: ✅ SKIPPED - No design artifacts needed

**Rationale**: Documentation updates do not require:

- **data-model.md**: No data entities or relationships
- **contracts/**: No external API contracts or public interfaces modified
- **quickstart.md**: No new integration workflows (existing docs updated only)

**What's being updated** (not designed):

1. **Documentation Files** (README.md, PUBLISHING.md)
   - Installation examples
   - Build commands
   - Publishing instructions
   - Package URLs

2. **Configuration Files** (package.json files)
   - Monorepo root name
   - Workspace script references

3. **Example Applications** (examples/*)
   - Package dependencies
   - Module Federation configurations

4. **Specification Documents** (specs/001-analytics-cdn-integration/*)
   - Consistency updates to match current naming

**Outcome**: Proceed directly to Phase 2 (task generation)

---

## Phase 2: Ready for Task Generation

**Status**: ✅ READY

This plan is complete and ready for `/speckit.tasks` command.

**Pre-Task Checklist**:
- [x] Constitution gate passed (all applicable checks)
- [x] Technical context defined (Markdown, JSON, TypeScript config)
- [x] Project structure documented (monorepo layout)
- [x] Phase 0 evaluation complete (SKIPPED - no research needed)
- [x] Phase 1 evaluation complete (SKIPPED - no design artifacts needed)
- [x] File scope clearly defined (docs, config, examples, specs only)

**Implementation Approach**:

The implementation will follow a **file-by-file replacement strategy**:

1. **Automated Search**: Use `grep -r "@company" --include="*.md" --include="*.json" --include="*.js"` to identify all occurrences
2. **Manual Review**: Review each occurrence to ensure context (avoid false positives)
3. **Batch Replacement**: Update all files in logical groups:
   - Group 1: Root documentation (README.md, PUBLISHING.md, package.json)
   - Group 2: Example applications (each example independently)
   - Group 3: Specification documents (specs/001-analytics-cdn-integration/*)
4. **Verification**: Run `grep -r "@company"` to confirm zero occurrences
5. **Functional Testing**: Execute npm workspace commands to ensure no breakage

**Key Files to Update** (from clarification and spec):

| File Path | Changes Required |
|-----------|------------------|
| `README.md` | npm commands, Module Federation examples, package references |
| `PUBLISHING.md` | Publishing commands, version bump commands, NPM URLs, scope access guidance |
| `package.json` (root) | Monorepo name, workspace script references |
| `examples/mfe-host/package.json` | Dependencies, devDependencies |
| `examples/mfe-host/webpack.config.js` | Module Federation shared config |
| `examples/mfe-remote-1/package.json` | Dependencies |
| `examples/mfe-remote-1/webpack.config.js` | Module Federation shared config |
| `examples/mfe-remote-2/package.json` | Dependencies |
| `examples/mfe-remote-2/webpack.config.js` | Module Federation shared config |
| `specs/001-analytics-cdn-integration/*.md` | Package name references |
| `specs/001-analytics-cdn-integration/contracts/*.md` | Package name references |

**Success Criteria Validation**:

After task execution, verify:

- ✅ **SC-001**: Zero occurrences of `@company/` via `grep -r "@company" --include="*.md" --include="*.json" --include="*.js"`
- ✅ **SC-002**: npm install examples copy-paste successfully
- ✅ **SC-003**: `npm run build -w analytics-sdk-core` and similar commands execute
- ✅ **SC-004**: Documentation review shows no confusion

**Next Command**: `/speckit.tasks` to generate actionable task breakdown

