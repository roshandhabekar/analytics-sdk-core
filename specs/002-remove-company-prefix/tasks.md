# Tasks: Remove @company Prefix from Documentation

**Input**: Design documents from `/specs/002-remove-company-prefix/`

**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: No test tasks included - this is a documentation-only feature with manual verification via grep search and npm command execution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Discovery & Verification)

**Purpose**: Identify all @company references and verify current package.json files

- [ ] T001 Run comprehensive search: `grep -r "@company" --include="*.md" --include="*.json" --include="*.js" --exclude-dir=node_modules` to identify all occurrences
- [ ] T002 [P] Verify packages/analytics-sdk-core/package.json already uses "analytics-sdk-core" (no @company prefix)
- [ ] T003 [P] Verify packages/analytics-sdk-angular/package.json already uses "analytics-sdk-angular" (no @company prefix)
- [ ] T004 Document all files requiring updates based on grep results (create checklist for verification)

---

## Phase 2: Foundational (SKIPPED)

**Status**: ✅ SKIPPED - No blocking prerequisites for documentation updates

**Rationale**: Documentation files can be updated independently without shared infrastructure

**Checkpoint**: Proceed directly to user story implementation

---

## Phase 3: User Story 1 - Update Package References in Documentation (Priority: P1) 🎯 MVP

**Goal**: Update README.md with correct package names so developers can successfully install and use the SDK

**Independent Test**: Read README.md and verify all npm commands, package references, and Module Federation examples use correct package names (analytics-sdk-core, analytics-sdk-angular)

### Implementation for User Story 1

- [ ] T005 [US1] Update npm build command from `@company/analytics-sdk-core` to `analytics-sdk-core` in README.md line ~58
- [ ] T006 [US1] Update npm test:watch command from `@company/analytics-sdk-core` to `analytics-sdk-core` in README.md line ~68
- [ ] T007 [US1] Update package heading from `### @company/analytics-sdk-core` to `### analytics-sdk-core` in README.md line ~86
- [ ] T008 [US1] Update package heading from `### @company/analytics-sdk-angular` to `### analytics-sdk-angular` in README.md line ~100
- [ ] T009 [US1] Update Module Federation shared configuration example from `'@company/analytics-sdk-core'` to `'analytics-sdk-core'` in README.md line ~119

**Checkpoint**: README.md should now have zero @company references and all examples should be copy-paste ready

---

## Phase 4: User Story 2 - Update Publishing Guide (Priority: P2)

**Goal**: Update PUBLISHING.md with accurate publishing instructions using correct package names

**Independent Test**: Read PUBLISHING.md and verify all npm publish commands, version commands, and package URLs use correct package names

### Implementation for User Story 2

- [ ] T010 [US2] Remove or update "Access Rights" section guidance about @company scope access in PUBLISHING.md line ~12
- [ ] T011 [US2] Update or remove "Package Scoping" section explaining @company scope in PUBLISHING.md line ~19
- [ ] T012 [US2] Update example showing package name change from `@company/analytics-sdk-core` in PUBLISHING.md line ~26
- [ ] T013 [US2] Update package naming guidance from `@company/analytics-sdk-core` in PUBLISHING.md line ~32
- [ ] T014 [US2] Update version bump command from `@company/analytics-sdk-core` to `analytics-sdk-core` in PUBLISHING.md line ~115
- [ ] T015 [US2] Update version bump command from `@company/analytics-sdk-angular` to `analytics-sdk-angular` in PUBLISHING.md line ~116
- [ ] T016 [US2] Update minor version command from `@company/analytics-sdk-core` to `analytics-sdk-core` in PUBLISHING.md line ~119
- [ ] T017 [US2] Update minor version command from `@company/analytics-sdk-angular` to `analytics-sdk-angular` in PUBLISHING.md line ~120
- [ ] T018 [US2] Update major version command from `@company/analytics-sdk-core` to `analytics-sdk-core` in PUBLISHING.md line ~123
- [ ] T019 [US2] Update major version command from `@company/analytics-sdk-angular` to `analytics-sdk-angular` in PUBLISHING.md line ~124
- [ ] T020 [US2] Update NPM package URL from `@company/analytics-sdk-core` to `analytics-sdk-core` in PUBLISHING.md line ~141
- [ ] T021 [US2] Update NPM package URL from `@company/analytics-sdk-angular` to `analytics-sdk-angular` in PUBLISHING.md line ~142
- [ ] T022 [US2] Update installation example from `@company/analytics-sdk-core` to `analytics-sdk-core` in PUBLISHING.md line ~148
- [ ] T023 [US2] Add guidance explaining packages are published publicly without scope prefix (replace old scope access instructions)

