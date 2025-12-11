# Deployment Testing Guide

## 🚀 Setup Staging Environment

### 1. Create GitHub Environment
Navigate to: **Settings** → **Environments** → **New environment**

```yaml
Environment name: staging
Deployment branches: Selected branches
  - main
Protection rules:
  - No required reviewers (for automated deployment)
  - Wait timer: 0 minutes
Environment variables:
  - NODE_ENV: staging
  - API_URL: https://staging-api.example.com
```

### 2. Create Production Environment  
```yaml
Environment name: production
Deployment branches: Selected branches
  - main (for manual deployments)
  - Tags matching pattern: v*
Protection rules:
  - Required reviewers: 1-2 team members
  - Wait timer: 5 minutes
Environment variables:
  - NODE_ENV: production
  - API_URL: https://production-api.example.com
```

## 🧪 Test Staging Deployment

### Manual Test (Recommended First)
```bash
# 1. Go to Actions tab
# 2. Select "Deployment Pipeline" workflow
# 3. Click "Run workflow"
# 4. Select:
#    - Branch: main
#    - Environment: staging
# 5. Click "Run workflow"
```

### Automatic Test
```bash
# Push to main branch triggers staging deployment
git checkout main
git add .
git commit -m "test: trigger staging deployment"
git push origin main
```

## 📋 Deployment Verification Checklist

### ✅ Pre-Deployment Checks
- [ ] Build completes successfully
- [ ] All tests pass
- [ ] Security scan passes
- [ ] Performance benchmarks within threshold

### ✅ Deployment Process
- [ ] Environment variables loaded correctly
- [ ] Health checks pass
- [ ] No deployment errors in logs
- [ ] Service responds to basic requests

### ✅ Post-Deployment Validation
- [ ] Application starts without errors
- [ ] All endpoints respond correctly
- [ ] Performance metrics within expected ranges
- [ ] No memory leaks detected

## 🔧 Quick Deployment Tests

### Test Staging Deployment
```bash
# Test the deployment process
npm run docker:build
npm run docker:run
npm run health:check
npm run docker:stop
```

### Validate Environment Configuration
```bash
# Check environment variables are set
echo $NODE_ENV
echo $API_URL

# Test application in staging mode
NODE_ENV=staging npm start
```

### Smoke Test the Application
```bash
# Basic functionality test
node -e "
import('./dist/index.js').then(() => {
  console.log('✅ Application loads successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Application failed to load:', err);
  process.exit(1);
});
"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Environment Not Found
```bash
# Solution: Create the environment in GitHub Settings
# Settings → Environments → New environment → "staging"
```

#### 2. Deployment Timeout
```bash
# Check workflow logs for:
# - Long-running health checks
# - Network connectivity issues
# - Resource constraints
```

#### 3. Health Check Failures
```bash
# Verify:
# - Application starts correctly
# - Required ports are available
# - Dependencies are installed
```

### Debug Commands
```bash
# Check deployment logs
gh run list --workflow="Deployment Pipeline"
gh run view <run-id> --log

# Check Docker container logs
docker logs mcp-server

# Test local deployment
npm run ci:quick
npm run docker:build
docker run --name test-deploy ct.gov-mcp-server
docker exec test-deploy npm run health:check
```

## 🎯 Production Deployment Test

### Prerequisites
- [ ] Staging deployment successful
- [ ] All quality gates passed
- [ ] Manual testing completed
- [ ] Performance validated

### Create Release for Production
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# This triggers production deployment workflow
```

### Production Validation
```bash
# Monitor production deployment
# Check logs, metrics, and health status
# Verify rollback capability if needed
```

## 📊 Monitoring Setup

### Add Monitoring Commands
```bash
# Add to package.json scripts
"monitor:staging": "curl -f https://staging.example.com/health",
"monitor:production": "curl -f https://production.example.com/health",
"logs:staging": "heroku logs --tail --app staging-mcp-server",
"logs:production": "heroku logs --tail --app production-mcp-server"
```

### Health Check Endpoints
```javascript
// Add to your application
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    timestamp: new Date().toISOString()
  });
});
```

### **4. Deployment Testing**
```bash
# Test the built package
npm run package:test

# Verify health check
npm run health:check

# Test production build
npm run build
npm start &
sleep 2
curl http://localhost:3000/health || echo "Health check endpoint not available"
pkill -f "node.*dist/index.js"
```

### **5. Load Testing**
```bash
# Install load testing tool
npm install -g loadtest

# Run basic load test
loadtest -n 100 -c 10 http://localhost:3000/health

# Extended load test
loadtest -n 1000 -c 50 -t 60 http://localhost:3000/health
``` 