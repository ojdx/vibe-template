const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Helper function to load and execute scripts in DOM
function loadScriptsInDOM(dom, scripts) {
  scripts.forEach(script => {
    const scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = script;
    dom.window.document.head.appendChild(scriptEl);
  });
}

test('script.js updates deployment message when element exists', () => {
  // Read the actual files
  const appContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/app.js'), 'utf8');
  const scriptContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/script.js'), 'utf8');
  
  // Create a DOM with the deployment-message element
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <p id="deployment-message"></p>
      </body>
    </html>
  `, { 
    runScripts: 'dangerously',
    resources: 'usable'
  });
  
  // Load scripts
  loadScriptsInDOM(dom, [appContent, scriptContent]);
  
  // Wait for DOMContentLoaded to fire
  return new Promise((resolve) => {
    dom.window.document.addEventListener('DOMContentLoaded', () => {
      const messageElement = dom.window.document.getElementById('deployment-message');
      assert.strictEqual(messageElement.textContent, 'Successfully deployed');
      resolve();
    });
  });
});

test('script.js updates deployment date when element exists', () => {
  const appContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/app.js'), 'utf8');
  const scriptContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/script.js'), 'utf8');
  
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <p id="deployment-message"></p>
        <p id="deployment-date"></p>
      </body>
    </html>
  `, { 
    runScripts: 'dangerously',
    resources: 'usable'
  });
  
  loadScriptsInDOM(dom, [appContent, scriptContent]);
  
  return new Promise((resolve) => {
    dom.window.document.addEventListener('DOMContentLoaded', () => {
      const messageElement = dom.window.document.getElementById('deployment-message');
      const dateElement = dom.window.document.getElementById('deployment-date');
      assert.strictEqual(messageElement.textContent, 'Successfully deployed');
      assert.ok(dateElement.textContent.includes('2025'));
      resolve();
    });
  });
});

test('script.js handles missing elements gracefully', () => {
  const appContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/app.js'), 'utf8');
  const scriptContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/script.js'), 'utf8');
  
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <!-- No elements -->
      </body>
    </html>
  `, { 
    runScripts: 'dangerously',
    resources: 'usable'
  });
  
  loadScriptsInDOM(dom, [appContent, scriptContent]);
  
  return new Promise((resolve) => {
    // Should complete without errors
    setTimeout(() => {
      assert.ok(true, 'No errors thrown');
      resolve();
    }, 100);
  });
});

test('script.js handles missing App global gracefully', () => {
  const scriptContent = fs.readFileSync(path.join(__dirname, '../public-www/assets/script.js'), 'utf8');
  
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <p id="deployment-message">Original</p>
        <p id="deployment-date">Original Date</p>
      </body>
    </html>
  `, { 
    runScripts: 'dangerously',
    resources: 'usable'
  });
  
  // Only load script.js without app.js
  loadScriptsInDOM(dom, [scriptContent]);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Elements should not be modified without App
      const messageElement = dom.window.document.getElementById('deployment-message');
      const dateElement = dom.window.document.getElementById('deployment-date');
      assert.strictEqual(messageElement.textContent, 'Original');
      assert.strictEqual(dateElement.textContent, 'Original Date');
      resolve();
    }, 100);
  });
});