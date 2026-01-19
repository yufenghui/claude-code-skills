#!/bin/bash
# Build all plugins in the monorepo

set -e

echo "🔨 Building all plugins..."

for plugin in packages/*; do
  if [ -d "$plugin" ] && [ -f "$plugin/package.json" ]; then
    echo ""
    echo "📦 Building $(basename $plugin)..."
    cd "$plugin"
    npm run build
    cd - > /dev/null
  fi
done

echo ""
echo "✅ All plugins built successfully!"
