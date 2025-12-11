# Development Workflow Guide

Complete workflow from making code changes to automated deployment using the MCP server template.

## 🔄 **Complete Development Workflow**

### **Example Scenario: Adding a New Weather Tool**

This guide walks through adding a weather tool to demonstrate the full development-to-deployment process.

---

## **Phase 1: Development** 🛠️

### 1. Create the New Tool

**Create `src/tools/weather-tool.ts`:**
```typescript
import { ToolDefinition, ToolHandler } from '../types.js';

export const definition: ToolDefinition = {
  name: "get_weather",
  description: "Get current weather conditions for a location",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City name or coordinates" },
      units: { type: "string", enum: ["celsius", "fahrenheit"], default: "celsius" }
    },
    required: ["location"]
  },
  responseSchema: {
    type: "object",
    properties: {
      temperature: { type: "number" },
      condition: { type: "string" },
      humidity: { type: "number" },
      location: { type: "string" }
    }
  },
  examples: [
    {
      description: "Get weather for New York",
      usage: { "location": "New York", "units": "celsius" },
      response: { "temperature": 22, "condition": "Sunny", "humidity": 65, "location": "New York" }
    }
  ]
};

export const handler: ToolHandler = async (args: any) => {
  // Implementation with API calls, error handling, etc.
  const { location, units = 'celsius' } = args;
  
  // Mock implementation - replace with real weather API
  return {
    temperature: 22,
    condition: "Sunny",
    humidity: 65,
    location: location
  };
};
```

### 2. Register the Tool

**Update `src/tools/index.ts`:**
```typescript
import * as weatherTool from './weather-tool.js';

export const toolRegistry: ToolRegistry = {
  // ... existing tools
  [weatherTool.definition.name]: {
    definition: weatherTool.definition,
    handler: weatherTool.handler
  }
};
```

### 3. Local Development Testing

```bash
npm run dev          # Start in watch mode
# Test your tool manually with the server
# Use HTTP mode for easier testing: USE_HTTP=true npm run dev
```

---

## **Phase 2: Testing & Validation** ✅

### 4. Write Comprehensive Tests

**Create `tests/unit/weather-tool.test.ts`:**
```typescript
import { handler, definition } from '../../src/tools/weather-tool';

describe('Weather Tool', () => {
  describe('definition', () => {
    it('should have correct name and description', () => {
      expect(definition.name).toBe('get_weather');
      expect(definition.description).toContain('weather');
    });
  });

  describe('handler', () => {
    it('should return weather data for valid location', async () => {
      const result = await handler({ location: 'New York' });
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('condition');
      expect(result).toHaveProperty('humidity');
      expect(result).toHaveProperty('location');
    });

    it('should handle different units', async () => {
      const result = await handler({ location: 'London', units: 'fahrenheit' });
      expect(result).toBeDefined();
    });

    it('should handle missing location gracefully', async () => {
      await expect(handler({})).rejects.toThrow();
    });
  });
});
```

### 5. Run the Full Test Suite

```bash
npm test             # Run all tests
npm run test:coverage # Ensure coverage stays above 95%
```

**Expected output:**
- All existing tests still pass
- New weather tool tests pass
- Coverage remains above 95%

### 6. Integration Testing

```bash
npm run build        # Build TypeScript
node dist/index.js   # Test the built version

# Test with HTTP mode
USE_HTTP=true node dist/index.js
# Then test endpoints: POST http://localhost:3000/get_weather
```

### 7. Code Quality Checks

```bash
npm run lint         # Fix any linting issues
npm run type-check   # Ensure TypeScript is happy
npm run format       # Format code consistently
```

---

## **Phase 3: Pre-Release Validation** 🔍

### 8. Comprehensive Pre-Publish Check

```bash
npm run prepublish:check
```

**This automatically runs:**
- ✅ Clean build from scratch
- ✅ All 86 tests (including your new ones)
- ✅ Linting and type checking
- ✅ Security audit for vulnerabilities
- ✅ Package integrity check
- ✅ Git status validation

**Expected output:**
```
🔍 Starting pre-publish validation...
📦 Validating package.json... ✅
📄 Checking essential files... ✅
🔨 Validating build output... ✅
🧪 Running tests... ✅ All tests passed
🔍 Running linting... ✅ Linting passed
🛡️ Running security audit... ✅ Security audit passed
📋 Checking dependencies... ✅ Dependencies check complete
📏 Checking package size... ✅ Package size check complete
📝 Checking git status... ✅ Git status check complete

✅ Package is ready for publishing
```

