const test = require('node:test');
const assert = require('node:assert');

test('simple math test', () => {
  assert.strictEqual(2 + 2, 4);
});

test('string test', () => {
  const greeting = 'Hello, World!';
  assert.strictEqual(greeting.length, 13);
  assert.ok(greeting.includes('World'));
});

test('async test example', async () => {
  const promise = Promise.resolve('success');
  const result = await promise;
  assert.strictEqual(result, 'success');
});