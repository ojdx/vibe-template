# GitHub Wiki Setup Guide

This guide walks through setting up the GitHub wiki for project documentation. Note that diagrams are now stored in the main repository, not the wiki.

## Initial Wiki Setup

1. **Enable the Wiki** (if not already enabled):
   - Go to https://github.com/ojdx-org/elmersho
   - Click on "Settings" tab
   - Scroll to "Features" section
   - Check "Wikis" if not already enabled

2. **Initialize the Wiki**:
   - Go to https://github.com/ojdx-org/elmersho/wiki
   - Click "Create the first page" button
   - Create a "Home" page with basic content

## Diagram Storage Update

**Important**: Diagrams are now stored in the main repository at `/docs/diagrams/` to enable:
- Direct draw.io editing via GitHub URLs
- Branch-specific diagram versions
- Better integration with pull requests

The Architecture-Diagrams wiki page now serves as an index pointing to the main repository diagrams.

## Workflow for New Diagrams

1. **Create Diagram**:
   - Use draw.io web app or create XML directly
   - Save as `.drawio` format

2. **Add to Repository**:
   ```bash
   cd elmersho
   cp /path/to/new-diagram.drawio docs/diagrams/
   git add docs/diagrams/new-diagram.drawio
   git commit -m "Add new-diagram architecture diagram"
   git push
   ```

3. **Update Documentation**:
   - Add edit link to Architecture-Diagrams wiki page
   - Update docs/diagrams/README.md with the new diagram
   - Include description and purpose

## Linking Diagrams in Documentation

In documentation, use direct edit links:

```markdown
## Architecture

[Edit Diagram](https://app.diagrams.net/#Hhttps://raw.githubusercontent.com/ojdx-org/elmersho/dev/docs/diagrams/architecture.drawio)

See all [Architecture Diagrams](https://github.com/ojdx-org/elmersho/wiki/Architecture-Diagrams) 
in the project wiki.
```

## Benefits of Repository Storage

1. **Direct Editing**: Click to edit diagrams directly in draw.io
2. **Branch Support**: Different diagram versions per branch
3. **PR Integration**: Review diagram changes alongside code
4. **Version Control**: Full Git history with code changes
5. **No Download Required**: Edit directly through GitHub URLs

## draw.io Integration URLs

Format for direct editing links:
```
https://app.diagrams.net/#Hhttps://raw.githubusercontent.com/ojdx-org/elmersho/[branch]/docs/diagrams/[diagram-name].drawio
```

This allows users to:
- Click the link
- Edit the diagram directly in draw.io
- Save changes back to GitHub
- Create a pull request with updates

## Wiki Usage

The wiki is now primarily used for:
- Project documentation that doesn't belong in the codebase
- Guides and tutorials
- Architecture overview with links to repository diagrams