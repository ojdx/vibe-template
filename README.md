# AWS Static Website Template 🚀

A production-ready template for deploying static websites to AWS using CDK, S3, CloudFront, and GitHub Actions.

## Features ✨

- **AWS CDK Infrastructure**: Automated infrastructure as code
- **S3 + CloudFront**: Global CDN for fast content delivery
- **Custom Domain Support**: Route 53 DNS with SSL/TLS certificates
- **GitHub Actions CI/CD**: Automated deployments with OIDC authentication
- **Feature Branch Deployments**: Automatic preview environments
- **Deployment Info**: Track deployment metadata in your HTML
- **Testing Framework**: Built-in testing with coverage reporting
- **Development Server**: Local development environment
- **Security**: WAF support, Origin Access Control, HTTPS only
- **Monitoring**: CloudWatch metrics and optional alarms
- **Automatic Cleanup**: Remove resources when branches are deleted

## Quick Start 🏃‍♂️

1. **Clone this template**
   ```bash
   git clone https://github.com/ojdx/vibe-template.git my-website
   cd my-website
   ```

2. **Initialize the template**
   ```bash
   ./init-template.sh
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the setup wizard**
   ```bash
   npm run setup
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure 📁

```
├── .github/
│   ├── workflows/         # GitHub Actions workflows
│   └── TOKEN_TRACKING.md  # AI token usage tracking
├── public-www/            # Your website content
│   ├── index.html
│   └── assets/
├── infrastructure/        # AWS CDK code
│   ├── app.js
│   ├── stacks/
│   └── setup-github-oidc.js
├── scripts/              # Utility scripts
├── test/                 # Test files
├── docs/                 # Documentation
│   └── diagrams/         # Architecture diagrams
└── project.config.js     # Project configuration
```

## Configuration 🔧

All project settings are centralized in `project.config.js`:

```javascript
module.exports = {
  project: {
    name: 'my-website',
    description: 'My awesome website'
  },
  github: {
    organization: 'my-org',
    repository: 'my-website'
  },
  aws: {
    profile: 'default',
    region: 'us-east-1',
    domain: {
      name: 'example.com',
      includeWww: true
    }
  }
  // ... more settings
};
```

## Commands 📝

### Development
- `npm run dev` - Start local development server
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report

### Deployment
- `npm run deploy` - Deploy to production (main branch)
- `npm run deploy:dev` - Deploy to development
- `npm run cdk:synth` - Synthesize CloudFormation template
- `npm run cdk:diff` - Show deployment differences

### Utilities
- `npm run setup` - Run setup wizard
- `npm run setup:aws` - Setup AWS OIDC authentication
- `npm run track-tokens` - Track AI token usage
- `npm run diagram` - Work with architecture diagrams

## Deployment Process 🚢

### Initial Setup

1. **Configure AWS Credentials**
   ```bash
   aws configure --profile your-profile
   ```

2. **Bootstrap CDK** (first time only)
   ```bash
   npm run cdk:bootstrap
   ```

3. **Setup GitHub OIDC**
   ```bash
   npm run setup:aws
   ```

4. **Add GitHub Secret**
   - Go to your repository settings
   - Add `AWS_ROLE_ARN` secret with the role ARN from setup

### Deployment Flow

1. **Feature Branches**: Automatically deploy to `feature-name.yourdomain.com`
2. **Dev Branch**: Deploys to `dev.yourdomain.com`
3. **Main Branch**: Deploys to `yourdomain.com`

## Architecture 🏗️

The template deploys a complete static website infrastructure:

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────┐
│ Route53 │────▶│CloudFront│────▶│Origin Access│────▶│  S3  │
└─────────┘     └──────────┘     │  Control   │     └──────┘
                      │           └────────────┘
                      ▼
                ┌──────────┐
                │   WAF    │
                └──────────┘
```

## Customization 🎨

### Adding Content

Place your website files in the `public-www/` directory:
- HTML files
- CSS stylesheets
- JavaScript files
- Images and assets

### Modifying Infrastructure

Edit files in the `infrastructure/` directory:
- `app.js` - Main CDK app
- `stacks/website-stack.js` - Infrastructure definition

### Workflow Customization

Modify GitHub Actions workflows in `.github/workflows/`:
- `aws-deploy.yml` - Deployment workflow
- `coverage.yml` - Test coverage reporting
- `aws-cleanup.yml` - Resource cleanup

## Security 🔒

- **OIDC Authentication**: No AWS credentials stored in GitHub
- **HTTPS Only**: All traffic encrypted with SSL/TLS
- **Origin Access Control**: S3 bucket not publicly accessible
- **Optional WAF**: Web Application Firewall protection
- **Branch Protection**: Separate permissions for dev/prod

## Monitoring 📊

- **CloudWatch Metrics**: Monitor performance and usage
- **CloudFront Logs**: Access logs stored in S3
- **Optional Alarms**: Set up alerts for issues
- **Deployment Info**: Track deployment metadata

## Costs 💰

Estimated monthly costs for a small website:
- **Route 53**: ~$0.50/month per hosted zone
- **S3**: ~$0.023/GB stored + ~$0.09/GB transferred
- **CloudFront**: ~$0.085/GB transferred (first 10TB)
- **ACM**: Free SSL certificates

## Troubleshooting 🔧

### Common Issues

1. **CDK Bootstrap Failed**
   ```bash
   npx cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

2. **Domain Not Resolving**
   - Check Route 53 DNS propagation (can take up to 48 hours)
   - Verify nameservers are correct

3. **Deployment Failed**
   - Check GitHub Actions logs
   - Verify AWS credentials and permissions
   - Run `npm run cdk:diff` locally

### Debug Commands

```bash
# Check AWS credentials
aws sts get-caller-identity --profile your-profile

# Test CDK synthesis
npm run cdk:synth

# View CloudFormation stacks
aws cloudformation list-stacks --profile your-profile
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

This template is open source and available under the [MIT License](LICENSE).

## Support 💬

- Create an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed information for bug reports

## Acknowledgments 🙏

Built with:
- [AWS CDK](https://aws.amazon.com/cdk/)
- [GitHub Actions](https://github.com/features/actions)
- [Node.js](https://nodejs.org/)

---

Made with ❤️ by the OJDX team