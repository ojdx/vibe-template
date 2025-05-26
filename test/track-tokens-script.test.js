const test = require('node:test');
const assert = require('node:assert');
const { parseArgs, showUsage, trackTokens, main } = require('../scripts/track-tokens.js');

test('parseArgs parses valid arguments', () => {
  const result = parseArgs(['123', 'Claude 3.5 Sonnet', '5000']);
  
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.issueNumber, '123');
  assert.strictEqual(result.model, 'Claude 3.5 Sonnet');
  assert.strictEqual(result.tokens, '5000');
});

test('parseArgs returns invalid for missing arguments', () => {
  assert.strictEqual(parseArgs([]).valid, false);
  assert.strictEqual(parseArgs(['123']).valid, false);
  assert.strictEqual(parseArgs(['123', 'model']).valid, false);
});

test('showUsage outputs usage information', () => {
  // Capture console.error
  const originalError = console.error;
  let errorOutput = [];
  console.error = (...args) => errorOutput.push(args.join(' '));
  
  showUsage();
  
  console.error = originalError;
  
  assert.strictEqual(errorOutput.length, 2);
  assert.ok(errorOutput[0].includes('Usage: node track-tokens.js'));
  assert.ok(errorOutput[1].includes('Example:'));
});

test('trackTokens handles successful tracking', async () => {
  // Mock tracker
  const mockTracker = {
    trackTokens: async (issue, model, tokens) => ({
      issueNumber: parseInt(issue),
      model,
      tokens: parseInt(tokens),
      success: true
    })
  };
  
  // Capture console output
  const originalLog = console.log;
  let logOutput = [];
  console.log = (...args) => logOutput.push(args.join(' '));
  
  const result = await trackTokens('123', 'Claude 3.5 Sonnet', '5000', mockTracker);
  
  console.log = originalLog;
  
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.result.issueNumber, 123);
  assert.ok(logOutput[0].includes('✅ Updated issue #123'));
  assert.ok(logOutput[1].includes('Model: Claude 3.5 Sonnet'));
  assert.ok(logOutput[2].includes('Tokens: 5000'));
});

test('trackTokens handles tracking errors', async () => {
  // Mock tracker that throws
  const mockTracker = {
    trackTokens: async () => {
      throw new Error('Connection failed');
    }
  };
  
  // Capture console output
  const originalError = console.error;
  let errorOutput = [];
  console.error = (...args) => errorOutput.push(args.join(' '));
  
  const result = await trackTokens('123', 'Claude 3.5 Sonnet', '5000', mockTracker);
  
  console.error = originalError;
  
  assert.strictEqual(result.success, false);
  assert.ok(errorOutput[0].includes('Error updating token tracking: Connection failed'));
});

test('main function with valid arguments', async () => {
  // Mock process.exit
  const originalExit = process.exit;
  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
    throw new Error(`Process.exit(${code})`);
  };
  
  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;
  let logOutput = [];
  let errorOutput = [];
  console.log = (...args) => logOutput.push(args.join(' '));
  console.error = (...args) => errorOutput.push(args.join(' '));
  
  // Mock the TokenTracker to avoid actual API calls
  const TokenTracker = require('../lib/token-tracker');
  const originalTrackTokens = TokenTracker.prototype.trackTokens;
  TokenTracker.prototype.trackTokens = async (issue, model, tokens) => ({
    issueNumber: parseInt(issue),
    model,
    tokens: parseInt(tokens),
    success: true
  });
  
  try {
    await main(['123', 'Claude 3.5 Sonnet', '5000']);
  } catch (e) {
    // Expected if process.exit was called
  }
  
  // Restore
  process.exit = originalExit;
  console.log = originalLog;
  console.error = originalError;
  TokenTracker.prototype.trackTokens = originalTrackTokens;
  
  assert.strictEqual(exitCode, null); // Should not exit on success
  assert.ok(logOutput.some(line => line.includes('✅ Updated issue #123')));
});

test('main function with invalid arguments', async () => {
  // Mock process.exit
  const originalExit = process.exit;
  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
    throw new Error(`Process.exit(${code})`);
  };
  
  // Capture console output
  const originalError = console.error;
  let errorOutput = [];
  console.error = (...args) => errorOutput.push(args.join(' '));
  
  try {
    await main([]);
  } catch (e) {
    // Expected from process.exit
  }
  
  // Restore
  process.exit = originalExit;
  console.error = originalError;
  
  assert.strictEqual(exitCode, 1);
  assert.ok(errorOutput.some(line => line.includes('Usage:')));
});