**Checkpoint**: PUBLISHING.md should have zero @company references and accurate publishing workflow

---

## Phase 5: User Story 3 - Update Root Package Configuration (Priority: P3)

**Goal**: Update root package.json with correct monorepo name and workspace script references

**Independent Test**: Review root package.json and execute npm workspace commands to verify correct package references

### Implementation for User Story 3

- [ ] T024 [US3] Update root package.json "name" field from `@company/analytics-sdk-monorepo` to `analytics-sdk-monorepo` in package.json line ~2
- [ ] T025 [US3] Update "publish:core" script from `@company/analytics-sdk-core` to `analytics-sdk-core` in package.json line ~17
- [ ] T026 [US3] Update "publish:angular" script from `@company/analytics-sdk-angular` to `analytics-sdk-angular` in package.json line ~18

**Checkpoint**: Root package.json updated; workspace commands should execute successfully

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Update example applications and specification documents for consistency

### Example Applications Updates

- [ ] T027 [P] Update examples/mfe-host/package.json dependencies from `@company/analytics-sdk-core` to `analytics-sdk-core`
- [ ] T028 [P] Update examples/mfe-host/webpack.config.js Module Federation shared config from `@company/analytics-sdk-core` to `analytics-sdk-core`
- [ ] T029 [P] Update examples/mfe-remote-1/package.json dependencies from `@company/analytics-sdk-core` to `analytics-sdk-core`
- [ ] T030 [P] Update examples/mfe-remote-1/webpack.config.js Module Federation shared config from `@company/analytics-sdk-core` to `analytics-sdk-core`
- [ ] T031 [P] Update examples/mfe-remote-2/package.json dependencies from `@company/analytics-sdk-core` to `analytics-sdk-core`
- [ ] T032 [P] Update examples/mfe-remote-2/webpack.config.js Module Federation shared config from `@company/analytics-sdk-core` to `analytics-sdk-core`

### Specification Documents Updates (Consistency)

- [ ] T033 [P] Search and update all @company references in specs/001-analytics-cdn-integration/spec.md
- [ ] T034 [P] Search and update all @company references in specs/001-analytics-cdn-integration/plan.md
- [ ] T035 [P] Search and update all @company references in specs/001-analytics-cdn-integration/quickstart.md
- [ ] T036 [P] Search and update all @company references in specs/001-analytics-cdn-integration/research.md
- [ ] T037 [P] Search and update all @company references in specs/001-analytics-cdn-integration/data-model.md
- [ ] T038 [P] Search and update all @company references in specs/001-analytics-cdn-integration/contracts/*.md files

### Final Verification

- [ ] T039 Run final verification: `grep -r "@company" --include="*.md" --include="*.json" --include="*.js" --exclude-dir=node_modules` to confirm zero occurrences
- [ ] T040 Test npm workspace command: `npm run build -w analytics-sdk-core` executes successfully
- [ ] T041 Test npm workspace command: `npm run test -w analytics-sdk-angular` executes successfully
- [ ] T042 Review README.md installation examples are copy-paste ready
- [ ] T043 Review PUBLISHING.md publishing workflow is accurate and complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: SKIPPED - not needed for documentation updates
- **User Stories (Phase 3, 4, 5)**: Can start after Setup (Phase 1) completion
  - User stories can proceed in parallel (different files, no conflicts)
  - Or sequentially in priority order: US1 (README.md) → US2 (PUBLISHING.md) → US3 (package.json)
- **Polish (Phase 6)**: Can start anytime after Setup; no dependencies on user stories (different files)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - Updates README.md only - No dependencies
- **User Story 2 (P2)**: Can start after Setup - Updates PUBLISHING.md only - No dependencies
- **User Story 3 (P3)**: Can start after Setup - Updates root package.json only - No dependencies
- **ALL USER STORIES ARE INDEPENDENT** - Can be implemented in parallel by different team members

### Within Each User Story

- All tasks within a user story operate on the same file
- Execute tasks sequentially within each user story (line-by-line updates)
- Or group related changes in a single edit operation

### Parallel Opportunities

- **Setup tasks**: T002, T003 can run in parallel (different files)
- **User Stories 1, 2, 3**: ALL can run in parallel (different files: README.md, PUBLISHING.md, package.json)
- **Example applications (Phase 6)**: T027-T032 can ALL run in parallel (different example directories)
- **Specification docs (Phase 6)**: T033-T038 can ALL run in parallel (different .md files)
- **Maximum parallelization**: After T001 completes, launch all remaining tasks in parallel (39 tasks across different files)

---

## Parallel Example: Maximum Throughput

```bash
# After Setup (T001-T004) completes, launch everything in parallel:

# User Story 1 (1 team member or AI agent on README.md):
Tasks T005-T009 (README.md updates)

# User Story 2 (1 team member or AI agent on PUBLISHING.md):
Tasks T010-T023 (PUBLISHING.md updates)

# User Story 3 (1 team member or AI agent on package.json):
Tasks T024-T026 (root package.json updates)

# Examples (1 team member or AI agent on examples/):
Tasks T027-T032 in parallel (all examples simultaneously)

# Spec docs (1 team member or AI agent on specs/001-*/):
Tasks T033-T038 in parallel (all spec files simultaneously)

