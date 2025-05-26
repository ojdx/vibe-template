# Deployment Guide

This guide covers deploying the elmersho application to production.

## Overview

elmersho is a static web application that can be deployed to any static hosting service. The application consists of:
- Static HTML files in `public-www/`
- JavaScript assets in `public-www/assets/`
- No server-side runtime required for production

## Deployment Options

### Option 1: Static File Hosting

#### Requirements
- Any web server capable of serving static files
- HTTPS support recommended

#### Steps
1. Build/prepare files (currently no build step required)
2. Copy `public-www/` contents to your web server
3. Configure web server to serve `index.html` as default

#### Example: Nginx Configuration
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/elmersho/public-www;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 2: GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: Select your deployment branch
4. Folder: `/public-www`
5. Save and wait for deployment

### Option 3: Netlify

1. Connect GitHub repository
2. Build command: (leave empty)
3. Publish directory: `public-www`
4. Deploy

### Option 4: Vercel

1. Import GitHub repository
2. Framework Preset: Other
3. Root Directory: `public-www`
4. Deploy

### Option 5: AWS (CloudFront + S3)

Deploy to AWS using CDK (Cloud Development Kit) for infrastructure as code.

#### Architecture Diagram

[View AWS Deployment Architecture](https://app.diagrams.net/#Hojdx-org%2Felmersho%2Fdev%2Fdocs%2Fdiagrams%2Faws-deployment-architecture.drawio) - Complete infrastructure overview with feature branch deployments

#### Requirements
- AWS account with appropriate permissions
- AWS CLI configured
- Node.js 18+ and npm
- CDK CLI: `npm install -g aws-cdk`

#### Initial Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Bootstrap CDK** (one-time setup):
   ```bash
   npm run cdk:bootstrap
   ```

3. **Deploy infrastructure**:
   ```bash
   npm run cdk:deploy
   ```

#### Architecture

The AWS deployment creates:
- **S3 Bucket**: Stores static website files
- **CloudFront Distribution**: Global CDN with SSL/TLS
- **Origin Access Control**: Secure S3 access (bucket not publicly readable)
- **Route 53**: DNS configuration for custom domain
- **SSL Certificate**: Managed by AWS Certificate Manager

#### Manual Commands

- **Synthesize CloudFormation**: `npm run cdk:synth`
- **View differences**: `npm run cdk:diff`
- **Deploy**: `npm run cdk:deploy`
- **Destroy infrastructure**: `npm run cdk:destroy`

#### Automated Deployment

GitHub Actions workflow automatically deploys on pushes to main branch:
- Builds and deploys CDK stack
- Uploads website files to S3
- Invalidates CloudFront cache
- Uses OIDC for secure AWS authentication

#### Configuration

Domain and certificate settings in `infrastructure/app.ts`:
```typescript
const config = {
  domainName: 'elmersho.com',
  certificateArn: 'arn:aws:acm:us-east-1:...',
  env: { region: 'us-east-1' }
};
```

#### Feature Branch Deployments

The AWS CDK infrastructure supports automatic feature branch deployments:

- **Main/Master Branch**: Deploys to `elmersho.com` and `www.elmersho.com`
- **Feature Branches**: Deploys to `<branch-name>.elmersho.com`

**Branch Name Processing:**
- Removes common prefixes: `feature/`, `feat/`, `fix/`, `hotfix/`, `release/`
- Converts to lowercase and replaces non-alphanumeric characters with hyphens
- Limits length to 20 characters for DNS compatibility

**Examples:**
- `feature/aws-deployment` → `aws-deployment.elmersho.com`
- `fix/login-bug` → `login-bug.elmersho.com`
- `feat/user-dashboard` → `user-dashboard.elmersho.com`

**Manual Deployment:**
```bash
# Deploy a specific branch
npm run cdk:deploy:branch --branch=feature/my-feature

# Destroy a feature branch deployment
npm run cdk:destroy:branch --branch=feature/my-feature
```

**Automated Deployment:**
- Pull requests automatically deploy to feature branch subdomains
- PR comments include the preview URL
- Deployments are cleaned up when PRs are closed

#### Monitoring

- **CloudFront**: Monitor cache hit ratio and origin requests
- **S3**: Track storage usage and requests
- **Route 53**: Monitor DNS query volume
- **CloudWatch**: Set up alarms for 4xx/5xx errors

## Production Considerations

### Environment Variables

Currently, no environment variables are required for production.

### Performance

1. **Enable compression**: Configure gzip/brotli on your web server
2. **Set cache headers**: 
   ```
   # Static assets (1 year)
   /assets/*: Cache-Control: public, max-age=31536000
   
   # HTML (no cache)
   *.html: Cache-Control: no-cache
   ```

3. **Enable HTTP/2**: For better performance

### Security

1. **Always use HTTPS** in production
2. **Set security headers**:
   ```
   Content-Security-Policy: default-src 'self'
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   ```

3. **Configure CORS** if needed

## Deployment Checklist

- [ ] Test locally with `npm run dev`
- [ ] Run tests: `npm test`
- [ ] Check test coverage: `npm run test:coverage`
- [ ] Verify all files in `public-www/` are committed
- [ ] Update version in `package.json` if needed
- [ ] Create git tag for release
- [ ] Deploy to staging environment first
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Verify production deployment

## Rollback Procedure

1. **Git-based deployments**: Revert to previous commit/tag
   ```bash
   git checkout <previous-tag>
   # Redeploy
   ```

2. **File-based deployments**: Keep backup of previous version
   ```bash
   # Before deployment
   cp -r /var/www/elmersho /var/www/elmersho.backup
   
   # To rollback
   mv /var/www/elmersho /var/www/elmersho.failed
   mv /var/www/elmersho.backup /var/www/elmersho
   ```

## Monitoring

After deployment, verify:
1. Site loads correctly
2. Console has no errors
3. All assets load (check Network tab)
4. Functionality works as expected

## Automation

Consider setting up CI/CD for automatic deployments:

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Add deployment commands here
```

## Troubleshooting

### Site Not Loading
- Check web server error logs
- Verify file permissions
- Ensure index.html exists

### Assets Not Loading
- Check file paths are correct
- Verify assets are deployed
- Check browser console for 404 errors

### JavaScript Errors
- Check browser console
- Verify all files uploaded correctly
- Test in different browsers