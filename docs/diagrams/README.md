# Diagrams Directory

This directory contains draw.io diagram files (.drawio) for the elmersho project.

## Current Diagrams

- **local-dev-architecture.drawio** - Shows the local development server setup with hot-reloading

## Direct Editing Workflow

1. **Edit Online**: Click any draw.io edit link to open the diagram directly
2. **Make Changes**: Edit the diagram in draw.io's web interface
3. **Save**: Changes are saved back to the file
4. **Pull Request**: Create a PR with your diagram changes

## Quick Commands

```bash
# Generate embed code for a diagram (default branch: dev)
npm run diagram embed docs/diagrams/local-dev-architecture.drawio

# Generate embed code for a specific branch
npm run diagram embed docs/diagrams/local-dev-architecture.drawio main

# Create catalog of all diagrams
npm run diagram catalog docs/diagrams

# Get diagram metadata
npm run diagram metadata docs/diagrams/local-dev-architecture.drawio
```

## Direct Edit Links

All diagrams can be edited directly through draw.io:

- [Edit local-dev-architecture.drawio](https://app.diagrams.net/#Hhttps://raw.githubusercontent.com/ojdx-org/elmersho/dev/docs/diagrams/local-dev-architecture.drawio)

## Branch-Specific Diagrams

Different branches can have different versions of diagrams:
- View/edit from `main` branch by using `/main/` in the URL
- View/edit from feature branches by using `/[branch-name]/` in the URL

## Benefits of Repository Storage

- **Direct Editing**: No need to download/upload files
- **Branch Support**: Different diagram versions per branch
- **Version Control**: Full Git history for all diagram changes
- **Pull Request Integration**: Review diagram changes like code

## See Also

- [Using draw.io Diagrams Guide](../using-drawio-diagrams.md)
- [Architecture Diagrams Wiki Page](https://github.com/ojdx-org/elmersho/wiki/Architecture-Diagrams)
- [Diagram Templates](../diagram-templates.md)