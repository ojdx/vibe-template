# Using draw.io Diagrams

This guide explains how to create and use draw.io diagrams in the elmersho project.

## Overview

We use draw.io (diagrams.net) to create architecture and flow diagrams. These diagrams are stored as XML files that can be:
- Edited directly in draw.io
- Embedded in documentation
- Version controlled
- Used by AI to understand system architecture

## Creating Diagrams

### Method 1: draw.io Web App (Direct Edit)
1. Click any "Edit in draw.io" link from our documentation
2. Make your changes in draw.io
3. Save the diagram (it saves back to the GitHub URL)
4. Create a pull request with your changes

### Method 2: draw.io Web App (New Diagram)
1. Go to [draw.io](https://app.diagrams.net/)
2. Create your diagram
3. Save as `.drawio` XML format
4. Add to `/docs/diagrams/` in the repository

### Method 3: Direct XML Creation
For simple diagrams, you can create the XML directly (as we did with `local-dev-architecture.drawio`)

## Storing Diagrams

Diagrams are stored in the main repository at `/docs/diagrams/`:
1. Create or edit `.drawio` files in the `/docs/diagrams/` directory
2. Commit and push to your feature branch
3. Create a pull request with your changes
4. Diagrams are automatically accessible via direct draw.io links

## Embedding in Documentation

### In Markdown files:
```markdown
[Edit in draw.io](https://app.diagrams.net/#Hojdx-org%2Felmersho%2Fdev%2Fdocs%2Fdiagrams%2Fyour-diagram.drawio)

[View on GitHub](https://github.com/ojdx-org/elmersho/blob/dev/docs/diagrams/your-diagram.drawio)
```

For different branches:
```markdown
[Edit in draw.io](https://app.diagrams.net/#Hojdx-org%2Felmersho%2Fmain%2Fdocs%2Fdiagrams%2Fyour-diagram.drawio)
```

### In README files:
Export the diagram as PNG from draw.io and reference it in your markdown.

## Example: Local Development Architecture

The `local-dev-architecture.drawio` diagram shows:
- Developer browser connecting to Node.js server
- Server (server.js) serving files from public-www/
- File structure and hot-reloading features

To view/edit: Open the `.drawio` file in draw.io

## Best Practices

1. **Naming**: Use descriptive names like `feature-authentication-flow.drawio`
2. **Versioning**: The XML format is Git-friendly for tracking changes
3. **Documentation**: Always include a description of what the diagram shows
4. **AI Context**: These diagrams help AI assistants understand the system architecture

## Using Diagrams with AI

When working with AI assistants:
1. Reference the diagram file in your request
2. The AI can read the XML structure to understand the architecture
3. Use diagrams to communicate new features or changes
4. AI can help generate new diagrams based on requirements

## Branch-Aware Diagram Links

The diagram utility (`npm run diagram`) automatically detects your current branch:

**On stable branches (main/dev):**
- Shows only the link for that branch

**On feature branches:**
- Shows the current branch link first
- Includes links to dev and main versions below
- Helps compare diagrams across branches

Example output on a feature branch:
```
### local-dev-architecture

**Current Branch (feature/new-feature):**
[Edit in draw.io](...) | [View on GitHub](...)

**Stable Versions:**
- Dev: [Edit](...) | [View](...)
- Main: [Edit](...) | [View](...)
```