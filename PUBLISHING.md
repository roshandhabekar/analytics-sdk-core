# Publishing Guide

This guide explains how to publish the Analytics SDK packages to npm.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm Login**: Log in via CLI:
   ```bash
   npm login
   ```
3. **Access Rights**: Ensure you have publish access for public unscoped packages
4. **2FA**: If your npm account has 2FA enabled, have your authenticator ready

## Before Publishing

### 1. Update Package Scope (if needed)

The packages are currently scoped to `@company`. You should either:

**Option A**: Change to your organization scope

```bash
# Update package names in:
# - packages/analytics-sdk-core/package.json
# - packages/analytics-sdk-angular/package.json
# From: "analytics-sdk-core"
# To:   "@your-org/analytics-sdk-core"
```

**Option B**: Keep unscoped (public packages)

```bash
# Current names: "analytics-sdk-core", "analytics-sdk-angular"
# These are unscoped public packages
# Note: Unscoped names must be globally unique
```

### 2. Update Repository URLs

Update the repository URLs in both package.json files:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR-USERNAME/analytics-sdk.git",
  "directory": "packages/analytics-sdk-core"
}
```

### 3. Verify Package Contents

Check what will be published:

```bash
# For core package
cd packages/analytics-sdk-core
npm pack --dry-run

# For Angular package
cd packages/analytics-sdk-angular
npm pack --dry-run
```

## Publishing Steps

### Option 1: Publish All Packages (Recommended)

From the root directory:

```bash
# Build, test, and publish both packages
npm run publish:all
```

This will:

1. Build all packages
2. Run all tests
3. Publish core package
4. Publish Angular package

### Option 2: Publish Individual Packages

**Publish Core SDK:**

```bash
npm run publish:core
```

**Publish Angular Wrapper:**

```bash
npm run publish:angular
```

### Option 3: Manual Publishing

**Core Package:**

```bash
cd packages/analytics-sdk-core
npm run build
npm test
npm publish
```

**Angular Package:**

```bash
cd packages/analytics-sdk-angular
npm run build
npm test
npm publish
```

## Version Management

### Updating Versions

Before publishing a new version:

```bash
# Patch version (1.0.0 -> 1.0.1) for bug fixes
npm version patch -w analytics-sdk-core
npm version patch -w analytics-sdk-angular

# Minor version (1.0.0 -> 1.1.0) for new features
npm version minor -w analytics-sdk-core
npm version minor -w analytics-sdk-angular

# Major version (1.0.0 -> 2.0.0) for breaking changes
npm version major -w analytics-sdk-core
npm version major -w analytics-sdk-angular
```

Or update manually in package.json files.

### Semantic Versioning

Follow [semver](https://semver.org/):

- **Patch** (1.0.x): Bug fixes, no breaking changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## Post-Publishing

### 1. Verify Publication

Check on npm:

- https://www.npmjs.com/package/analytics-sdk-core
- https://www.npmjs.com/package/analytics-sdk-angular

### 2. Test Installation

In a test project:

```bash
npm install analytics-sdk-core
npm install analytics-sdk-angular
```

### 3. Tag Git Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 4. Create GitHub Release

Go to your repository on GitHub and create a release from the tag with:

- Release notes
- Breaking changes (if any)
- New features
- Bug fixes

## Troubleshooting

### "You do not have permission to publish"

- Verify you're logged in: `npm whoami`
- Check package scope access
- For scoped packages, ensure `publishConfig.access` is set to `"public"`

### "Package name already exists"

- Choose a different package name
- Add a unique scope: `@yourname/package-name`

### "Invalid package.json"

- Validate JSON syntax
- Ensure required fields are present: name, version, main, types

### Build Fails Before Publish

The `prepublishOnly` script runs build and tests automatically. Fix any:

- TypeScript compilation errors
- Test failures
- Lint errors

## Publishing Checklist

- [ ] Update version numbers in package.json
- [ ] Update CHANGELOG (if you have one)
- [ ] Run `npm run build` successfully
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no errors
- [ ] Update repository URLs
- [ ] Verify package contents with `npm pack --dry-run`
- [ ] Logged into npm: `npm whoami`
- [ ] Publish packages
- [ ] Verify on npmjs.com
- [ ] Test installation in a fresh project
- [ ] Tag git release
- [ ] Create GitHub release
- [ ] Update documentation

## Beta/Pre-release Versions

To publish a beta or pre-release:

```bash
# Update version to beta
npm version 1.1.0-beta.0 -w analytics-sdk-core

# Publish with beta tag
npm publish --tag beta -w analytics-sdk-core

# Users install with:
npm install analytics-sdk-core@beta
```

## Unpublishing (Emergency Only)

⚠️ **Warning**: Only unpublish within 72 hours of publishing, and only if absolutely necessary.

```bash
npm unpublish analytics-sdk-core@1.0.0
```

For versions older than 72 hours, use deprecation instead:

```bash
npm deprecate analytics-sdk-core@1.0.0 "This version has critical bugs, please upgrade"
```