# Final verification:
Tasks T039-T043 (after all updates complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Fastest Path to Value)

1. Complete Phase 1: Setup (T001-T004) - Identify all occurrences
2. Complete Phase 3: User Story 1 (T005-T009) - Update README.md
3. **STOP and VALIDATE**: 
   - Verify README.md has zero @company references
   - Test npm install examples from README
   - **MVP DELIVERED**: Users can now follow accurate README documentation
4. Deploy/publish updated README if needed

### Incremental Delivery (Recommended)

1. **Setup** (T001-T004) → All @company occurrences identified
2. **User Story 1** (T005-T009) → README.md updated → **MVP: User-facing docs correct** ✅
3. **User Story 2** (T010-T023) → PUBLISHING.md updated → **Maintainer docs accurate** ✅
4. **User Story 3** (T024-T026) → Root config updated → **Internal consistency** ✅
5. **Polish** (T027-T043) → Examples & spec docs updated → **Complete consistency** ✅
6. Each phase delivers independent value without breaking previous work

### Parallel Team Strategy (Fastest Implementation)

With multiple developers or AI coding agents:

1. **Everyone completes Setup together** (T001-T004)
2. **Once Setup is done, split work:**
   - **Developer/Agent A**: User Story 1 (T005-T009) - README.md
   - **Developer/Agent B**: User Story 2 (T010-T023) - PUBLISHING.md
   - **Developer/Agent C**: User Story 3 (T024-T026) - Root package.json
   - **Developer/Agent D**: Examples (T027-T032) - All examples in parallel
   - **Developer/Agent E**: Spec docs (T033-T038) - All spec files in parallel
3. **Everyone converges for final verification** (T039-T043)
4. **Total estimated time**: ~30-45 minutes with parallel execution vs. ~2-3 hours sequential

### Single Developer Strategy

1. Setup → US1 (README) → US2 (PUBLISHING) → US3 (package.json) → Examples → Spec docs → Verify
2. Take breaks between user stories to validate each independently
3. Estimated time: ~2-3 hours with careful verification

---

## Notes

- **No [P] markers within user stories** - Each story updates a single file, so tasks run sequentially within that file
- **[P] markers in Polish phase** - Different files can be updated in parallel
- **Zero code changes** - Only documentation and configuration files (no source code in packages/*/src/)
- **No tests to write** - Verification is manual (grep search + npm commands)
- **All changes are reversible** - Git commit after each user story for easy rollback
- **Success = Zero @company occurrences** - Final grep search must return zero results
- **Functional validation**: npm workspace commands must execute without errors after updates

---

## Success Criteria Validation (from spec.md)

After completing all tasks, verify:

- ✅ **SC-001**: Zero occurrences of `@company/` via `grep -r "@company" --include="*.md" --include="*.json" --include="*.js"` (Task T039)
- ✅ **SC-002**: npm install examples copy-paste successfully from README.md (Task T042)
- ✅ **SC-003**: `npm run build -w analytics-sdk-core` and similar commands execute (Tasks T040-T041)
- ✅ **SC-004**: Documentation review shows no confusion between actual and documented package names (Task T043)
