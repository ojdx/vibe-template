#!/usr/bin/env node

/**
 * Configure repository settings for automatic branch deletion
 */

const { execSync } = require('child_process');
const projectConfig = require('../project.config');

const OWNER = projectConfig.github.organization;
const REPO = projectConfig.github.repository;

console.log('🔧 Configuring repository settings...\n');

try {
  // Enable automatic deletion of head branches when PRs are merged
  execSync(`gh api repos/${OWNER}/${REPO} \
    --method PATCH \
    --field delete_branch_on_merge=true`, 
    { stdio: 'inherit' }
  );
  
  console.log('✅ Enabled automatic branch deletion on PR merge');
  
  // Get current settings to confirm
  const settings = JSON.parse(
    execSync(`gh api repos/${OWNER}/${REPO} --jq '.delete_branch_on_merge'`, 
    { encoding: 'utf8' })
  );
  
  console.log(`\n📋 Current setting: delete_branch_on_merge = ${settings}`);
  
} catch (error) {
  console.error('❌ Error configuring repository:', error.message);
  process.exit(1);
}