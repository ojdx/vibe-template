const test = require('node:test');
const assert = require('node:assert');
const App = require('../public-www/assets/app.js');

test('App.getDeploymentMessage returns correct message', () => {
  const message = App.getDeploymentMessage();
  assert.strictEqual(message, 'Successfully deployed');
});

test('App.getMessage returns correct messages by type', () => {
  assert.strictEqual(App.getMessage('deployment'), 'Successfully deployed');
  assert.strictEqual(App.getMessage('error'), 'An error occurred');
  assert.strictEqual(App.getMessage('loading'), 'Loading...');
  assert.strictEqual(App.getMessage('unknown'), '');
});

test('App.formatDate formats date correctly', () => {
  // Use UTC to avoid timezone issues
  const testDate = new Date(Date.UTC(2025, 4, 24)); // May is month 4 (0-indexed)
  const formatted = App.formatDate(testDate);
  // Check that it contains the expected parts
  assert.ok(formatted.includes('May'));
  assert.ok(formatted.includes('2025'));
});

test('App.formatDate uses current date by default', () => {
  const formatted = App.formatDate();
  assert.ok(formatted.includes('2025'));
  assert.ok(formatted.match(/\w+ \d{1,2}, \d{4}/));
});

test('App.init sets configuration', () => {
  const config = App.init({ autoRefresh: true, refreshInterval: 5000 });
  assert.strictEqual(config.autoRefresh, true);
  assert.strictEqual(config.refreshInterval, 5000);
});

test('App.init uses default configuration', () => {
  const config = App.init();
  assert.strictEqual(config.autoRefresh, false);
  assert.strictEqual(config.refreshInterval, 30000);
});

test('App.init merges partial configuration', () => {
  const config = App.init({ autoRefresh: true });
  assert.strictEqual(config.autoRefresh, true);
  assert.strictEqual(config.refreshInterval, 30000);
});