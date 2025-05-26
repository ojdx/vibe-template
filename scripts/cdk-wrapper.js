#!/usr/bin/env node

const { spawn } = require('child_process');
const projectConfig = require('../project.config');

const args = process.argv.slice(2);
const command = args[0];
const cdkArgs = args.slice(1);

// Add profile only if not in CI environment
if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
  cdkArgs.push('--profile', projectConfig.aws.profile);
} else if (command === 'deploy') {
  // In CI, skip approval prompts
  cdkArgs.push('--require-approval', 'never');
}

const cdk = spawn('cdk', [command, ...cdkArgs], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

cdk.on('exit', (code) => {
  process.exit(code);
});