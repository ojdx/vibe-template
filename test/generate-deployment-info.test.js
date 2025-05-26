const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { generateDeploymentInfo, injectDeploymentInfo } = require('../scripts/generate-deployment-info');

describe('Deployment Info Generator', () => {
  const testHtmlPath = path.join(__dirname, 'test-index.html');
  const originalHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <h1>Test Page</h1>
</body>
</html>`;

  beforeEach(() => {
    // Store original env vars
    this.originalEnv = {
      BRANCH_NAME: process.env.BRANCH_NAME,
      GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
      GITHUB_SHA: process.env.GITHUB_SHA,
      GITHUB_RUN_ID: process.env.GITHUB_RUN_ID,
      GITHUB_RUN_NUMBER: process.env.GITHUB_RUN_NUMBER,
      GITHUB_ACTOR: process.env.GITHUB_ACTOR
    };
    
    // Clear environment variables for clean test state
    delete process.env.BRANCH_NAME;
    delete process.env.GITHUB_REF_NAME;
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_RUN_ID;
    delete process.env.GITHUB_RUN_NUMBER;
    delete process.env.GITHUB_ACTOR;
    
    // Create test HTML file
    fs.writeFileSync(testHtmlPath, originalHtml);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testHtmlPath)) {
      fs.unlinkSync(testHtmlPath);
    }
    // Restore original environment variables
    if (this.originalEnv) {
      Object.keys(this.originalEnv).forEach(key => {
        if (this.originalEnv[key] !== undefined) {
          process.env[key] = this.originalEnv[key];
        } else {
          delete process.env[key];
        }
      });
    }
  });

  describe('generateDeploymentInfo', () => {
    it('should generate deployment info with default values', () => {
      const info = generateDeploymentInfo();
      
      assert.strictEqual(typeof info.timestamp, 'string');
      assert.strictEqual(info.branch, 'unknown');
      assert.strictEqual(info.commit, 'local');
      assert.strictEqual(info.environment, 'feature');
      assert.strictEqual(info.runId, 'local');
      assert.strictEqual(info.runNumber, 'local');
      assert.strictEqual(info.deployedBy, 'local');
    });

    it('should use environment variables when available', () => {
      process.env.BRANCH_NAME = 'feature/test-branch';
      process.env.GITHUB_SHA = 'abc123def456789';
      process.env.GITHUB_RUN_ID = '12345';
      process.env.GITHUB_RUN_NUMBER = '42';
      process.env.GITHUB_ACTOR = 'testuser';

      const info = generateDeploymentInfo();
      
      assert.strictEqual(info.branch, 'feature/test-branch');
      assert.strictEqual(info.commit, 'abc123d');
      assert.strictEqual(info.environment, 'feature');
      assert.strictEqual(info.runId, '12345');
      assert.strictEqual(info.runNumber, '42');
      assert.strictEqual(info.deployedBy, 'testuser');
    });

    it('should identify production environment for main branch', () => {
      process.env.BRANCH_NAME = 'main';
      const info = generateDeploymentInfo();
      assert.strictEqual(info.environment, 'production');
    });

    it('should identify development environment for dev branch', () => {
      process.env.BRANCH_NAME = 'dev';
      const info = generateDeploymentInfo();
      assert.strictEqual(info.environment, 'development');
    });

    it('should use GITHUB_REF_NAME if BRANCH_NAME is not set', () => {
      process.env.GITHUB_REF_NAME = 'alternate-branch';
      const info = generateDeploymentInfo();
      assert.strictEqual(info.branch, 'alternate-branch');
    });
  });

  describe('injectDeploymentInfo', () => {
    it('should inject deployment script into HTML', () => {
      const deploymentInfo = {
        timestamp: '2025-05-25T12:00:00Z',
        branch: 'test-branch',
        commit: 'abc123',
        environment: 'feature',
        runId: '123',
        runNumber: '10',
        deployedBy: 'tester'
      };

      injectDeploymentInfo(testHtmlPath, deploymentInfo);
      
      const updatedHtml = fs.readFileSync(testHtmlPath, 'utf8');
      
      // Check that deployment script was injected
      assert(updatedHtml.includes('window.__DEPLOYMENT_INFO__'));
      assert(updatedHtml.includes('<script id="deployment-info">'));
      assert(updatedHtml.includes(deploymentInfo.branch));
      assert(updatedHtml.includes(deploymentInfo.commit));
      assert(updatedHtml.includes('console.group'));
      assert(updatedHtml.includes('🚀 Deployment Information'));
    });

    it('should place deployment script before closing body tag', () => {
      const deploymentInfo = generateDeploymentInfo();
      injectDeploymentInfo(testHtmlPath, deploymentInfo);
      
      const updatedHtml = fs.readFileSync(testHtmlPath, 'utf8');
      const scriptIndex = updatedHtml.indexOf('<script id="deployment-info">');
      const bodyCloseIndex = updatedHtml.lastIndexOf('</body>');
      
      assert(scriptIndex > 0, 'Deployment script should exist');
      assert(scriptIndex < bodyCloseIndex, 'Script should be before closing body tag');
    });

    it('should preserve original HTML structure', () => {
      const deploymentInfo = generateDeploymentInfo();
      injectDeploymentInfo(testHtmlPath, deploymentInfo);
      
      const updatedHtml = fs.readFileSync(testHtmlPath, 'utf8');
      
      // Check that original content is preserved
      assert(updatedHtml.includes('<title>Test</title>'));
      assert(updatedHtml.includes('<h1>Test Page</h1>'));
      assert(updatedHtml.includes('<!DOCTYPE html>'));
    });

    it('should create valid JSON in deployment info', () => {
      const deploymentInfo = generateDeploymentInfo();
      injectDeploymentInfo(testHtmlPath, deploymentInfo);
      
      const updatedHtml = fs.readFileSync(testHtmlPath, 'utf8');
      
      // Extract the JSON from the script
      const jsonMatch = updatedHtml.match(/window\.__DEPLOYMENT_INFO__ = ({[\s\S]*?});/);
      assert(jsonMatch, 'Should find deployment info JSON');
      
      // Should not throw when parsing
      assert.doesNotThrow(() => {
        JSON.parse(jsonMatch[1]);
      });
    });
  });

  describe('Script execution', () => {
    it('should handle missing HTML file gracefully', async () => {
      const nonExistentPath = path.join(__dirname, 'non-existent.html');
      const scriptPath = path.join(__dirname, '../scripts/generate-deployment-info.js');
      
      // Use child_process to test the script's exit behavior
      const { spawn } = require('child_process');
      
      await new Promise((resolve) => {
        const proc = spawn('node', [scriptPath, nonExistentPath]);
        let stderr = '';
        
        proc.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        proc.on('close', (code) => {
          assert.strictEqual(code, 1, 'Should exit with code 1');
          assert(stderr.includes('Error: HTML file not found'), 'Should show error message');
          resolve();
        });
      });
    });
  });
});