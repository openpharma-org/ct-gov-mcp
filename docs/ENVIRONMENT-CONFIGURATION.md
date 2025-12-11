# Environment Configuration Guide

This guide covers best practices for configuring your MCP server using environment variables.

## 📁 **Environment Files**

### `.env.example`
- **Purpose**: Template and documentation for all available environment variables
- **Version Control**: ✅ **COMMIT** this file to version control
- **Contains**: All possible environment variables with default values and descriptions
- **Usage**: Copy to `.env` and customize for your environment

### `.env`
- **Purpose**: Your actual environment configuration with sensitive values
- **Version Control**: ❌ **NEVER COMMIT** this file to version control
- **Contains**: Your specific environment values, API keys, secrets
- **Usage**: Local development and production deployment

### `.env.local`, `.env.development`, `.env.production`
- **Purpose**: Environment-specific overrides
- **Version Control**: ❌ **NEVER COMMIT** these files
- **Usage**: Environment-specific configuration that overrides `.env`

## 🔧 **Configuration Categories**

### Core Server Settings
```bash
# Server identification
SERVER_NAME=ct.gov-mcp-server
SERVER_VERSION=0.1.0

# Transport protocols
USE_HTTP=false
USE_SSE=false
PORT=3000
SSE_PATH=/mcp
```

### Security Configuration
```bash
# CORS settings (production should restrict origins)
CORS_ORIGINS=https://myapp.com,https://api.myapp.com

# Request limits
REQUEST_TIMEOUT=30000
MAX_REQUEST_SIZE=1048576
```

### Performance Settings
```bash
# Monitoring and metrics
ENABLE_PERFORMANCE_MONITORING=true
METRICS_INTERVAL=60000
MAX_CONNECTIONS=100
```

### Feature Flags
```bash
# Enable/disable features without code changes
ENABLE_EXPERIMENTAL_FEATURES=false
ENABLE_MATH_TOOLS=true
ENABLE_EXAMPLE_TOOLS=true
```

## 🌍 **Environment-Specific Examples**

### Development Environment
```bash
NODE_ENV=development
LOG_LEVEL=debug
DEV_MODE=true
DEBUG=true
USE_HTTP=true
PORT=3000
CORS_ORIGINS=*
ENABLE_PERFORMANCE_MONITORING=false
```

### Staging Environment
```bash
NODE_ENV=staging
LOG_LEVEL=info
DEV_MODE=false
DEBUG=false
USE_HTTP=true
PORT=8080
CORS_ORIGINS=https://staging-app.com
ENABLE_PERFORMANCE_MONITORING=true
```

### Production Environment
```bash
NODE_ENV=production
LOG_LEVEL=warn
DEV_MODE=false
DEBUG=false
USE_HTTP=true
PORT=8080
CORS_ORIGINS=https://myapp.com,https://api.myapp.com
ENABLE_PERFORMANCE_MONITORING=true
REQUEST_TIMEOUT=15000
MAX_CONNECTIONS=200
```

### Development
```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
MCP_SERVER_NAME=mcp-server-dev
```

## 🛡️ **Security Best Practices**

### 1. **Never Commit Secrets**
```bash
# ❌ Don't do this
OPENAI_API_KEY=sk-actual-secret-key

# ✅ Do this in .env.example
OPENAI_API_KEY=sk-...
```

### 2. **Use Environment-Specific Files**
```bash
# .env.example (committed)
DATABASE_URL=postgresql://user:password@localhost:5432/database

# .env.production (not committed)
DATABASE_URL=postgresql://prod_user:real_password@prod-db:5432/prod_database
```

### 3. **Validate Sensitive Configuration**
```bash
# Validate required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY is required"
  exit 1
fi
```

### 4. **Restrict CORS in Production**
```bash
# Development
CORS_ORIGINS=*

# Production
CORS_ORIGINS=https://yourapp.com,https://api.yourapp.com
```

## 🚀 **Deployment Strategies**

### Docker
```dockerfile
# Copy environment template
COPY .env.example .env.example

# Environment variables can be passed at runtime
ENV NODE_ENV=production
ENV PORT=8080

# Or mount environment files
VOLUME ["/app/.env"]
```

### Kubernetes
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-server-config
data:
  NODE_ENV: "production"
  PORT: "8080"
  LOG_LEVEL: "info"
---
apiVersion: v1
kind: Secret
metadata:
  name: mcp-server-secrets
data:
  OPENAI_API_KEY: <base64-encoded-key>
```

### CI/CD Pipeline
```yaml
# GitHub Actions example
env:
  NODE_ENV: production
  PORT: 8080
  LOG_LEVEL: info
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 🔍 **Validation and Debugging**

### Configuration Validation
The server automatically validates configuration on startup:

```typescript
import { loadConfig, validateConfig } from './utils/config.js';

const config = loadConfig();
validateConfig(config); // Throws if invalid
```

### Common Issues

1. **Invalid Port Numbers**
   ```bash
   # ❌ Invalid
   PORT=abc
   PORT=-1
   PORT=70000
   
   # ✅ Valid
   PORT=3000
   PORT=8080
   ```

2. **Boolean Values**
   ```bash
   # ❌ Invalid (will be false)
   USE_HTTP=yes
   USE_HTTP=1
   
   # ✅ Valid
   USE_HTTP=true
   USE_HTTP=false
   ```

3. **CORS Configuration**
   ```bash
   # ❌ Unsafe for production
   CORS_ORIGINS=*
   
   # ✅ Safe for production
   CORS_ORIGINS=https://myapp.com,https://api.myapp.com
   ```

## 📋 **Environment Variable Checklist**

### Before Deployment
- [ ] `.env.example` is up to date with all variables
- [ ] `.env` file exists with proper values
- [ ] No secrets in `.env.example`
- [ ] CORS origins are restricted for production
- [ ] Port is available and not conflicting
- [ ] Log level is appropriate for environment
- [ ] Performance monitoring is configured
- [ ] Health check endpoint is accessible

### Security Review
- [ ] No API keys in version control
- [ ] Database URLs use strong passwords
- [ ] CORS origins are whitelisted
- [ ] Request timeouts are reasonable
- [ ] Max request size prevents DoS
- [ ] Debug mode is disabled in production

## 🔄 **Configuration Loading Order**

The application loads configuration in this order (later overrides earlier):

1. Default values in code
2. `.env` file
3. `.env.local` file (if exists)
4. `.env.${NODE_ENV}` file (if exists)
5. Environment variables set by the system

## 🛠️ **Troubleshooting**

### Configuration Not Loading
```bash
# Check if dotenv is installed
npm list dotenv

# Verify .env file exists and is readable
ls -la .env
cat .env

# Check for syntax errors
node -e "require('dotenv').config(); console.log(process.env.SERVER_NAME)"
```

### Invalid Values
```bash
# Check configuration loading
npm start
# Look for validation warnings in logs

# Test specific values
node -e "console.log(parseInt('abc', 10))" # NaN
node -e "console.log(parseInt('3000', 10))" # 3000
```

For more information, see the [official dotenv documentation](https://github.com/motdotla/dotenv). 

## 🔧 **Advanced Configuration**
```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/database

# .env.production
DATABASE_URL=postgresql://prod_user:real_password@prod-db:5432/prod_database
``` 