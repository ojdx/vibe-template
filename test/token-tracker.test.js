const test = require('node:test');
const assert = require('node:assert');
const TokenTracker = require('../lib/token-tracker');

// Mock execSync function
function createMockExec(responses = {}) {
  return (command) => {
    if (command.includes('project item-list')) {
      return responses.items || JSON.stringify({ items: [] });
    }
    if (command.includes('fields(first: 30)')) {
      return responses.fields || JSON.stringify({
        data: {
          node: {
            fields: {
              nodes: []
            }
          }
        }
      });
    }
    if (command.includes('updateProjectV2ItemFieldValue')) {
      return responses.update || '{"data":{}}';
    }
    if (command.includes('gh issue comment')) {
      return responses.comment || '';
    }
    return '';
  };
}

test('TokenTracker.validateInput validates correct input', () => {
  const tracker = new TokenTracker();
  const result = tracker.validateInput('123', 'Claude 3.5 Sonnet', '5000');
  
  assert.strictEqual(result.issueNumber, 123);
  assert.strictEqual(result.model, 'Claude 3.5 Sonnet');
  assert.strictEqual(result.tokens, 5000);
});

test('TokenTracker.validateInput throws on missing parameters', () => {
  const tracker = new TokenTracker();
  
  assert.throws(() => {
    tracker.validateInput('', 'model', '1000');
  }, /Missing required parameters/);
  
  assert.throws(() => {
    tracker.validateInput('123', '', '1000');
  }, /Missing required parameters/);
  
  assert.throws(() => {
    tracker.validateInput('123', 'model', '');
  }, /Missing required parameters/);
});

test('TokenTracker.validateInput throws on invalid issue number', () => {
  const tracker = new TokenTracker();
  
  assert.throws(() => {
    tracker.validateInput('abc', 'model', '1000');
  }, /Issue number must be a positive integer/);
  
  assert.throws(() => {
    tracker.validateInput('-5', 'model', '1000');
  }, /Issue number must be a positive integer/);
});

test('TokenTracker.validateInput throws on invalid token count', () => {
  const tracker = new TokenTracker();
  
  assert.throws(() => {
    tracker.validateInput('123', 'model', 'abc');
  }, /Token count must be a positive integer/);
  
  assert.throws(() => {
    tracker.validateInput('123', 'model', '-100');
  }, /Token count must be a positive integer/);
});

test('TokenTracker.getProjectItems parses project items', () => {
  const mockItems = {
    items: [
      { id: 'item1', content: { number: 123 } },
      { id: 'item2', content: { number: 456 } }
    ]
  };
  
  const mockExec = createMockExec({ items: JSON.stringify(mockItems) });
  const tracker = new TokenTracker(mockExec);
  
  const items = tracker.getProjectItems();
  assert.strictEqual(items.length, 2);
  assert.strictEqual(items[0].content.number, 123);
});

test('TokenTracker.findIssueItem finds correct issue', () => {
  const tracker = new TokenTracker();
  const items = [
    { id: 'item1', content: { number: 123 } },
    { id: 'item2', content: { number: 456 } }
  ];
  
  const item = tracker.findIssueItem(items, 456);
  assert.strictEqual(item.id, 'item2');
});

test('TokenTracker.findIssueItem throws when issue not found', () => {
  const tracker = new TokenTracker();
  const items = [
    { id: 'item1', content: { number: 123 } }
  ];
  
  assert.throws(() => {
    tracker.findIssueItem(items, 999);
  }, /Issue #999 not found in project/);
});

test('TokenTracker.findRequiredFields finds all fields', () => {
  const tracker = new TokenTracker();
  const fields = [
    { id: 'f1', name: 'Tokens Used' },
    { 
      id: 'f2', 
      name: 'Model',
      options: [
        { id: 'opt1', name: 'Claude 3.5 Sonnet' },
        { id: 'opt2', name: 'GPT-4' }
      ]
    }
  ];
  
  const result = tracker.findRequiredFields(fields, 'Claude 3.5 Sonnet');
  assert.strictEqual(result.tokensField.id, 'f1');
  assert.strictEqual(result.modelField.id, 'f2');
  assert.strictEqual(result.modelOption.id, 'opt1');
});

test('TokenTracker.findRequiredFields throws when fields missing', () => {
  const tracker = new TokenTracker();
  const fields = [
    { id: 'f1', name: 'Other Field' }
  ];
  
  assert.throws(() => {
    tracker.findRequiredFields(fields, 'Claude 3.5 Sonnet');
  }, /Required fields not found in project/);
});

test('TokenTracker.trackTokens completes full flow', async () => {
  const mockResponses = {
    items: JSON.stringify({
      items: [{ id: 'item1', content: { number: 123 } }]
    }),
    fields: JSON.stringify({
      data: {
        node: {
          fields: {
            nodes: [
              { id: 'f1', name: 'Tokens Used' },
              { 
                id: 'f2', 
                name: 'Model',
                options: [
                  { id: 'opt1', name: 'Claude 3.5 Sonnet' }
                ]
              }
            ]
          }
        }
      }
    }),
    update: '{"data":{}}',
    comment: ''
  };
  
  const mockExec = createMockExec(mockResponses);
  const tracker = new TokenTracker(mockExec);
  
  const result = await tracker.trackTokens('123', 'Claude 3.5 Sonnet', '5000');
  
  assert.strictEqual(result.issueNumber, 123);
  assert.strictEqual(result.model, 'Claude 3.5 Sonnet');
  assert.strictEqual(result.tokens, 5000);
  assert.strictEqual(result.success, true);
});

test('TokenTracker.trackTokens handles errors gracefully', async () => {
  const mockExec = () => {
    throw new Error('Command failed');
  };
  
  const tracker = new TokenTracker(mockExec);
  
  await assert.rejects(async () => {
    await tracker.trackTokens('123', 'Claude 3.5 Sonnet', '5000');
  }, /Command failed/);
});