# Scripts Directory

This directory contains utility scripts for the elmersho project.

## Available Scripts

### track-tokens.js

**Purpose**: Track AI token usage for GitHub issues in the project board.

**Usage**:
```bash
npm run track-tokens <issue-number> "<model-name>" <token-count>

# Example:
npm run track-tokens 42 "Claude 3.5 Sonnet" 5000
```

**Requirements**:
- GitHub CLI (`gh`) installed and authenticated
- Project access permissions
- Valid issue number in the repository

**How it works**:
1. Validates input parameters
2. Updates the GitHub project fields for the issue
3. Adds a comment to the issue with token usage details

### diagram-utils.js

**Purpose**: Utilities for managing draw.io diagrams in the project.

**Usage**:
```bash
# Generate embed code for a diagram
npm run diagram embed <path/to/diagram.drawio> [branch]

# Create a catalog of all diagrams in a directory
npm run diagram catalog [directory]

# Extract metadata from a diagram
npm run diagram metadata <path/to/diagram.drawio>
```

**Features**:
- Generates markdown embed code with draw.io edit links
- Creates catalogs of diagram collections
- Extracts diagram metadata (page count, size, etc.)
- Branch-aware links (shows current branch + stable branches)

### setup-wiki.sh

**Purpose**: Initialize the GitHub wiki with project documentation.

**Usage**:
```bash
./scripts/setup-wiki.sh
```

**Prerequisites**:
1. Wiki must be enabled in repository settings
2. Initial page must be created through GitHub web interface
3. Git must be configured with push access

**What it does**:
1. Clones the wiki repository
2. Creates initial documentation pages
3. Sets up diagram storage structure
4. Pushes content to the wiki

## Script Development Guidelines

When creating new scripts:

1. **Add shebang line**: `#!/usr/bin/env node` for Node.js scripts
2. **Make executable**: `chmod +x script-name.js`
3. **Add to package.json**: Create an npm script for easy access
4. **Document usage**: Include help text or `--help` option
5. **Handle errors**: Provide clear error messages
6. **Add tests**: Create corresponding test files in `/test/`

## Environment Variables

Scripts may use these environment variables:

- `GITHUB_TOKEN`: For authenticated GitHub API access
- `GITHUB_OWNER`: Repository owner (default: ojdx-org)
- `GITHUB_REPO`: Repository name (default: elmersho)
- `GITHUB_PROJECT_NUMBER`: Project board number (default: 1)

See `.env.example` for configuration details.