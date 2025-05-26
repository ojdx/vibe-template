const test = require('node:test');
const assert = require('node:assert');
const { updateDeploymentInfo } = require('../public-www/assets/script.js');
const App = require('../public-www/assets/app.js');

test('updateDeploymentInfo updates deployment message', () => {
  // Create a mock element that can be updated
  const messageElement = { textContent: '' };
  
  const mockDoc = {
    getElementById: (id) => {
      if (id === 'deployment-message') {
        return messageElement;
      }
      return null;
    }
  };
  
  const result = updateDeploymentInfo(mockDoc, App);
  assert.strictEqual(result, true);
  assert.strictEqual(messageElement.textContent, 'Successfully deployed');
});

test('updateDeploymentInfo updates deployment date', () => {
  // Create a mock element that can be updated
  const dateElement = { textContent: '' };
  
  const mockDoc = {
    getElementById: (id) => {
      if (id === 'deployment-date') {
        return dateElement;
      }
      return null;
    }
  };
  
  const result = updateDeploymentInfo(mockDoc, App);
  assert.strictEqual(result, true);
  assert.ok(dateElement.textContent.includes('2025'));
});

test('updateDeploymentInfo updates both elements', () => {
  const elements = {
    'deployment-message': { textContent: '' },
    'deployment-date': { textContent: '' }
  };
  
  const mockDoc = {
    getElementById: (id) => elements[id] || null
  };
  
  const result = updateDeploymentInfo(mockDoc, App);
  assert.strictEqual(result, true);
  assert.strictEqual(elements['deployment-message'].textContent, 'Successfully deployed');
  assert.ok(elements['deployment-date'].textContent.includes('2025'));
});

test('updateDeploymentInfo returns false when no document', () => {
  const result = updateDeploymentInfo(null, App);
  assert.strictEqual(result, false);
});

test('updateDeploymentInfo returns false when no app instance', () => {
  const mockDoc = {
    getElementById: () => ({ textContent: '' })
  };
  
  const result = updateDeploymentInfo(mockDoc, null);
  assert.strictEqual(result, false);
});

test('updateDeploymentInfo returns false when no elements found', () => {
  const mockDoc = {
    getElementById: () => null
  };
  
  const result = updateDeploymentInfo(mockDoc, App);
  assert.strictEqual(result, false);
});