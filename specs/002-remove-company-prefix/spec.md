# Feature Specification: Remove @company Prefix from Documentation

**Feature Branch**: `002-remove-company-prefix`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "remove @company text from sdk. it should be analytics-sdk-core"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Package References in Documentation (Priority: P1)

Developers and users following the documentation need to see accurate package names that match the actual published package names, without legacy @company scope references.

**Why this priority**: This is critical because documentation is the first point of contact for users. Incorrect package names will cause confusion and installation failures.

**Independent Test**: Can be fully tested by reading README.md and verifying all npm install commands and package references use correct package names (e.g., `analytics-sdk-core` instead of `@company/analytics-sdk-core`)

**Acceptance Scenarios**:

1. **Given** a developer reading the README.md, **When** they view npm installation examples, **Then** they see correct package names without @company prefix
2. **Given** a developer viewing build commands, **When** they reference workspace-specific commands, **Then** they see correct package names without @company prefix
3. **Given** a developer reading Module Federation examples, **When** they view the configuration code, **Then** they see correct package names without @company prefix

---

### User Story 2 - Update Publishing Guide (Priority: P2)

Maintainers publishing the SDK packages need accurate instructions that reflect the actual package naming scheme.

**Why this priority**: Publishing documentation must be accurate to prevent errors during the release process, though it's lower priority than user-facing installation docs.

**Independent Test**: Can be fully tested by reading PUBLISHING.md and verifying all npm publish commands, version bump commands, and package URLs reference correct names

**Acceptance Scenarios**:

1. **Given** a maintainer preparing to publish, **When** they read the publishing guide, **Then** they see commands using actual package names
2. **Given** a maintainer checking published packages, **When** they view the verification URLs, **Then** they see links to correct NPM package pages

---

### User Story 3 - Update Root Package Configuration (Priority: P3)

The monorepo root configuration should reflect accurate package names for consistency across the project.

**Why this priority**: Internal consistency is important but doesn't directly impact end users; the actual package.json files already use correct names.

**Independent Test**: Can be fully tested by reviewing root package.json and verifying the monorepo name and script references use correct package names

**Acceptance Scenarios**:

1. **Given** a developer running workspace commands, **When** they execute npm scripts, **Then** scripts reference correct package names
2. **Given** the monorepo configuration, **When** reviewed for consistency, **Then** the root package name reflects the actual naming scheme

---

### Edge Cases

- What happens when external documentation or blog posts still reference the old @company scope? (Out of scope - external content is not under our control)
- How do we handle backwards compatibility if packages were previously published with @company scope? (Not applicable - packages not yet published with @company)
- What if there are hardcoded references in source code files? (Confirmed out of scope - only documentation, config, examples, and spec files need updates)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All documentation files (README.md, PUBLISHING.md) MUST reference package names without the @company scope prefix
- **FR-002**: All npm command examples MUST use correct package names (e.g., `analytics-sdk-core`, `analytics-sdk-angular`)
- **FR-003**: All Module Federation configuration examples MUST reference correct package names
- **FR-004**: Root package.json MUST use unscoped package name "analytics-sdk-monorepo" and workspace scripts MUST reference correct package names
- **FR-009**: Example applications (examples/mfe-host, examples/mfe-remote-1, examples/mfe-remote-2) MUST use correct package names in imports, package.json dependencies, and configuration files
- **FR-005**: Publishing guide MUST contain accurate npm publish commands with correct package names
- **FR-010**: Publishing guide MUST remove all references to @company scope access and explain that packages are published publicly without scope prefix
- **FR-011**: Specification documents (in specs/001-analytics-cdn-integration/) MUST be updated to use current package names for consistency across all project documentation
- **FR-006**: NPM package URLs in documentation MUST point to correct package locations
- **FR-007**: Version management commands MUST reference correct package names
- **FR-008**: All installation instructions MUST reflect actual published package names

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero occurrences of "@company/" prefix in documentation files (README.md, PUBLISHING.md), root package.json, example applications, and specification documents
- **SC-002**: All npm install examples in documentation use correct package names and can be copy-pasted without modification
- **SC-003**: All workspace commands execute successfully with updated package references
- **SC-004**: Documentation review confirms no confusion between actual package names and documented names

## Clarifications

### Session 2026-06-05

- Q: Should the root monorepo package name be updated? → A: Remove @company scope → "analytics-sdk-monorepo" (consistent with published packages)
- Q: Should example applications (in examples/mfe-host, examples/mfe-remote-1, examples/mfe-remote-2) be updated to remove @company references? → A: Yes - Update all example code to use correct package names (ensures examples are immediately usable)
- Q: What should the publishing documentation say about package scopes for future maintainers? → A: Remove scope references - Packages are unscoped and publish publicly
- Q: Should the search for @company references be limited to specific files or should all project files be checked? → A: Check documentation and config only - README.md, PUBLISHING.md, package.json files, examples
- Q: Should specification documents (in specs/001-analytics-cdn-integration/) be updated to remove @company references? → A: Yes - Update for consistency so all project documentation uses current package names

## Assumptions

- Individual package.json files (packages/analytics-sdk-core/package.json, packages/analytics-sdk-angular/package.json) already have correct names without @company prefix
- Packages have not yet been published to NPM with the @company scope, so no package migration is needed
- The @company scope was a placeholder that needs to be removed, not a legitimate organizational scope
- External dependencies and imports in source code do not reference @company (only documentation and build scripts need updates)
- The correct package naming scheme is unscoped package names: `analytics-sdk-core` and `analytics-sdk-angular`
