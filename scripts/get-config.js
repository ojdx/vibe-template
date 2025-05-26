#!/usr/bin/env node

/**
 * Helper script to output configuration values for use in shell scripts and GitHub Actions
 * Usage: node scripts/get-config.js <key>
 * Example: node scripts/get-config.js project.name
 */

const projectConfig = require('../project.config');

const key = process.argv[2];

if (!key) {
  console.error('Usage: node scripts/get-config.js <key>');
  console.error('Example: node scripts/get-config.js project.name');
  process.exit(1);
}

// Handle special keys that need computation
if (key.startsWith('helpers.')) {
  const [, method, ...args] = key.split('.');
  if (typeof projectConfig.helpers[method] === 'function') {
    console.log(projectConfig.helpers[method](...args));
  } else {
    console.error(`Helper method not found: ${method}`);
    process.exit(1);
  }
} else {
  // Navigate through the config object
  const keys = key.split('.');
  let value = projectConfig;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.error(`Configuration key not found: ${key}`);
      process.exit(1);
    }
  }
  
  // Output the value
  if (typeof value === 'object') {
    console.log(JSON.stringify(value));
  } else {
    console.log(value);
  }
}