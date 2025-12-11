# Secrets Configuration Guide

## Required Setup Location
Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

## 🔐 Essential Secrets

### 1. NPM_TOKEN (For package publishing)
```bash
# Generate at: https://www.npmjs.com/settings/tokens
# Select: Automation token
NPM_TOKEN=npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🛡️ Security Enhancement Secrets

### 2. SNYK_TOKEN (Vulnerability scanning)
```bash
# Sign up at: https://snyk.io
# Navigate to: Account Settings → API Token
SNYK_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. SONAR_TOKEN (Code quality analysis)
```bash
# Sign up at: https://sonarcloud.io
# Create project → Security → Tokens
SONAR_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. SEMGREP_APP_TOKEN (Advanced security scanning)
```bash
# Sign up at: https://semgrep.dev
# Navigate to: Settings → Tokens
SEMGREP_APP_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. SEMGREP_DEPLOYMENT_ID (Semgrep deployment tracking)
```bash
# Found in Semgrep dashboard after creating a deployment
SEMGREP_DEPLOYMENT_ID=12345
```

## 📢 Notification Secrets

### 6. SLACK_WEBHOOK_URL (Release notifications)
```bash
# Create Slack app at: https://api.slack.com/apps
# Add Incoming Webhooks → Create webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
```

## ☁️ Cloud Provider Secrets (Future use)

### 8. AWS Credentials (For AWS deployments)
```bash
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

### 9. GCP Credentials (For Google Cloud deployments)
```bash
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GCP_PROJECT_ID=your-project-id
```

## 🔧 Quick Setup Commands

### Snyk Setup
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate and get token
snyk auth
snyk config get api
```

### SonarQube Setup
```bash
# Add sonar-project.properties to project root
cat > sonar-project.properties << EOF
sonar.projectKey=uh-joan_ct.gov-mcp-server
sonar.organization=uh-joan
sonar.sources=src
sonar.tests=tests
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=tests/**,scripts/**,**/*.test.ts
EOF
```

## 🎯 Priority Order
1. **High Priority**: NPM_TOKEN, SNYK_TOKEN
2. **Medium Priority**: SONAR_TOKEN, SLACK_WEBHOOK_URL  
3. **Low Priority**: SEMGREP_*
4. **Future**: Cloud provider credentials

## 🔍 Verification
After adding secrets, check workflow runs to ensure they're being used correctly:
- Snyk scans should show detailed vulnerability reports
- SonarQube should appear in PR comments
- Slack notifications should be sent on releases 