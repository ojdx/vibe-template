# Git Workflow

This project follows a simplified git flow with an integration branch.

## Branches

- **main** - Production branch (protected, requires PR review)
- **dev** - Integration branch for testing features together
- **feature/*** - Feature branches created from dev

## Workflow

1. **Create feature branch from dev**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Work on your feature**
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

3. **Create PR to dev**
   - Push your feature branch
   - Create PR from `feature/your-feature-name` → `dev`
   - No review required for dev

4. **Test in dev environment**
   - All features integrate in dev
   - Run tests and verify functionality

5. **Deploy to production**
   - Create PR from `dev` → `main`
   - Requires review before merge
   - Triggers production deployment

## Branch Protection Rules

### main branch:
- Require pull request reviews (1 approval)
- Dismiss stale PR approvals when new commits are pushed
- Require status checks to pass (tests, build)
- No direct pushes

### dev branch:
- No restrictions (optional: require PRs but no reviews)

## Commands Reference

```bash
# Start new feature
git checkout dev && git pull && git checkout -b feature/new-feature

# Update feature branch with latest dev
git checkout dev && git pull
git checkout feature/new-feature
git merge dev

# Clean up after merge
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```