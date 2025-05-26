#!/usr/bin/env node

/**
 * Utility functions for working with draw.io diagrams
 * This script helps prepare diagrams for use in documentation
 */

const fs = require('fs');
const path = require('path');


/**
 * Get current git branch
 * @returns {string} Current branch name
 */
function getCurrentBranch() {
  const { execSync } = require('child_process');
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'dev';
  }
}

/**
 * Generate markdown embed code for a draw.io diagram
 * @param {string} diagramPath - Path to the .drawio file
 * @param {string} branch - Git branch name (defaults to current branch)
 * @returns {string} Markdown code for embedding
 */
function generateEmbedCode(diagramPath, branch = null) {
  const diagramName = path.basename(diagramPath);
  const relativePath = diagramPath.includes('docs/diagrams/') 
    ? diagramPath.substring(diagramPath.indexOf('docs/diagrams/'))
    : `docs/diagrams/${diagramName}`;
  
  const currentBranch = branch || getCurrentBranch();
  const isFeatureBranch = currentBranch !== 'main' && currentBranch !== 'dev';
  
  let embedCode = `### ${diagramName.replace('.drawio', '')}\n\n`;
  
  // Always show current branch link
  const editUrl = `https://app.diagrams.net/#Hojdx-org%2Felmersho%2F${currentBranch}%2F${relativePath.replace(/\//g, '%2F')}`;
  const githubUrl = `https://github.com/ojdx-org/elmersho/blob/${currentBranch}/${relativePath}`;
  
  if (isFeatureBranch) {
    embedCode += `**Current Branch (${currentBranch}):**\n`;
  }
  embedCode += `[Edit in draw.io](${editUrl}) | [View on GitHub](${githubUrl})\n`;
  
  // Add stable branch links if on feature branch
  if (isFeatureBranch) {
    embedCode += `\n**Stable Versions:**\n`;
    
    // Check and add dev link
    const devEditUrl = `https://app.diagrams.net/#Hojdx-org%2Felmersho%2Fdev%2F${relativePath.replace(/\//g, '%2F')}`;
    const devGithubUrl = `https://github.com/ojdx-org/elmersho/blob/dev/${relativePath}`;
    embedCode += `- Dev: [Edit](${devEditUrl}) | [View](${devGithubUrl})\n`;
    
    // Check and add main link
    const mainEditUrl = `https://app.diagrams.net/#Hojdx-org%2Felmersho%2Fmain%2F${relativePath.replace(/\//g, '%2F')}`;
    const mainGithubUrl = `https://github.com/ojdx-org/elmersho/blob/main/${relativePath}`;
    embedCode += `- Main: [Edit](${mainEditUrl}) | [View](${mainGithubUrl})\n`;
    
    embedCode += `\n*Note: This diagram is on a feature branch. Links to dev/main shown if diagram exists there.*\n`;
  }
  
  embedCode += `
> To edit this diagram:
> 1. Click the "Edit in draw.io" link above
> 2. The diagram will open directly in draw.io
> 3. Make your changes and save
> 4. Create a pull request with your changes
`;
  
  return embedCode;
}

/**
 * Create a catalog of all diagrams in a directory
 * @param {string} diagramsDir - Directory containing .drawio files
 * @returns {string} Markdown catalog of diagrams
 * @throws {Error} If directory cannot be read
 */
function createDiagramCatalog(diagramsDir) {
  try {
    const files = fs.readdirSync(diagramsDir).filter(f => f.endsWith('.drawio'));
    
    let catalog = '# Diagram Catalog\n\n';
    catalog += 'This catalog lists all available draw.io diagrams.\n\n';
    
    files.forEach(file => {
      const filePath = path.join(diagramsDir, file);
      catalog += generateEmbedCode(filePath);
      catalog += '\n---\n\n';
    });
    
    return catalog;
  } catch (error) {
    throw new Error(`Failed to create catalog from ${diagramsDir}: ${error.message}`);
  }
}

/**
 * Extract diagram metadata from draw.io XML
 * @param {string} xmlPath - Path to .drawio file
 * @returns {object} Metadata object
 * @throws {Error} If file cannot be read
 */
function extractDiagramMetadata(xmlPath) {
  try {
    const content = fs.readFileSync(xmlPath, 'utf8');
    const stats = fs.statSync(xmlPath);
    
    // Basic parsing - in production, use proper XML parser
    const metadata = {
      name: path.basename(xmlPath, '.drawio'),
      hasCompressedData: content.includes('compressed="true"'),
      pageCount: (content.match(/<diagram/g) || []).length,
      fileSize: stats.size
    };
    
    return metadata;
  } catch (error) {
    throw new Error(`Failed to extract metadata from ${xmlPath}: ${error.message}`);
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'embed':
      if (!arg) {
        console.error('Usage: node diagram-utils.js embed <diagram.drawio> [branch]');
        process.exit(1);
      }
      const branch = process.argv[4] || null;
      console.log(generateEmbedCode(arg, branch));
      break;
      
    case 'catalog':
      const dir = arg || './diagrams';
      if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        process.exit(1);
      }
      console.log(createDiagramCatalog(dir));
      break;
      
    case 'metadata':
      if (!arg) {
        console.error('Usage: node diagram-utils.js metadata <diagram.drawio>');
        process.exit(1);
      }
      console.log(JSON.stringify(extractDiagramMetadata(arg), null, 2));
      break;
      
    default:
      console.log(`
draw.io Diagram Utilities

Commands:
  embed <diagram.drawio> [branch]    Generate markdown embed code (default branch: dev)
  catalog [directory]                Create catalog of all diagrams
  metadata <diagram.drawio>          Extract diagram metadata

Examples:
  node diagram-utils.js embed ./docs/diagrams/architecture.drawio
  node diagram-utils.js embed ./docs/diagrams/architecture.drawio main
  node diagram-utils.js catalog ./docs/diagrams
  node diagram-utils.js metadata ./docs/diagrams/architecture.drawio
      `);
  }
}

module.exports = {
  generateEmbedCode,
  createDiagramCatalog,
  extractDiagramMetadata,
  getCurrentBranch
};