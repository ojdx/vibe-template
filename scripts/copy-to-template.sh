#!/bin/bash

# Script to copy the current project structure to the vibe-template repository
# This script prepares the template for distribution

set -e

TEMPLATE_REPO_URL="https://github.com/ojdx/vibe-template"
TEMP_DIR="/tmp/vibe-template-$(date +%s)"

echo "🚀 Copying project to vibe-template repository..."

# Clone the template repository
echo "📥 Cloning template repository..."
git clone "$TEMPLATE_REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

# Remove existing content (except .git)
echo "🧹 Cleaning existing template content..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} \;

# Copy project structure from source
echo "📋 Copying project structure..."
SOURCE_DIR="/Users/jeremywilliams/Projects/elmersho"

# Copy main files and directories
cp "$SOURCE_DIR/project.config.js" .
cp "$SOURCE_DIR/package.json" .
cp "$SOURCE_DIR/.gitignore" .
cp "$SOURCE_DIR/.c8rc.json" .
cp "$SOURCE_DIR/cdk.json" .

# Copy README template (rename to README.md)
cp "$SOURCE_DIR/TEMPLATE-README.md" README.md

# Copy initialization script
cp "$SOURCE_DIR/init-template.sh" .

# Copy scripts
cp -r "$SOURCE_DIR/scripts" .

# Copy infrastructure
cp -r "$SOURCE_DIR/infrastructure" .

# Copy public directory structure
mkdir -p public-www
cp "$SOURCE_DIR/public-www/index.html" public-www/
cp "$SOURCE_DIR/public-www/error.html" public-www/

# Copy GitHub workflows (template versions)
mkdir -p .github/workflows
cp "$SOURCE_DIR/.github/workflows"/*.template .github/workflows/

# Rename template files to actual workflow files
for template_file in .github/workflows/*.template; do
    if [ -f "$template_file" ]; then
        base_name=$(basename "$template_file" .template)
        mv "$template_file" ".github/workflows/$base_name"
    fi
done

# Copy test structure
mkdir -p test
cp "$SOURCE_DIR/test"/*.test.js test/ 2>/dev/null || echo "No test files to copy"

# Copy documentation
if [ -d "$SOURCE_DIR/docs" ]; then
    cp -r "$SOURCE_DIR/docs" .
fi

# Run the template initialization script (but comment out .git removal)
if [ -f "./init-template.sh" ]; then
    echo "🔧 Running template initialization (modified)..."
    chmod +x ./init-template.sh
    # Create a modified version that doesn't remove .git
    sed 's/rm -rf \.git/#rm -rf .git/' ./init-template.sh > ./init-template-nogit.sh
    chmod +x ./init-template-nogit.sh
    ./init-template-nogit.sh
    rm -f ./init-template-nogit.sh
else
    echo "⚠️  No init-template.sh found, skipping initialization"
fi

echo "✅ Template copied successfully!"
echo "📁 Template location: $TEMP_DIR"
echo ""
echo "📝 Next steps:"
echo "1. Review the changes: cd $TEMP_DIR"
echo "2. Test the template setup: node scripts/setup-template.js"
echo "3. Commit and push: git add . && git commit -m 'Update template' && git push"
echo ""
echo "🔗 Template repository: $TEMPLATE_REPO_URL"