const test = require('node:test');
const assert = require('node:assert');
const { formatTokenCount, calculateCost } = require('../lib/utils');

test('formatTokenCount formats numbers with commas', () => {
  assert.strictEqual(formatTokenCount(1000), '1,000');
  assert.strictEqual(formatTokenCount(1000000), '1,000,000');
  assert.strictEqual(formatTokenCount(123), '123');
});

test('calculateCost calculates token costs correctly', () => {
  // Test Claude 3.5 Sonnet (default)
  assert.strictEqual(calculateCost(1000), 0.003);
  assert.strictEqual(calculateCost(1000, 'Claude 3.5 Sonnet'), 0.003);
  
  // Test Claude 3 Opus
  assert.strictEqual(calculateCost(1000, 'Claude 3 Opus'), 0.015);
  
  // Test GPT-4
  assert.strictEqual(calculateCost(1000, 'GPT-4'), 0.03);
  
  // Test unknown model (uses default rate)
  assert.strictEqual(calculateCost(1000, 'Unknown Model'), 0.003);
});

test('calculateCost handles large token counts', () => {
  assert.strictEqual(calculateCost(1000000, 'Claude 3 Opus'), 15);
  assert.strictEqual(calculateCost(1000000, 'GPT-4'), 30);
});

test('formatTokenCount throws on invalid input', () => {
  assert.throws(() => formatTokenCount('not a number'), TypeError);
  assert.throws(() => formatTokenCount(null), TypeError);
  assert.throws(() => formatTokenCount(undefined), TypeError);
});

test('calculateCost throws on invalid input', () => {
  assert.throws(() => calculateCost('not a number'), TypeError);
  assert.throws(() => calculateCost(null), TypeError);
  assert.throws(() => calculateCost(-100), RangeError);
});