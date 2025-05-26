#!/bin/bash

# Script to set up the elmersho wiki with initial content
# Run this after creating the wiki through GitHub web interface

echo "elmersho Wiki Setup Script"
echo "========================="
echo ""
echo "This script will help you set up the wiki with initial content."
echo ""
echo "Prerequisites:"
echo "1. Go to https://github.com/ojdx-org/elmersho/wiki"
echo "2. Click 'Create the first page' button"
echo "3. Create a simple Home page with any content"
echo "4. Save the page"
echo ""
read -p "Have you created the initial wiki page? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the initial wiki page first, then run this script again."
    exit 1
fi

# Clone the wiki
echo "Cloning wiki repository..."
if [ -d "elmersho.wiki" ]; then
    echo "Wiki directory already exists. Pulling latest changes..."
    cd elmersho.wiki
    git pull
    cd ..
else
    git clone https://github.com/ojdx-org/elmersho.wiki.git
fi

cd elmersho.wiki

# Create diagrams directory
echo "Creating diagrams directory..."
mkdir -p diagrams

# Copy the local-dev-architecture diagram
echo "Copying example diagram..."
cp ../docs/diagrams/local-dev-architecture.drawio diagrams/

# Create Home page
echo "Creating Home.md..."
cat > Home.md << 'EOF'
# elmersho Wiki

Welcome to the elmersho project wiki!

## Quick Links

- [Architecture Diagrams](Architecture-Diagrams) - View and edit project diagrams
- [Development Guide](Development-Guide) - How to work with the codebase
- [Testing Guide](Testing-Guide) - Testing and coverage information

## Project Overview

elmersho is a minimal Node.js project focusing on:
- Zero production dependencies
- Comprehensive test coverage
- AI-assisted development tracking
- Clean architecture with diagrams

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ojdx-org/elmersho.git
cd elmersho

# Install dev dependencies
npm install

# Run development server
npm run dev

# Run tests with coverage
npm run test:coverage
```

## Documentation

- [README](https://github.com/ojdx-org/elmersho#readme) - Main project documentation
- [Using draw.io Diagrams](https://github.com/ojdx-org/elmersho/blob/dev/docs/using-drawio-diagrams.md)
- [Wiki Setup Guide](https://github.com/ojdx-org/elmersho/blob/dev/docs/wiki-setup-guide.md)
EOF

# Create Architecture Diagrams page
echo "Creating Architecture-Diagrams.md..."
cat > Architecture-Diagrams.md << 'EOF'
# Architecture Diagrams

This page contains all architectural diagrams for the elmersho project. All diagrams are created using draw.io and can be edited directly.

## Local Development Architecture

[Edit in draw.io](https://app.diagrams.net/#Uhttps://raw.githubusercontent.com/wiki/ojdx-org/elmersho/diagrams/local-dev-architecture.drawio)

**Description**: Shows the local development server setup with hot-reloading capabilities.

**Components**:
- Developer Browser
- Node.js Server (server.js)
- File Watcher
- Public WWW directory
- Server-Sent Events for hot reloading

## How to Use These Diagrams

1. Click the "Edit in draw.io" link
2. Make your changes in the draw.io editor
3. File > Export as > XML to save the .drawio file
4. Upload the updated file to this wiki

## Creating New Diagrams

1. Use the templates from the [main repository](https://github.com/ojdx-org/elmersho/blob/dev/docs/diagram-templates.md)
2. Save as .drawio format
3. Upload to the `diagrams/` folder in this wiki
4. Add a link on this page

## Diagram Standards

- Use consistent colors (see style guide)
- Include clear labels on all components
- Add descriptions for complex flows
- Keep diagrams focused on a single aspect
EOF

# Create Development Guide page
echo "Creating Development-Guide.md..."
cat > Development-Guide.md << 'EOF'
# Development Guide

## Development Workflow

1. Create feature branch from `dev`
2. Make changes and test
3. Create PR to `dev`
4. After review, merge to `dev`
5. Periodically, `dev` is merged to `main`

## Available Commands

```bash
npm run dev              # Start development server with hot-reloading
npm run test            # Run tests
npm run test:coverage   # Run tests with coverage report
npm run track-tokens    # Track AI token usage
npm run diagram         # Diagram utilities
```

## Project Structure

```
elmersho/
├── public-www/         # Static files served by dev server
│   ├── index.html
│   └── assets/
│       ├── app.js     # Application logic
│       └── script.js  # DOM manipulation
├── lib/               # Library code
│   └── token-tracker.js
├── scripts/           # Utility scripts
│   ├── track-tokens.js
│   └── diagram-utils.js
├── test/              # Test files
└── docs/              # Documentation
```

## Testing

- Uses Node.js built-in test runner
- Coverage via c8
- Target: 80% coverage minimum
- Run `npm run test:coverage:check` before committing
EOF

# Create Testing Guide page
echo "Creating Testing-Guide.md..."
cat > Testing-Guide.md << 'EOF'
# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage:html

# Check coverage thresholds
npm run test:coverage:check
```

## Writing Tests

Tests use Node.js built-in test runner:

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('MyFeature', () => {
  it('should work correctly', () => {
    assert.strictEqual(myFunction(), expectedResult);
  });
});
```

## Coverage Requirements

- Minimum 80% coverage for:
  - Lines
  - Functions  
  - Branches

## Testing Best Practices

1. Test file names should match source files (e.g., `app.test.js` for `app.js`)
2. Use descriptive test names
3. Test both success and error cases
4. Mock external dependencies
5. Keep tests focused and isolated
EOF

# Add and commit
echo "Adding files to git..."
git add .

echo "Committing initial wiki content..."
git commit -m "Initial wiki setup with architecture diagrams and guides"

echo "Pushing to GitHub..."
git push

echo ""
echo "✅ Wiki setup complete!"
echo ""
echo "Next steps:"
echo "1. Visit https://github.com/ojdx-org/elmersho/wiki"
echo "2. Verify all pages are created"
echo "3. Upload any additional diagrams to the diagrams/ folder"
echo ""
echo "To update the wiki in the future:"
echo "  cd elmersho.wiki"
echo "  git pull"
echo "  # make changes"
echo "  git add ."
echo "  git commit -m 'your message'"
echo "  git push"