#!/usr/bin/env node

/**
 * Generate deployment information to be embedded in the HTML
 */

const fs = require('fs');
const path = require('path');

function generateDeploymentInfo() {
  const deploymentTime = new Date().toISOString();
  const branch = process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'unknown';
  const commitSha = process.env.GITHUB_SHA || 'local';
  const runId = process.env.GITHUB_RUN_ID || 'local';
  const runNumber = process.env.GITHUB_RUN_NUMBER || 'local';
  const environment = branch === 'main' ? 'production' : (branch === 'dev' ? 'development' : 'feature');
  
  const deploymentInfo = {
    timestamp: deploymentTime,
    branch: branch,
    commit: commitSha.substring(0, 7),
    environment: environment,
    runId: runId,
    runNumber: runNumber,
    deployedBy: process.env.GITHUB_ACTOR || 'local'
  };
  
  return deploymentInfo;
}

function injectDeploymentInfo(htmlPath, deploymentInfo) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Create the deployment script
  const deploymentScript = `
  <script id="deployment-info">
    // Deployment Information
    window.__DEPLOYMENT_INFO__ = ${JSON.stringify(deploymentInfo, null, 2)};
    
    // Log deployment info to console
    console.group('🚀 Deployment Information');
    console.log('Environment:', window.__DEPLOYMENT_INFO__.environment);
    console.log('Branch:', window.__DEPLOYMENT_INFO__.branch);
    console.log('Commit:', window.__DEPLOYMENT_INFO__.commit);
    console.log('Deployed:', new Date(window.__DEPLOYMENT_INFO__.timestamp).toLocaleString());
    console.log('Deployed By:', window.__DEPLOYMENT_INFO__.deployedBy);
    console.log('Run ID:', window.__DEPLOYMENT_INFO__.runId);
    console.log('Run Number:', window.__DEPLOYMENT_INFO__.runNumber);
    console.groupEnd();
  </script>`;
  
  // Inject before closing body tag
  const updatedHtml = htmlContent.replace('</body>', `${deploymentScript}\n</body>`);
  
  // Write the updated HTML
  fs.writeFileSync(htmlPath, updatedHtml);
  
  return deploymentInfo;
}

function main() {
  const args = process.argv.slice(2);
  const htmlPath = args[0] || path.join(__dirname, '../public-www/index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`Error: HTML file not found at ${htmlPath}`);
    process.exit(1);
  }
  
  try {
    const deploymentInfo = generateDeploymentInfo();
    injectDeploymentInfo(htmlPath, deploymentInfo);
    
    console.log('✅ Deployment info injected successfully:');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Output for GitHub Actions
    if (process.env.GITHUB_ACTIONS && process.env.GITHUB_OUTPUT) {
      const fs = require('fs');
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `deployment-info=${JSON.stringify(deploymentInfo)}\n`);
    }
  } catch (error) {
    console.error('❌ Error injecting deployment info:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = { generateDeploymentInfo, injectDeploymentInfo };
}