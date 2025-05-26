#!/usr/bin/env node

/**
 * Script to set up GitHub OIDC provider and IAM role for GitHub Actions
 * Run this once to create the necessary AWS resources
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const projectConfig = require('../project.config');

// Configuration from project config
const GITHUB_ORG = projectConfig.github.organization;
const GITHUB_REPO = projectConfig.github.repository;
const ROLE_NAME = projectConfig.cdk.oidcRoleName;

// Get AWS account ID
function getAccountId() {
  try {
    const result = execSync(`aws sts get-caller-identity --query Account --output text --profile ${projectConfig.aws.profile}`, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    console.error(`Error getting AWS account ID. Make sure you are logged in to AWS with profile: ${projectConfig.aws.profile}`);
    process.exit(1);
  }
}

// Check if OIDC provider already exists
function checkOIDCProvider(accountId) {
  try {
    execSync(`aws iam get-open-id-connect-provider --open-id-connect-provider-arn arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com --profile ${projectConfig.aws.profile}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Create OIDC provider
function createOIDCProvider() {
  console.log('Creating GitHub OIDC provider...');
  try {
    execSync(`aws iam create-open-id-connect-provider \
      --url https://token.actions.githubusercontent.com \
      --client-id-list sts.amazonaws.com \
      --thumbprint-list ${projectConfig.githubActions.oidcThumbprints.join(' ')} \
      --profile ${projectConfig.aws.profile}`, 
      { stdio: 'inherit' }
    );
    console.log('✅ OIDC provider created successfully');
  } catch (error) {
    console.error('❌ Failed to create OIDC provider:', error.message);
    process.exit(1);
  }
}

// Create trust policy
function createTrustPolicy(accountId) {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Federated: `arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com`
        },
        Action: "sts:AssumeRoleWithWebIdentity",
        Condition: {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          StringLike: {
            "token.actions.githubusercontent.com:sub": [
              `repo:${GITHUB_ORG}/${GITHUB_REPO}:*`
            ]
          }
        }
      }
    ]
  };
}

// Create IAM role
function createRole(accountId) {
  console.log(`\nCreating IAM role: ${ROLE_NAME}...`);
  
  const trustPolicy = createTrustPolicy(accountId);
  const trustPolicyFile = path.join(__dirname, 'trust-policy.json');
  
  try {
    // Write trust policy to file
    fs.writeFileSync(trustPolicyFile, JSON.stringify(trustPolicy, null, 2));
    
    // Create role
    execSync(`aws iam create-role \
      --role-name ${ROLE_NAME} \
      --assume-role-policy-document file://${trustPolicyFile} \
      --profile ${projectConfig.aws.profile}`,
      { stdio: 'inherit' }
    );
    
    console.log('✅ IAM role created successfully');
    
    // Clean up
    fs.unlinkSync(trustPolicyFile);
  } catch (error) {
    if (error.message.includes('EntityAlreadyExists')) {
      console.log('ℹ️  Role already exists, updating trust policy...');
      execSync(`aws iam update-assume-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-document file://${trustPolicyFile} \
        --profile ${projectConfig.aws.profile}`,
        { stdio: 'inherit' }
      );
      fs.unlinkSync(trustPolicyFile);
    } else {
      console.error('❌ Failed to create role:', error.message);
      if (fs.existsSync(trustPolicyFile)) {
        fs.unlinkSync(trustPolicyFile);
      }
      process.exit(1);
    }
  }
}

// Attach policies to role
function attachPolicies() {
  console.log('\nAttaching policies to role...');
  
  const policies = [
    'arn:aws:iam::aws:policy/PowerUserAccess'  // For CDK deployments
  ];
  
  for (const policy of policies) {
    try {
      execSync(`aws iam attach-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-arn ${policy} \
        --profile ${projectConfig.aws.profile}`,
        { stdio: 'inherit' }
      );
      console.log(`✅ Attached policy: ${policy}`);
    } catch (error) {
      if (!error.message.includes('AttachmentLimitExceeded')) {
        console.error(`❌ Failed to attach policy ${policy}:`, error.message);
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Setting up GitHub OIDC for AWS...\n');
  
  const accountId = getAccountId();
  console.log(`AWS Account ID: ${accountId}`);
  
  // Check and create OIDC provider
  if (checkOIDCProvider(accountId)) {
    console.log('ℹ️  GitHub OIDC provider already exists');
  } else {
    createOIDCProvider();
  }
  
  // Create role
  createRole(accountId);
  
  // Attach policies
  attachPolicies();
  
  // Output the role ARN
  const roleArn = `arn:aws:iam::${accountId}:role/${ROLE_NAME}`;
  
  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Add the following secret to your GitHub repository:');
  console.log(`   Name: AWS_ROLE_ARN`);
  console.log(`   Value: ${roleArn}`);
  console.log(`\n2. Go to: https://github.com/${projectConfig.github.organization}/${projectConfig.github.repository}/settings/secrets/actions`);
  console.log('3. Click "New repository secret"');
  console.log('4. Add the secret with the name and value above');
  console.log('\n5. The GitHub Actions workflow is already configured to use OIDC');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}