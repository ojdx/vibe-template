#!/usr/bin/env node

/**
 * Template Setup Script
 * Interactive setup wizard for configuring a new project from the template
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('\n🚀 Welcome to the AWS Static Website Template Setup!\n');
  console.log('This wizard will help you configure your project.\n');

  const config = {
    project: {},
    github: {},
    aws: {
      domain: {},
      cdk: {},
      cloudFront: {},
      s3: {}
    },
    node: {},
    testing: {},
    development: {
      server: {}
    },
    features: {}
  };

  // Project Information
  console.log('📋 Project Information');
  config.project.name = await question('Project name (lowercase, no spaces): ') || 'my-website';
  config.project.description = await question('Project description: ') || 'A static website hosted on AWS';
  config.project.author = await question('Author name: ') || '';
  config.project.license = await question('License (ISC): ') || 'ISC';
  config.project.version = '1.0.0';

  // GitHub Configuration
  console.log('\n🐙 GitHub Configuration');
  config.github.organization = await question('GitHub organization/username: ') || 'my-org';
  config.github.repository = config.project.name;
  config.github.defaultBranch = await question('Default branch (dev): ') || 'dev';
  config.github.productionBranch = await question('Production branch (main): ') || 'main';
  config.github.deleteBranchOnMerge = (await question('Auto-delete branches on merge? (y/n): ')).toLowerCase() === 'y';

  // AWS Configuration
  console.log('\n☁️  AWS Configuration');
  config.aws.profile = await question('AWS profile name (or press enter for default): ') || '';
  config.aws.region = await question('AWS region (us-east-1): ') || 'us-east-1';
  
  // Try to get AWS account ID
  try {
    const profileFlag = config.aws.profile ? `--profile ${config.aws.profile}` : '';
    config.aws.accountId = execSync(`aws sts get-caller-identity --query Account --output text ${profileFlag}`, { encoding: 'utf8' }).trim();
    console.log(`✅ AWS Account ID: ${config.aws.accountId}`);
  } catch (e) {
    console.log('⚠️  Could not retrieve AWS account ID. You can add it manually later.');
    config.aws.accountId = '';
  }

  // Domain Configuration
  console.log('\n🌐 Domain Configuration');
  const hasDomain = (await question('Do you have a domain for this project? (y/n): ')).toLowerCase() === 'y';
  if (hasDomain) {
    config.aws.domain.name = await question('Domain name (example.com): ');
    config.aws.domain.includeWww = (await question('Include www subdomain? (y/n): ')).toLowerCase() === 'y';
    config.aws.domain.hostedZoneId = await question('Existing Route 53 hosted zone ID (optional): ') || '';
    config.aws.domain.certificateArn = await question('Existing ACM certificate ARN (optional): ') || '';
  } else {
    config.aws.domain.name = '';
    config.aws.domain.includeWww = false;
  }

  // CDK Configuration
  config.aws.cdk.bootstrapStackName = 'CDKToolkit';
  config.aws.cdk.stackPrefix = config.project.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  // CloudFront Configuration
  config.aws.cloudFront.enableLogging = true;
  config.aws.cloudFront.logRetentionDays = 90;
  config.aws.cloudFront.priceClass = 'PRICE_CLASS_100';

  // S3 Configuration
  config.aws.s3.removalPolicy = 'DESTROY';
  config.aws.s3.autoDeleteObjects = true;

  // Node.js Configuration
  config.node.version = '>=18.0.0';
  config.node.npmVersion = '>=9.0.0';

  // Testing Configuration
  config.testing.coverageThresholds = {
    lines: 80,
    functions: 80,
    branches: 80
  };

  // Development Configuration
  config.development.port = parseInt(await question('Development server port (3000): ') || '3000');
  config.development.server.staticPath = 'public-www';

  // Feature Flags
  console.log('\n🎛️  Feature Configuration');
  config.features.deploymentInfo = true;
  config.features.tokenTracking = (await question('Enable AI token tracking? (y/n): ')).toLowerCase() === 'y';
  config.features.enableWAF = (await question('Enable WAF (Web Application Firewall)? (y/n): ')).toLowerCase() === 'y';
  config.features.enableAlarms = (await question('Enable CloudWatch alarms? (y/n): ')).toLowerCase() === 'y';

  // Generate computed properties
  const computedProperties = `
  // Computed values (don't edit these directly)
  get stackName() {
    return \`\${this.aws.cdk.stackPrefix}WebsiteStack\`;
  },

  get devStackName() {
    return \`\${this.aws.cdk.stackPrefix}Website-dev\`;
  },

  get bucketName() {
    return \`\${this.project.name}-website-\${this.aws.region}\`;
  },

  get logsBucketName() {
    return \`\${this.project.name}-logs-\${this.aws.region}\`;
  },

  get githubOidcRoleName() {
    return \`GitHubActions-\${this.project.name}-CDK-Deploy\`;
  }`;

  // Write configuration file
  const configContent = `/**
 * Project Configuration
 * Generated by setup script on ${new Date().toISOString()}
 */

