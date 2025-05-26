#!/usr/bin/env node

/**
 * Track AI token usage for GitHub issues
 * Usage: node track-tokens.js <issue-number> <model> <tokens>
 * Example: node track-tokens.js 63 "Claude 3.5 Sonnet" 1250
 */

const TokenTracker = require('../lib/token-tracker');

function parseArgs(args) {
  const issueNumber = args[0];
  const model = args[1];
  const tokens = args[2];
  
  if (!issueNumber || !model || !tokens) {
    return { valid: false };
  }
  
  return { valid: true, issueNumber, model, tokens };
}

function showUsage() {
  console.error('Usage: node track-tokens.js <issue-number> <model> <tokens>');
  console.error('Example: node track-tokens.js 63 "Claude 3.5 Sonnet" 1250');
}

async function trackTokens(issueNumber, model, tokens, tracker = null) {
  try {
    const trackerInstance = tracker || new TokenTracker();
    const result = await trackerInstance.trackTokens(issueNumber, model, tokens);
    
    console.log(`✅ Updated issue #${result.issueNumber}:`);
    console.log(`   Model: ${result.model}`);
    console.log(`   Tokens: ${result.tokens}`);
    
    return { success: true, result };
  } catch (error) {
    console.error('Error updating token tracking:', error.message);
    return { success: false, error };
  }
}

async function main(args = process.argv.slice(2)) {
  const parsed = parseArgs(args);
  
  if (!parsed.valid) {
    showUsage();
    process.exit(1);
  }
  
  const result = await trackTokens(parsed.issueNumber, parsed.model, parsed.tokens);
  
  if (!result.success) {
    process.exit(1);
  }
}

// Export for testing
if (require.main === module) {
  main();
} else {
  module.exports = { parseArgs, showUsage, trackTokens, main };
}