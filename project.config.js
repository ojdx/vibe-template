/**
 * Project Configuration
 * This file contains all project-specific settings that need to be customized
 * when creating a new project from the template.
 */

module.exports = {
  // Project Information
  project: {
    name: 'elmersho',
    description: 'A static website hosted on AWS',
    version: '1.0.0',
    author: '',
    license: 'ISC'
  },

  // GitHub Configuration
  github: {
    organization: 'ojdx-org',
    repository: 'elmersho',
    defaultBranch: 'dev',
    productionBranch: 'main',
    // Enable automatic branch deletion on PR merge
    deleteBranchOnMerge: true
  },

  // GitHub Actions Configuration
  githubActions: {
    oidcThumbprints: [
      '6938fd4d98bab03faadb97b34396831e3780aea1',
      '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
    ]
  },

  // Domain Configuration
  domain: {
    root: 'elmersho.com',
    includeWww: true
  },

  // AWS Configuration
  aws: {
    profile: 'jeremy',
    region: 'us-east-1',
    accountId: '431172852603', // Will be populated during setup
    
    // Domain Configuration
    domain: {
      name: 'elmersho.com',
      includeWww: true,
      // Existing Route 53 hosted zone ID (optional)
      hostedZoneId: '',
      // Existing ACM certificate ARN (optional)
      certificateArn: 'arn:aws:acm:us-east-1:431172852603:certificate/818a6eaf-02ea-47bf-9994-2c1c80c9689b'
    },

    // CDK Configuration
    cdk: {
      // Bootstrap configuration
      bootstrapStackName: 'CDKToolkit',
      // Stack naming pattern
      stackPrefix: 'Elmersho',
      // OIDC Role name for GitHub Actions
      oidcRoleName: 'GitHubActions-Elmersho-CDK-Deploy',
      // Stack names
      stackNameProduction: 'ElmershoWebsiteStack',
      stackNamePrefix: 'ElmershoWebsite'
    },

    // CloudFront Configuration
    cloudfront: {
      // Enable logging
      enableLogging: true,
      // Log retention in days
      logRetentionDays: 90,
      // Price class (PriceClass.PRICE_CLASS_100 or PriceClass.PRICE_CLASS_ALL)
      priceClass: 'PRICE_CLASS_100',
      // Cache TTL settings (in minutes)
      cacheTTL: {
        error404: 5,
        error403: 5
      }
    },

    // S3 Configuration
    s3: {
      // Bucket removal policy (DESTROY or RETAIN)
      removalPolicy: 'DESTROY',
      // Auto-delete objects on bucket removal
      autoDeleteObjects: true,
      // Log retention in days
      logRetentionDays: 90
    }
  },

  // Node.js Configuration
  node: {
    version: '>=18.0.0',
    npmVersion: '>=9.0.0'
  },

  // Testing Configuration
  testing: {
    coverageThresholds: {
      lines: 80,
      functions: 80,
      branches: 80
    }
  },

  // Development Configuration
  development: {
    port: 3000,
    // Local development server settings
    server: {
      staticPath: 'public-www'
    }
  },

  // Deployment Configuration
  deployment: {
    publicDir: './public-www',
    indexDocument: 'index.html',
    errorDocument: 'error.html'
  },

  // Feature Flags
  features: {
    // Enable deployment info injection
    deploymentInfo: true,
    // Enable token tracking
    tokenTracking: true,
    // Enable WAF (Web Application Firewall)
    enableWAF: false,
    // Enable CloudWatch alarms
    enableAlarms: false
  },

  // Computed values (don't edit these directly)
  get stackName() {
    return `${this.aws.cdk.stackPrefix}WebsiteStack`;
  },

  get devStackName() {
    return `${this.aws.cdk.stackPrefix}Website-dev`;
  },

  get bucketName() {
    return `${this.project.name}-website-${this.aws.region}`;
  },

  get logsBucketName() {
    return `${this.project.name}-logs-${this.aws.region}`;
  },

  get githubOidcRoleName() {
    return `GitHubActions-${this.project.name}-CDK-Deploy`;
  },

  // Helper functions
  helpers: {
    createSubdomain(branchName) {
      if (!branchName || branchName === 'main' || branchName === 'master') {
        return null;
      }
      
      // Clean branch name for use as subdomain
      return branchName.toLowerCase()
        .replace(/^(feature|feat|fix|hotfix|release)[\/\-]/i, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20);
    },
    
    getDomainName(branchName) {
      const config = module.exports;
      if (branchName === 'main' || branchName === 'master') {
        return config.aws.domain.name;
      }
      const subdomain = this.createSubdomain(branchName);
      return subdomain ? `${subdomain}.${config.aws.domain.name}` : config.aws.domain.name;
    },
    
    getStackName(branchName) {
      const config = module.exports;
      if (branchName === 'main' || branchName === 'master') {
        return config.stackName;
      }
      const subdomain = this.createSubdomain(branchName);
      return subdomain ? `${config.aws.cdk.stackPrefix}Website-${subdomain}` : config.stackName;
    },
    
    isProductionBranch(branchName) {
      return branchName === 'main' || branchName === 'master';
    },
    
    getBucketName(branchName, accountId) {
      const config = module.exports;
      const subdomain = this.createSubdomain(branchName);
      if (subdomain) {
        return `${config.project.name}-${subdomain}-${accountId}`;
      }
      return `${config.project.name}-website-${accountId}`;
    }
  }
};