module.exports = ${JSON.stringify(config, null, 2).slice(0, -1)}${computedProperties}
};`;

  fs.writeFileSync(path.join(process.cwd(), 'project.config.js'), configContent);
  console.log('\n✅ Configuration saved to project.config.js');

  // Update package.json
  console.log('\n📦 Updating package.json...');
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.name = config.project.name;
  packageJson.description = config.project.description;
  packageJson.author = config.project.author;
  packageJson.license = config.project.license;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  // Process workflow templates
  console.log('\n🔧 Processing workflow templates...');
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
  const templateFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.template'));
  
  for (const templateFile of templateFiles) {
    const templatePath = path.join(workflowsDir, templateFile);
    const outputPath = templatePath.replace('.template', '');
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, config.project.name);
    content = content.replace(/\{\{GITHUB_ORG\}\}/g, config.github.organization);
    content = content.replace(/\{\{GITHUB_REPO\}\}/g, config.github.repository);
    content = content.replace(/\{\{DEFAULT_BRANCH\}\}/g, config.github.defaultBranch);
    content = content.replace(/\{\{PRODUCTION_BRANCH\}\}/g, config.github.productionBranch);
    
    fs.writeFileSync(outputPath, content);
    fs.unlinkSync(templatePath); // Remove template file
  }

  // Initialize git repository
  const initGit = (await question('\n🐙 Initialize git repository? (y/n): ')).toLowerCase() === 'y';
  if (initGit) {
    console.log('Initializing git repository...');
    execSync('git init');
    execSync('git add .');
    execSync(`git commit -m "Initial commit from template"`);
    execSync(`git branch -M ${config.github.defaultBranch}`);
    
    const addRemote = (await question('Add GitHub remote? (y/n): ')).toLowerCase() === 'y';
    if (addRemote) {
      const remoteUrl = `https://github.com/${config.github.organization}/${config.github.repository}.git`;
      execSync(`git remote add origin ${remoteUrl}`);
      console.log(`✅ Remote added: ${remoteUrl}`);
    }
  }

  // Setup AWS resources
  const setupAWS = (await question('\n☁️  Setup AWS OIDC for GitHub Actions? (y/n): ')).toLowerCase() === 'y';
  if (setupAWS) {
    console.log('Setting up AWS OIDC...');
    try {
      execSync('node infrastructure/setup-github-oidc.js', { stdio: 'inherit' });
    } catch (e) {
      console.log('⚠️  AWS setup failed. You can run it manually later with: npm run setup:aws');
    }
  }

  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Review and adjust project.config.js if needed');
  console.log('2. Run: npm install');
  console.log('3. Add your website content to public-www/');
  if (config.features.tokenTracking) {
    console.log('4. Configure GitHub project for token tracking (see docs)');
  }
  if (setupAWS) {
    console.log('5. Add AWS_ROLE_ARN secret to GitHub repository settings');
  }
  console.log('\nRun "npm run dev" to start the development server');
  console.log('Run "npm run deploy" to deploy to AWS\n');

  rl.close();
}

setup().catch(console.error);