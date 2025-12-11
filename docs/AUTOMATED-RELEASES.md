# Automated Releases Guide

## Overview

This project uses **automated publishing with version tags** to streamline releases. When you create a git tag with a version number (like `v1.0.0`), GitHub automatically builds, tests, and publishes your package to npm.

## How Automated Publishing Works

**"Automated publishing on version tags"** means:

1. **You create a version tag** (e.g., `v1.0.0`)
2. **GitHub Actions triggers** automatically
3. **Comprehensive validation runs** across multiple Node.js versions (18, 20, 22)
4. **All 86 tests must pass** with 95%+ coverage
5. **Security audit** ensures no vulnerabilities
6. **Package is published** to npm automatically
7. **GitHub Release** is created with changelog

## Prerequisites

### 1. Configure NPM_TOKEN Secret

**Create npm access token:**
```bash
npm login
npm token create --type=automation
```

**Add to GitHub repository:**
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `NPM_TOKEN`
4. Value: Your npm token from above

### 2. Verify Package Name

Ensure your package name is unique:
```bash
npm view your-package-name  # Should return 404
```

## Release Methods

### Method 1: Automated Release Commands (Recommended)

```bash
# Patch release (1.0.0 → 1.0.1) - Bug fixes
npm run release:patch

# Minor release (1.0.0 → 1.1.0) - New features  
npm run release:minor

# Major release (1.0.0 → 2.0.0) - Breaking changes
npm run release:major
```

**What these commands do:**
1. Run comprehensive pre-publish validation
2. Update package.json version
3. Create git tag (e.g., `v1.0.1`)
4. Push tag to GitHub
5. **Trigger automated GitHub Actions publishing**

### Method 2: Manual Tag Creation

```bash
# Create and push tag manually
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically publish
```

### Method 3: GitHub Web Interface

1. Go to your repo → **Releases** → **Create a new release**
2. Click **"Choose a tag"** → **"Create new tag"**
3. Enter tag: `v1.0.0`
4. Add release title and description
5. Click **"Publish release"**
6. GitHub Actions will automatically publish to npm

## Pre-Release Validation

Every automated release runs comprehensive validation:

### ✅ **What Gets Checked**
- **Build**: Clean TypeScript compilation
- **Tests**: All 86 tests pass across Node.js 18, 20, 22
- **Coverage**: 95%+ code coverage maintained
- **Linting**: Code quality standards enforced
- **Security**: No vulnerabilities in dependencies
- **Package**: Correct files included/excluded
- **Git**: Clean working directory

### **Manual Pre-Check**
```bash
# Run full validation locally first
npm run prepublish:check

# See what would be published
npm run publish:dry
```

## Monitoring Releases

### GitHub Actions Workflow

Monitor your release at:
- **Your repo** → **Actions** → **Release and Publish**

### NPM Package Status

Check publication:
```bash
# Verify package is available
npm view ct.gov-mcp-server

# Test installation
npm install -g ct.gov-mcp-server
ct.gov-mcp-server --help
```

## Version Strategy

### Semantic Versioning (SemVer)

- **PATCH** (1.0.1): Bug fixes, no API changes
- **MINOR** (1.1.0): New features, backward compatible  
- **MAJOR** (2.0.0): Breaking changes

### Release Cadence

**Recommended approach:**
1. **Development**: Work on feature branches
2. **Integration**: Merge to main, ensure all tests pass
3. **Beta testing**: Use `npm run publish:beta` for testing
4. **Stable release**: Use automated release commands

## Troubleshooting

### Common Issues

#### ❌ **"NPM_TOKEN not found"**
- **Solution**: Add NPM_TOKEN secret to GitHub repository settings

#### ❌ **"Package name already exists"**
- **Solution**: Change package name in `package.json`
- Check availability: `npm view your-new-name`

#### ❌ **"Tests failing in CI"**
- **Solution**: Run tests locally first: `npm test`
- Check Node.js version compatibility

#### ❌ **"Git working directory not clean"**
- **Solution**: Commit all changes before creating release
- Or use: `git stash` temporarily

### Recovery Procedures

#### **Unpublish (within 24 hours only)**
```bash
# Only for critical issues - avoid if possible
npm unpublish ct.gov-mcp-server@1.0.0 --force
```

#### **Quick Patch for Critical Issues**
```bash
# Fix the issue, then:
npm run release:patch
```

## Best Practices

### 🎯 **Before Each Release**
1. **Test thoroughly** - All features work as expected
2. **Update documentation** - README, CHANGELOG, etc.
3. **Review changes** - Ensure version bump is appropriate
4. **Clean git state** - Commit all changes

### 🚀 **Release Process**
1. **Choose appropriate version** - patch/minor/major
2. **Use automated commands** - `npm run release:*`
3. **Monitor GitHub Actions** - Ensure successful publication
4. **Verify npm package** - Test installation and functionality

### 📋 **Post-Release**
1. **Update dependents** - Notify users of new version
2. **Monitor for issues** - Watch for bug reports
3. **Plan next release** - Based on feedback and roadmap

## Manual Publishing (Fallback)

If automated publishing fails, you can publish manually:

```bash
# Full validation + manual publish
npm run publish:safe

# Or standard npm publish
npm run prepublish:check  # Validate first
npm publish
```

---

## Summary

✅ **Automated releases save time and reduce errors**  
✅ **Comprehensive validation ensures quality**  
✅ **Simple commands handle complex workflows**  
✅ **GitHub Actions provides reliable automation**  

**Next Steps:**
1. Set up `NPM_TOKEN` secret
2. Test with: `npm run publish:dry`
3. Create your first release: `npm run release:patch` 