### 9. Preview What Will Be Published

```bash
npm run publish:dry
```

**This shows you:**
- Exact files included in the npm package
- Package size and compression stats
- What the published package will contain

### 10. Update Documentation

**Update `README.md`:**
```markdown
## Example Tools Included

- **get_weather**: Get current weather conditions for any location
- **example_tool**: A simple example that processes text input
- **math_calculator**: A calculator that performs basic math operations
```

**Update usage examples, API documentation, etc.**

---

## **Phase 4: Version Management** 📊

### 11. Determine Version Bump

**Semantic Versioning Rules:**
- **Patch** (0.1.0 → 0.1.1): Bug fixes only
- **Minor** (0.1.0 → 0.2.0): **New weather tool = new feature** ← Choose this
- **Major** (0.1.0 → 1.0.0): Breaking changes to existing tools

### 12. Commit All Changes

```bash
git add .
git commit -m "feat(tools): add weather tool with current conditions and forecasts

- Add get_weather tool with location and units support
- Include comprehensive tests with 100% coverage
- Update documentation with weather tool examples
- Mock implementation ready for real API integration"

git push origin main
```

---

## **Phase 5: Automated Release** 🚀

### 13. Trigger Automated Release

```bash
npm run release:minor
```

**What happens immediately:**
1. ✅ Runs `prepublish:check` validation again
2. ✅ Updates `package.json`: `"version": "0.1.0"` → `"version": "0.2.0"`
3. ✅ Creates git tag: `v0.2.0`
4. ✅ Pushes commits and tag to GitHub: `git push && git push --tags`
5. ✅ **GitHub Actions triggers automatically**

**Command output:**
```bash
> ct.gov-mcp-server@0.1.0 release:minor
> npm run prepublish:check && npm version minor && git push && git push --tags

🔍 Starting pre-publish validation...
✅ Package is ready for publishing

> ct.gov-mcp-server@0.2.0 version minor
v0.2.0

> git push origin main
> git push origin v0.2.0
[Pushing to GitHub... GitHub Actions will now automatically publish to npm]
```

---

## **Phase 6: GitHub Actions (Automated)** ⚙️

### 14. GitHub Actions Workflow Runs

**Monitor at:** `https://github.com/your-username/your-repo/actions`

**Automated steps:**
1. **Checkout code** from the `v0.2.0` tag
2. **Setup Node.js** versions 18, 20, 22
3. **Install dependencies** with `npm ci`
4. **Run tests** on all Node.js versions
   - All 86 tests must pass (including weather tool)
   - Coverage must be above 95%
5. **Security audit** for vulnerabilities
6. **Build TypeScript** with `npm run build`
7. **Package creation** with npm pack
8. **NPM publish** to `ct.gov-mcp-server@0.2.0`
9. **GitHub Release** creation with auto-generated changelog

### 15. Monitor the Deployment

**GitHub Actions logs show:**
```
✅ Tests passed on Node.js 18.x
✅ Tests passed on Node.js 20.x  
✅ Tests passed on Node.js 22.x
✅ Security audit clean
✅ Build successful
✅ Published to npm: ct.gov-mcp-server@0.2.0
✅ GitHub release created
```

**Timeline:** Usually completes in 3-5 minutes

---

## **Phase 7: Post-Release Verification** ✅

### 16. Verify NPM Publication

```bash
npm view ct.gov-mcp-server@0.2.0
```

**Expected output:**
```json
{
  "name": "ct.gov-mcp-server",
  "version": "0.2.0",
  "description": "A modular template for creating MCP servers...",
  "keywords": ["mcp", "server", "weather", "tools"],
  "bin": {
    "ct.gov-mcp-server": "dist/index.js"
  }
}
```

### 17. Test Installation

```bash
# Test global installation
npm install -g ct.gov-mcp-server@0.2.0

# Test CLI
ct.gov-mcp-server --help
ct.gov-mcp-server --version  # Should show 0.2.0

# Test weather tool availability
USE_HTTP=true ct.gov-mcp-server &
curl -X POST http://localhost:3000/list_tools
# Should include "get_weather" in the response
```

### 18. Integration Testing

**Test with MCP clients:**
- **Claude Desktop**: Update mcp.json to use new version
- **Cursor**: Test with new weather tool functionality
- **Other MCP clients**: Verify compatibility

