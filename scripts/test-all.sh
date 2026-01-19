#!/bin/bash
# Test all plugins in the monorepo

set -e

echo "🧪 Testing all plugins..."

for plugin in packages/*; do
  if [ -d "$plugin" ] && [ -f "$plugin/package.json" ]; then
    echo ""
    echo "📦 Testing $(basename $plugin)..."
    cd "$plugin"
    npm test
    cd - > /dev/null
  fi
done

echo ""
echo "✅ All plugins tested successfully!"
