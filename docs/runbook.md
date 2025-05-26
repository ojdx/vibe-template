# elmersho Runbook

This document outlines all manual operations and procedures for the elmersho project.

## Table of Contents
- [Development Operations](#development-operations)
- [Release Management](#release-management)
- [Troubleshooting](#troubleshooting)
- [Emergency Procedures](#emergency-procedures)

## Development Operations

### Starting Fresh Development

1. **Clone and Setup**
   ```bash
   git clone https://github.com/ojdx-org/elmersho.git
   cd elmersho
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

### Creating a New Feature

1. **Update local dev branch**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/issue-XX-description
   ```

3. **After development, before committing**
   ```bash
   # Run tests
   npm test
   
   # Check coverage
   npm run test:coverage:check
   
   # Track AI tokens (if used)
   npm run track-tokens <issue-number> "<model>" <tokens>
   
   # Commit
   git add .
   git commit -m "feat: your feature description"
   ```

### Manual Pre-commit Checks

Before every commit:
1. ✅ Tests pass: `npm test`
2. ✅ Coverage meets 80%: `npm run test:coverage:check`
3. ✅ AI tokens tracked (if applicable)
4. ✅ No console.log statements in production code
5. ✅ No hardcoded values that should be configurable

### Syncing Branches

**Sync dev with main** (after main release):
```bash
git checkout dev
git pull origin dev
git merge main
git push origin dev
```

**Update feature branch with latest dev**:
```bash
git checkout feature/your-branch
git merge dev
# Resolve conflicts if any
git push origin feature/your-branch
```

## Release Management

### Creating a Release

1. **Ensure dev is stable**
   ```bash
   git checkout dev
   npm test
   npm run test:coverage:check
   ```

2. **Create PR from dev to main**
   ```bash
   gh pr create --base main --head dev --title "Release vX.Y.Z"
   ```

3. **After PR approval and merge**
   ```bash
   git checkout main
   git pull origin main
   git tag -a vX.Y.Z -m "Release version X.Y.Z"
   git push origin vX.Y.Z
   ```

4. **Create GitHub Release**
   ```bash
   gh release create vX.Y.Z --title "Release vX.Y.Z" --notes "Release notes here"
   ```

5. **Update package.json version**
   ```bash
   git checkout dev
   npm version patch/minor/major
   git push origin dev
   ```

### Deployment Steps

See [deployment.md](deployment.md) for detailed deployment instructions.

Manual steps summary:
1. Test in staging environment
2. Backup current production
3. Deploy new version
4. Verify deployment
5. Monitor for issues

## Troubleshooting

### Common Issues and Solutions

#### Development Server Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### Tests Failing Locally but Not in CI
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be v18+
```

#### Coverage Below Threshold
```bash
# Generate detailed report
npm run test:coverage:html
open coverage/index.html

# Find uncovered lines and add tests
```

#### Token Tracking Hook Failing
```bash
# Bypass for emergency commits (use sparingly!)
git commit --no-verify -m "emergency: fix description"

# Then track tokens immediately after
npm run track-tokens <issue> "<model>" <tokens>
```

### Debugging Production Issues

1. **Check browser console** for JavaScript errors
2. **Verify all files deployed** correctly
3. **Check network tab** for failed resource loads
4. **Test in incognito mode** to rule out cache issues

## Emergency Procedures

### Rollback Production

**Quick rollback** (if using git-based deployment):
```bash
# Find last known good commit
git log --oneline -10

# Deploy specific commit
git checkout <commit-hash>
# Trigger deployment
```

**Manual rollback**:
```bash
# On production server
cd /var/www
mv elmersho elmersho.broken
mv elmersho.backup elmersho
```

### Hotfix Process

1. **Create hotfix from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/issue-description
   ```

2. **Make minimal fix**
   ```bash
   # Fix issue
   npm test  # Ensure tests pass
   git add .
   git commit -m "hotfix: description"
   ```

3. **Fast-track to production**
   ```bash
   # PR directly to main
   gh pr create --base main --title "Hotfix: description"
   
   # After merge, backport to dev
   git checkout dev
   git cherry-pick <hotfix-commit>
   git push origin dev
   ```

### Data Recovery

Currently, elmersho has no persistent data storage. If adding data features:
1. Document backup procedures here
2. Include restore procedures
3. Test recovery process regularly

## Maintenance Tasks

### Weekly
- Review and merge dependabot PRs
- Check for security advisories
- Review open issues

### Monthly
- Update dependencies: `npm update`
- Review and update documentation
- Clean up old feature branches

### Quarterly
- Security audit: `npm audit`
- Performance review
- Documentation review

## Contact Information

For emergencies:
- Create urgent issue with `urgent` label
- Contact maintainers via GitHub

## Appendix

### Useful Commands

```bash
# View recent commits
git log --oneline -20

# Check file changes
git diff --stat

# Find when bug introduced
git bisect start
git bisect bad  # Current commit is bad
git bisect good <known-good-commit>

# Clean working directory
git clean -fd
git checkout .

# Check GitHub API rate limit
gh api rate_limit
```

### Environment Variables

See [.env.example](../.env.example) for all available configuration options.