**Test weather tool:**
```bash
curl -X POST http://localhost:3000/get_weather \
  -H "Content-Type: application/json" \
  -d '{"location": "New York", "units": "celsius"}'
```

---

## **Phase 8: Communication & Monitoring** 📢

### 19. Update Users (if applicable)

**GitHub Release (auto-generated):**
- Changelog with new features
- Installation instructions
- Breaking changes (if any)

**Additional communication:**
- Update documentation sites
- Notify users in Discord/Slack
- Tweet about new weather capabilities

### 20. Monitor for Issues

**Watch for:**
- GitHub Issues from users
- NPM download statistics
- Error reports or compatibility issues
- Feature requests and feedback

**Monitoring commands:**
```bash
# Check download stats
npm view ct.gov-mcp-server

# Monitor GitHub issues
# Visit: https://github.com/your-username/your-repo/issues
```

---

## **🎯 Key Benefits of This Workflow**

### ✅ **Safety First**
- **86 tests** across multiple Node.js versions (18, 20, 22)
- **Security audits** prevent vulnerable dependencies
- **Code quality checks** maintain consistent standards
- **Pre-publish validation** catches issues before release

### ✅ **Speed & Efficiency**
- **One command** (`npm run release:minor`) handles everything
- **No manual steps** for npm publish, tagging, or release creation
- **Parallel testing** across Node.js versions
- **Automated documentation** updates

### ✅ **Reliability & Consistency**
- **Same process every time** - no human errors
- **Atomic releases** - either everything works or nothing is published
- **Rollback capability** if issues are discovered
- **Full audit trail** of every change

### ✅ **Developer Experience**
- **Clear feedback** at every step
- **Easy debugging** with detailed logs
- **Fast iteration** with watch mode during development
- **Comprehensive documentation** for every scenario

---

## **🚨 Error Handling & Recovery**

### Common Issues and Solutions

#### **Tests Fail During Automated Release**
```bash
# GitHub Actions stops the process automatically
# No broken package gets published
# Fix the issue locally and try again

npm test  # Debug locally
npm run release:minor  # Try again
```

#### **Need to Rollback a Release**
```bash
# Within 24 hours only
npm unpublish ct.gov-mcp-server@0.2.0 --force

# After 24 hours, release a patch
npm run release:patch  # 0.2.0 → 0.2.1 with fix
```

#### **Urgent Hotfixes**
```bash
# For critical bugs
git checkout main
# Fix the critical issue
git commit -m "fix: critical weather API timeout issue"
npm run release:patch  # Quick patch release
```

#### **GitHub Actions Fails**
- Check Actions tab for detailed logs
- Common issues: NPM_TOKEN expired, network timeouts
- Re-run failed jobs if it's a temporary issue
- Fix underlying issue and create new release

---

## **📋 Quick Workflow Checklist**

### **For Every New Feature:**

**Development:**
- [ ] Create new tool file in `src/tools/`
- [ ] Register tool in `src/tools/index.ts`
- [ ] Test locally with `npm run dev`

**Testing:**
- [ ] Write comprehensive unit tests
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run test:coverage` - coverage > 95%
- [ ] Integration test with `npm run build && node dist/index.js`

**Quality:**
- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm run type-check` - TypeScript happy
- [ ] Run `npm run prepublish:check` - full validation passes

**Release:**
- [ ] Update documentation (README, examples)
- [ ] Commit and push all changes
- [ ] Choose version type (patch/minor/major)
- [ ] Run `npm run release:minor` (or appropriate version)
- [ ] Monitor GitHub Actions workflow
- [ ] Verify npm publication with `npm view ct.gov-mcp-server`
- [ ] Test installation and functionality

**Post-Release:**
- [ ] Test with real MCP clients
- [ ] Monitor for issues and user feedback
- [ ] Plan next iteration based on feedback

---

## **🎊 Summary**

This workflow ensures that every release is:
- **Thoroughly tested** across multiple environments
- **Secure** with vulnerability scanning
- **Consistent** with automated processes
- **Reliable** with comprehensive validation
- **Fast** with parallel execution
- **Transparent** with full audit trails

The beauty of this system is that **phases 5-7 are completely automated** once you run the release command. You focus on writing great code, and the automation handles the complex deployment pipeline!

**Next Steps:**
1. Try this workflow with a simple change
2. Add your first new tool following this guide
3. Experience the power of automated releases
4. Customize the workflow for your specific needs 