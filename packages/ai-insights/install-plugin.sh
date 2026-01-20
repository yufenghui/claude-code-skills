#!/bin/bash
# AI Insights 插件本地安装脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 AI Insights 插件安装脚本${NC}\n"

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 定义安装路径
PLUGIN_NAME="ai-insights"
INSTALL_DIR="$USERPROFILE/.claude/plugins/local/$PLUGIN_NAME"

# 创建安装目录
echo -e "${GREEN}创建安装目录...${NC}"
mkdir -p "$INSTALL_DIR"

# 复制插件文件
echo -e "${GREEN}复制插件文件...${NC}"
cp -r "$PROJECT_ROOT/packages/ai-insights/"* "$INSTALL_DIR/"

# 复制 plugin.json
echo -e "${GREEN}配置插件元数据...${NC}"
mkdir -p "$INSTALL_DIR/.claude-plugin"
cp "$PROJECT_ROOT/packages/ai-insights/.claude-plugin/plugin.json" "$INSTALL_DIR/.claude-plugin/"

echo -e "\n${GREEN}✅ 插件安装完成！${NC}\n"
echo "安装位置: $INSTALL_DIR"
echo "\n请在 Claude Code 中重新加载或重启"
echo "\n测试命令:"
echo "  /perf-status"
echo "  /perf-report"
