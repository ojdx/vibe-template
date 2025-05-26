#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { WebsiteStack } = require('./stacks/website-stack');
const projectConfig = require('../project.config');

const app = new cdk.App();

// Get branch name from environment or default to 'main'
const branchName = process.env.BRANCH_NAME || process.env.GITHUB_HEAD_REF || projectConfig.github.defaultBranch;

// Use helper methods from project config
const subdomain = projectConfig.helpers.createSubdomain(branchName);
const domainName = projectConfig.helpers.getDomainName(branchName);
const stackName = projectConfig.helpers.getStackName(branchName);

// Configuration
const config = {
  domainName,
  isProduction: projectConfig.helpers.isProductionBranch(branchName),
  branchName,
  certificateArn: projectConfig.aws.certificateArn,
  env: {
    account: projectConfig.aws.accountId,
    region: projectConfig.aws.region,
  },
};

console.log(`Deploying branch: ${branchName}`);
console.log(`Domain: ${domainName}`);
console.log(`Stack: ${stackName}`);

new WebsiteStack(app, stackName, {
  ...config,
  env: config.env,
  description: `Static website hosting for ${domainName} (${branchName} branch)`,
});