# Publishing Checklist

## Pre-Publish Validation

### Automated Checks
Run the comprehensive validation script:
```bash
npm run prepublish:check
```

This script automatically validates:
- ✅ **Package.json integrity** - Required fields, file paths, metadata
- ✅ **Essential files** - README, LICENSE, build output, environment example
- ✅ **Build process** - Clean build, TypeScript compilation
- ✅ **Test suite** - All tests pass
- ✅ **Code quality** - Linting, type checking, formatting
- ✅ **Security audit** - No critical vulnerabilities
- ✅ **Dependencies** - Check for outdated packages
- ✅ **Package size** - Reasonable bundle size
- ✅ **Git status** - Clean working directory, proper branch

### Manual Review Checklist

#### 📋 Documentation
- [ ] README.md is comprehensive and up-to-date
- [ ] API documentation is current
- [ ] CHANGELOG.md updated with latest changes
- [ ] Environment configuration documented in .env.example
- [ ] Installation and usage examples are accurate

#### 🔧 Code Quality
- [ ] All TypeScript errors resolved
- [ ] No lint warnings in critical code
- [ ] Code formatted consistently
- [ ] No TODO/FIXME comments in production code
- [ ] All tests pass locally and in CI

#### 📦 Package Configuration
- [ ] Version number is appropriate (semver)
- [ ] Package name is available on npm
- [ ] Keywords are relevant and discoverable
- [ ] License is correctly specified
- [ ] Author information is complete
- [ ] Repository URLs are correct

#### 🚀 Publishing Process

**Understanding Automated Publishing:**
"Automated publishing on version tags" means that when you create a git tag with a version number (like `v1.0.0`), GitHub automatically:
1. **Builds** your package across multiple Node.js versions
2. **Tests** it thoroughly (all 86 tests must pass)  
3. **Publishes** it to npm
4. **Creates** a GitHub release with changelog

**Prerequisites for Automated Publishing:**
- [ ] `NPM_TOKEN` secret configured in GitHub repository settings
- [ ] All tests passing locally
- [ ] Clean git working directory

##### 1. Pre-flight Check
```bash
# Run comprehensive validation
npm run prepublish:check

# Check what will be published
npm pack --dry-run

# Test package installation
npm run package:test
```

##### 2. Version Management (Automated Publishing)
```bash
# For patch releases (bug fixes) - 1.0.0 → 1.0.1
npm run release:patch

# For minor releases (new features) - 1.0.0 → 1.1.0
npm run release:minor

# For major releases (breaking changes) - 1.0.0 → 2.0.0
npm run release:major
```

**What these commands do:**
1. Run all pre-publish checks
2. Update package.json version
3. Create git tag (e.g., v1.0.1)
4. Push tag to GitHub
5. **Trigger automated GitHub Actions publishing**

**Alternative - Manual tag creation:**
```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions will automatically publish
```

##### 3. Safe Publishing Options
```bash
# Dry run - shows what would be published
npm run publish:dry

# Beta release for testing
npm run publish:beta

# Normal release
npm run publish:safe
```

## Post-Publish Verification

### Immediate Checks
```bash
# Verify package is available
npm view ct.gov-mcp-server

# Test installation from npm
npm install -g ct.gov-mcp-server
mcp-server --help
mcp-server --version
```

### Integration Testing
- [ ] Test with actual MCP clients (Claude, etc.)
- [ ] Verify all transport modes work
- [ ] Check environment variable handling
- [ ] Validate tool registration and execution

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript configuration
npm run type-check
```

#### Test Failures
```bash
# Run specific test suites
npm run test:unit
npm run test:integration

# Run with verbose output
npm test -- --verbose
```

#### Security Issues
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual review for unfixable issues
npm audit --audit-level moderate
```

#### Large Package Size
```bash
# Check what's included
npm pack --dry-run

# Review .npmignore and package.json "files"
cat .npmignore
```

### Recovery Procedures

#### Unpublish (within 24 hours)
```bash
# Only for critical issues, avoid if possible
npm unpublish ct.gov-mcp-server@version --force
```

#### Patch Release for Critical Fixes
```bash
# Quick patch for critical issues
npm run release:patch
```

## Best Practices

### Semantic Versioning
- **PATCH** (1.0.1): Bug fixes, no API changes
- **MINOR** (1.1.0): New features, backward compatible
- **MAJOR** (2.0.0): Breaking changes

### Release Strategy
1. **Development**: Work on feature branches
2. **Testing**: Merge to main, run full test suite
3. **Beta**: Use `npm run publish:beta` for testing
4. **Release**: Use `npm run release:*` for stable releases

### Security Considerations
- Regular dependency updates
- Security audit before each release
- Environment variable validation
- Input sanitization in tools

### Documentation Maintenance
- Update README for new features
- Maintain CHANGELOG.md
- Keep .env.example current
- Update API documentation

## Automation Opportunities

### GitHub Actions (Recommended)
```yaml
# .github/workflows/publish.yml
name: Publish to NPM
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run prepublish:check
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Conventional Commits
Use structured commit messages for automated changelog generation:
```
feat(tools): add new math operations
fix(config): handle undefined environment variables
docs(readme): update installation instructions
```

---

**Remember**: Publishing is permanent. Always run `npm run prepublish:check` and review changes carefully before publishing. 