# AWS Deployment Guide

This guide covers deploying the elmersho website to AWS using CDK (Cloud Development Kit).

## Architecture

The deployment uses the following AWS services:

- **S3 Bucket**: Stores static website files (HTML, CSS, JS)
- **CloudFront**: CDN for global content delivery with SSL
- **Route 53**: DNS management for elmersho.com domain
- **ACM Certificate**: SSL certificate for HTTPS

See the [Web Content Delivery diagram](../docs/diagrams/Web%20Content%20Delivery.drawio) for visual architecture.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Node.js** 18+ installed
4. **Domain**: elmersho.com hosted zone in Route 53
5. **SSL Certificate**: ACM certificate in us-east-1 region

## Manual Deployment

### First-time Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   # or use environment variables/IAM roles
   ```

3. **Bootstrap CDK** (one-time per account/region):
   ```bash
   npm run cdk:bootstrap
   ```

### Deploy Infrastructure

1. **Synthesize CloudFormation template**:
   ```bash
   npm run cdk:synth
   ```

2. **Preview changes**:
   ```bash
   npm run cdk:diff
   ```

3. **Deploy to AWS**:
   ```bash
   npm run cdk:deploy
   ```

4. **Verify deployment**:
   - Check CloudFormation stack: `ElmershoWebsiteStack`
   - Visit https://elmersho.com
   - Verify SSL certificate is working

### Update Website Content

When you update files in `public-www/`, the CDK deployment will:
1. Upload new files to S3
2. Invalidate CloudFront cache
3. Make changes live immediately

## GitHub Actions Deployment

### Automatic Deployment

The website automatically deploys when:
- Code is pushed to `main` branch
- Files in `public-www/` or `infrastructure/` are changed

### Manual Deployment

You can trigger manual deployment via GitHub Actions:
1. Go to Actions tab in GitHub
2. Select "Deploy to AWS" workflow
3. Click "Run workflow"
4. Choose environment (production)

### Required Secrets

The GitHub workflow requires these repository secrets:

1. **AWS_ROLE_ARN**: IAM role ARN for GitHub OIDC
   ```
   arn:aws:iam::431172852603:role/GitHubActionsRole
   ```

## CDK Commands Reference

| Command | Description |
|---------|-------------|
| `npm run cdk:bootstrap` | One-time CDK setup per account/region |
| `npm run cdk:synth` | Generate CloudFormation template |
| `npm run cdk:deploy` | Deploy infrastructure to AWS |
| `npm run cdk:diff` | Show differences from deployed stack |
| `npm run cdk:destroy` | Delete all AWS resources |

## Infrastructure Components

### S3 Bucket

- **Name**: `elmersho-website-{account-id}`
- **Purpose**: Static website hosting
- **Access**: Private (accessed via CloudFront OAC)
- **Features**: Auto-delete on stack removal

### CloudFront Distribution

- **Domain**: elmersho.com, www.elmersho.com
- **SSL**: ACM certificate (TLS 1.2+)
- **Caching**: Optimized for static content
- **Security**: HTTPS redirect enforced
- **Error pages**: Custom 404/403 handling

### Route 53 Records

- **A Record**: elmersho.com → CloudFront
- **A Record**: www.elmersho.com → CloudFront
- **Zone**: Existing hosted zone lookup

## Monitoring and Maintenance

### CloudFront Cache

Cache is automatically invalidated on deployment. Manual invalidation:
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"
```

### Costs

Estimated monthly costs (low traffic):
- S3: ~$1-5
- CloudFront: ~$5-15
- Route 53: ~$0.50
- ACM: Free

### Cleanup

To remove all AWS resources:
```bash
npm run cdk:destroy
```

⚠️ **Warning**: This will delete the S3 bucket and all website content.

## Troubleshooting

### Common Issues

**CDK Bootstrap Error**:
- Ensure AWS credentials are configured
- Check permissions for CloudFormation, S3, IAM

**Certificate Not Found**:
- Verify certificate ARN in `infrastructure/app.ts`
- Ensure certificate is in us-east-1 region

**Domain Not Resolving**:
- Check Route 53 hosted zone exists
- Verify DNS propagation (can take 24-48 hours)

**GitHub Actions Failing**:
- Check AWS_ROLE_ARN secret is set
- Verify IAM role has required permissions
- Check GitHub OIDC provider is configured

### Useful Commands

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name ElmershoWebsiteStack

# List S3 bucket contents
aws s3 ls s3://elmersho-website-{account-id}

# Get CloudFront distribution info
aws cloudfront list-distributions

# Check Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890123
```

## Security Considerations

- S3 bucket is private with CloudFront OAC access only
- HTTPS is enforced (HTTP redirects to HTTPS)
- Modern TLS 1.2+ protocols only
- No direct S3 website hosting (more secure)
- IAM roles follow least privilege principle

## Next Steps

After deployment:
1. Set up monitoring with CloudWatch
2. Configure CloudFront logging
3. Add WAF for additional security
4. Set up Route 53 health checks