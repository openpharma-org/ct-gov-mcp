# Branch Protection Configuration

## Required Settings for `main` Branch

Navigate to: **Settings** → **Branches** → **Add rule** → **Branch name pattern**: `main`

### ✅ Required Status Checks
Enable these checks before merging:
- `Test & Coverage (ubuntu-latest, 20)`
- `Code Quality`
- `Security Audit`
- `Performance Benchmarks`
- `Static Code Analysis`
- `Security Analysis`

### ✅ Recommended Settings
```yaml
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale reviews when new commits are pushed
  ✅ Require review from code owners
✅ Require linear history
✅ Include administrators
```

### ⚠️ Advanced Settings
```yaml
✅ Restrict pushes that create files larger than 100MB
✅ Restrict force pushes
✅ Allow deletion of protected branch: ❌
```

## Quick Setup Script

You can also configure via GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# brew install gh  # macOS
# gh auth login

gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Test & Coverage (ubuntu-latest, 20)","Code Quality","Security Audit"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
``` 