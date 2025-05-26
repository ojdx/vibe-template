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
      certificateArn: ''
    },

    // CDK Configuration
    cdk: {
      // Bootstrap configuration
      bootstrapStackName: 'CDKToolkit',
      // Stack naming pattern
      stackPrefix: 'Elmersho'
    },

    // CloudFront Configuration
    cloudFront: {
      // Enable logging
      enableLogging: true,
      // Log retention in days
      logRetentionDays: 90,
      // Price class (PriceClass.PRICE_CLASS_100 or PriceClass.PRICE_CLASS_ALL)
      priceClass: 'PRICE_CLASS_100'
    },

    // S3 Configuration
    s3: {
      // Bucket removal policy (DESTROY or RETAIN)
      removalPolicy: 'DESTROY',
      // Auto-delete objects on bucket removal
      autoDeleteObjects: true
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
  }
};