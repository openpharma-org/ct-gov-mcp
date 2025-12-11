# Quick Release Reference

## 🚀 **Automated Publishing Setup**

**"Automated publishing on version tags"** = When you create a git tag (like `v1.0.0`), GitHub automatically builds, tests, and publishes to npm.

## ⚡ **Quick Commands**

```bash
# Create automated releases
npm run release:patch    # 1.0.0 → 1.0.1 (bug fixes)
npm run release:minor    # 1.0.0 → 1.1.0 (new features)
npm run release:major    # 1.0.0 → 2.0.0 (breaking changes)

# Pre-release validation
npm run prepublish:check # Full validation
npm run publish:dry      # See what would be published
```

## 🔧 **One-Time Setup**

1. **Create NPM token:**
   ```bash
   npm login
   npm token create --type=automation
   ```

2. **Add to GitHub:**
   - Repo → Settings → Secrets → Actions
   - Add secret: `NPM_TOKEN` = your token

3. **Done!** Now `npm run release:*` triggers automated publishing

## 📋 **Release Checklist**

**Before releasing:**
- [ ] All tests pass: `npm test`
- [ ] Code is committed and pushed
- [ ] Documentation updated
- [ ] Version type chosen (patch/minor/major)

**Release:**
- [ ] Run: `npm run release:patch` (or minor/major)
- [ ] Monitor: GitHub Actions → Release workflow
- [ ] Verify: `npm view ct.gov-mcp-server`

## 🆘 **Quick Troubleshooting**

| Problem | Solution |
|---------|----------|
| "NPM_TOKEN not found" | Add NPM_TOKEN secret to GitHub repo |
| "Package name exists" | Change name in package.json |
| "Tests failing" | Run `npm test` locally first |
| "Git not clean" | Commit changes or `git stash` |

## 📖 **Full Documentation**

- [Automated Releases Guide](./AUTOMATED-RELEASES.md) - Complete guide
- [Publishing Checklist](./PUBLISHING-CHECKLIST.md) - Detailed checklist
- [Environment Configuration](./ENVIRONMENT-CONFIGURATION.md) - Config guide 