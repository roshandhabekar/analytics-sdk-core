# GitHub Actions Workflows

This directory contains automated workflows for the analytics-sdk monorepo.

## Workflows

### 📦 Publish (`publish.yml`)
Automatically publishes packages to npm when a release is created or manually triggered.

**Triggers:**
- GitHub Release is published
- Manual workflow dispatch

**What it does:**
1. Builds all packages
2. Runs tests
3. Publishes `analytics-sdk-core` to npm
4. Publishes `analytics-sdk-angular` to npm

### ✅ CI (`ci.yml`)
Continuous integration checks for all pull requests and pushes to main.

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
1. Runs on Node.js 18 and 20
2. Checks code formatting
3. Runs linter
4. Type checks TypeScript
5. Builds packages
6. Runs tests
7. Uploads coverage reports

## Setup Instructions

### 1. Configure npm Token

To publish packages, you need to add your npm token as a repository secret:

1. Create an npm access token:
   - Go to [npmjs.com](https://www.npmjs.com/)
   - Click your profile → **Access Tokens**
   - Click **Generate New Token** → **Classic Token**
   - Select type: **Automation**
   - Copy the token

2. Add to GitHub repository:
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click **Add secret**

### 2. Publishing a Release

#### Method 1: Create a GitHub Release (Recommended)
```bash
# 1. Update version in package.json files
cd packages/analytics-sdk-core
npm version patch  # or minor, major

cd ../analytics-sdk-angular
npm version patch  # or minor, major

# 2. Commit and push
git add .
git commit -m "chore: bump version to x.x.x"
git push

# 3. Create a git tag
git tag v1.0.4
git push origin v1.0.4

# 4. Create a GitHub Release from the tag
# Go to GitHub → Releases → Create new release → Select the tag
```

The workflow will automatically publish when the release is created.

#### Method 2: Manual Workflow Dispatch
1. Go to **Actions** → **Publish to npm**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. Click **Run workflow**

### 3. Optional: Codecov Setup

To enable code coverage reports:

1. Go to [codecov.io](https://codecov.io/)
2. Sign in with GitHub
3. Add your repository
4. Copy the token
5. Add to GitHub Secrets as `CODECOV_TOKEN`

## Version Management

### Versioning Strategy
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

### Bump Versions
```bash
# From repository root
npm version patch --workspaces  # Bumps all packages
npm version minor --workspaces
npm version major --workspaces

# Or individually
npm version patch -w analytics-sdk-core
npm version patch -w analytics-sdk-angular
```

## Testing Locally

Before creating a release, test the publish process:

```bash
# Build and test
npm run build
npm run test

# Dry run publish (doesn't actually publish)
npm publish --dry-run -w analytics-sdk-core
npm publish --dry-run -w analytics-sdk-angular
```

## Troubleshooting

### Publish fails with "You must be logged in"
- Make sure `NPM_TOKEN` secret is set correctly
- Verify the token hasn't expired
- Check token has "Automation" permissions

### Package already published
- Update version numbers in package.json
- npm doesn't allow republishing the same version

### Tests failing in CI
- Run tests locally: `npm test`
- Check Node.js version compatibility
- Review test output in GitHub Actions logs

## Manual Publishing (Fallback)

If workflows fail, you can publish manually:

```bash
# Login to npm
npm login

# Publish packages
npm run publish:all
```
