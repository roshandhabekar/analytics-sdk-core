# Feature Specification: Rename SDK Package to analytics-sdk-core

**Feature Branch**: `003-rename-sdk-package`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "I want sdk to be name as analytics-sdk-core instead @company/analytics-sdk-core"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Package Name in package.json Files (Priority: P1)

Developers installing the SDK need to use the correct unscoped package name `analytics-sdk-core` and `analytics-sdk-angular` instead of the scoped versions `@company/analytics-sdk-core` and `@company/analytics-sdk-angular` in both the actual package.json files and all installation instructions.

**Why this priority**: This is the fundamental change - the actual npm package name must be updated in the package.json files to enable publishing and consumption under the new unscoped name.

**Independent Test**: Can be fully tested by running `npm install` in the workspace, verifying the packages resolve correctly, and checking that package.json files in packages/ directories contain the correct unscoped names.

**Acceptance Scenarios**:

1. **Given** a developer views package.json in packages/analytics-sdk-core/, **When** they check the "name" field, **Then** they see "analytics-sdk-core" instead of "@company/analytics-sdk-core"
2. **Given** a developer views package.json in packages/analytics-sdk-angular/, **When** they check the "name" field, **Then** they see "analytics-sdk-angular" instead of "@company/analytics-sdk-angular"
3. **Given** a developer runs `npm install` in the monorepo, **When** workspace resolution occurs, **Then** all packages resolve correctly with the new unscoped names
4. **Given** the root package.json, **When** workspace scripts reference packages, **Then** they use the correct unscoped package names

---

### User Story 2 - Update Import Statements in Source Code (Priority: P1)

Developers writing code that imports the SDK need to use the correct unscoped package names in their import statements.

**Why this priority**: All TypeScript/JavaScript import statements must match the actual package name for the code to compile and run correctly.

**Independent Test**: Can be fully tested by running `npm run build` and verifying all packages compile successfully without module resolution errors.

**Acceptance Scenarios**:

1. **Given** source code files in packages/analytics-sdk-core/src/, **When** they import from the package, **Then** import statements use "analytics-sdk-core"
2. **Given** source code files in packages/analytics-sdk-angular/src/, **When** they import from core, **Then** import statements use "analytics-sdk-core" instead of "@company/analytics-sdk-core"
3. **Given** example applications in examples/, **When** they import the SDK, **Then** import statements use the unscoped package names
4. **Given** test files in tests/ directories, **When** they import the SDK, **Then** import statements use the unscoped package names

---

### User Story 3 - Update Build Configuration Files (Priority: P2)

Build tooling (TypeScript configs, Rollup configs, Webpack configs) must reference the correct package names for proper module resolution and bundling.

**Why this priority**: Build configuration must align with package names for successful compilation, but this is secondary to the actual package and source code updates.

**Independent Test**: Can be fully tested by running build scripts (`npm run build`) and verifying all outputs are generated without errors.

**Acceptance Scenarios**:

1. **Given** tsconfig.json files reference package paths, **When** they define path mappings, **Then** they use unscoped package names
2. **Given** Rollup configuration files, **When** they define external dependencies, **Then** they use unscoped package names
3. **Given** Webpack/Module Federation configs in examples/, **When** they define shared dependencies, **Then** they use unscoped package names like "analytics-sdk-core"
4. **Given** ng-package.json for Angular library, **When** it specifies the package name, **Then** it uses "analytics-sdk-angular"

---

### User Story 4 - Update Documentation and Examples (Priority: P3)

Documentation files and code examples must show the correct package names to guide users properly.

**Why this priority**: User-facing documentation is important but doesn't affect the code's functionality - it can be updated after core changes work.

**Independent Test**: Can be fully tested by reading documentation files and verifying all references show unscoped package names.

**Acceptance Scenarios**:

1. **Given** README.md files, **When** they show installation commands, **Then** they use `npm install analytics-sdk-core` instead of `npm install @company/analytics-sdk-core`
2. **Given** code examples in documentation, **When** they show import statements, **Then** they use unscoped package names
3. **Given** PUBLISHING.md, **When** it describes the publish process, **Then** it references correct unscoped package names
4. **Given** specification documents in specs/, **When** they reference the SDK, **Then** they use current unscoped package names

---

### Edge Cases

- What happens if external projects already depend on @company/analytics-sdk-core? (Breaking change - requires major version bump and migration guide)
- How do we handle npm registry conflicts if analytics-sdk-core is already taken? (Verify package name availability on npm before proceeding)
- What if Module Federation configs in production apps still reference the old name? (Breaking change - requires coordinated update of all consuming apps)
- How do we handle git history and existing branches referencing old package names? (Git history preserved - only future references updated)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package name in packages/analytics-sdk-core/package.json MUST be changed from "@company/analytics-sdk-core" to "analytics-sdk-core"
- **FR-002**: Package name in packages/analytics-sdk-angular/package.json MUST be changed from "@company/analytics-sdk-angular" to "analytics-sdk-angular"
- **FR-003**: All TypeScript import statements across the codebase MUST be updated to use unscoped package names
- **FR-004**: All package.json dependency declarations MUST reference unscoped package names
- **FR-005**: Root package.json workspace scripts MUST reference unscoped package names
- **FR-006**: All build configuration files (tsconfig.json, rollup.config.js, webpack configs) MUST reference unscoped package names
- **FR-007**: Module Federation shared dependency configurations MUST use unscoped package names
- **FR-008**: All README.md files MUST show installation instructions using unscoped package names
- **FR-009**: PUBLISHING.md MUST contain publish commands using unscoped package names
- **FR-010**: All specification documents MUST reference current unscoped package names for consistency
- **FR-011**: Example applications MUST import and configure the SDK using unscoped package names
- **FR-012**: Test files MUST import the SDK using unscoped package names
- **FR-013**: NPM registry availability for "analytics-sdk-core" and "analytics-sdk-angular" MUST be verified before publishing

### Key Entities

- **Package Name**: The npm package identifier changed from scoped (@company/analytics-sdk-core) to unscoped (analytics-sdk-core) format
- **Import Statement**: TypeScript/JavaScript import declarations that reference the package name
- **Dependency Declaration**: References to the package in package.json dependencies/devDependencies fields
- **Module Federation Configuration**: Webpack shared dependency configuration that must use the new package name for singleton behavior

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All packages build successfully with `npm run build` using the new unscoped package names
- **SC-002**: All tests pass with `npm test` without any module resolution errors
- **SC-003**: Example applications start and run correctly using the new package names
- **SC-004**: Grep search for "@company/analytics-sdk" returns zero results across all source code, build configs, and package.json files (excluding git history and this spec)
- **SC-005**: Documentation correctly instructs users to install "analytics-sdk-core" in all examples
- **SC-006**: Packages can be published to npm registry under the new unscoped names without conflicts

## Assumptions

- The package names "analytics-sdk-core" and "analytics-sdk-angular" are available on the npm registry (will be verified before publishing)
- This is a breaking change requiring a major version bump
- Existing consumers of @company/analytics-sdk-core do not exist yet, or a migration guide will be provided
- All consuming applications will need to update their imports and Module Federation configurations
- The @company npm scope is being deprecated or is no longer preferred for this project
- Source code modifications are in scope (not just documentation as in spec 002)
