# AI Insights 插件安装指南

## 🚀 快速安装

### Windows 用户

**方法 1：使用安装脚本（推荐）**

```powershell
# 在项目根目录执行
cd D:\project\claude-code-skills\packages\ai-insights
.\install-plugin.bat
```

**方法 2：手动安装**

```powershell
# 创建插件目录
mkdir %USERPROFILE%\.claude\plugins\local\ai-insights

# 复制插件文件
xcopy /E /I D:\project\claude-code-skills\packages\ai-insights\* %USERPROFILE%\.claude\plugins\local\ai-insights\
```

### Linux/Mac 用户

```bash
# 创建插件目录
mkdir -p ~/.claude/plugins/local/ai-insights

# 复制插件文件
cp -r packages/ai-insights/* ~/.claude/plugins/local/ai-insights/
```

## ✅ 验证安装

### 1. 检查文件结构

安装后应该有以下结构：

```
~/.claude/plugins/local/ai-insights/
├── .claude-plugin/
│   └── plugin.json          # 插件配置
├── skills/                   # 技能文件
│   ├── performance-monitor.md
│   ├── perf-report.md
│   └── perf-status.md
├── src/                      # 源代码
├── dist/                     # 编译输出
└── README.md
```

### 2. 验证 plugin.json

```bash
# Windows
type %USERPROFILE%\.claude\plugins\local\ai-insights\.claude-plugin\plugin.json

# Linux/Mac
cat ~/.claude/plugins/local/ai-insights/.claude-plugin/plugin.json
```

应该看到：

```json
{
  "name": "ai-insights",
  "description": "Claude Code 性能监控插件 - 提供操作耗时分析、失败率统计、效率评分和语义化洞察",
  "author": {
    "name": "AI Insights Team",
    "email": "noreply@example.com"
  }
}
```

### 3. 验证技能文件

```bash
# Windows
dir %USERPROFILE%\.claude\plugins\local\ai-insights\skills

# Linux/Mac
ls -la ~/.claude/plugins/local/ai-insights/skills
```

应该看到三个文件：
- `performance-monitor.md`
- `perf-report.md`
- `perf-status.md`

## 🔄 重新加载插件

安装完成后，需要重启 Claude Code 或重新加载插件：

### 方法 1：重启 Claude Code

完全关闭并重新启动 Claude Code

### 方法 2：使用插件管理命令（如果支持）

```
/reload-plugins
```

## 🧪 测试插件

在 Claude Code 中尝试以下命令：

```bash
# 显示性能状态
/perf-status

# 生成性能报告
/perf-report

# 使用自然语言
"显示我的性能状态"
"生成性能分析报告"
```

## ⚠️ 故障排除

### 问题 1: Unknown skill 错误

**原因：** 技能文件未正确安装或插件未重新加载

**解决方案：**
1. 检查插件目录：`ls ~/.claude/plugins/local/ai-insights/skills/`
2. 确认有三个 `.md` 文件
3. 重启 Claude Code

### 问题 2: 插件未找到

**原因：** 插件未安装到正确的目录

**解决方案：**
1. 确认路径：`%USERPROFILE%\.claude\plugins\local\ai-insights` (Windows)
2. 或：`~/.claude/plugins/local/ai-insights` (Linux/Mac)
3. 重新运行安装脚本

### 问题 3: 技能文件格式错误

**原因：** plugin.json 或技能文件格式不正确

**解决方案：**
1. 检查 `plugin.json` 是否只包含必需字段（name, description, author）
2. 确认技能文件有正确的 frontmatter：
   ```yaml
   ---
   name: perf-status
   description: 显示实时性能状态栏
   ---
   ```

### 问题 4: CLI 工具无法运行

**原因：** TypeScript 依赖未安装

**解决方案：**
```bash
cd packages/ai-insights
npm install
```

## 📝 插件位置说明

Claude Code 支持两种插件安装位置：

### 1. 本地开发目录（推荐用于开发）

```
~/.claude/plugins/local/ai-insights/
```

### 2. 插件缓存目录（用于 marketplace 插件）

```
~/.claude/plugins/cache/{marketplace}/{plugin-name}/{version}/
```

**注意：** 本地开发的插件应该安装在 `local/` 目录，而不是 `cache/` 目录。

## 🔄 更新插件

当插件代码更新后，重新运行安装脚本：

```bash
# Windows
cd D:\project\claude-code-skills\packages\ai-insights
.\install-plugin.bat

# Linux/Mac
cd /path/to/claude-code-skills/packages/ai-insights
bash install-plugin.sh
```

或手动复制：

```bash
# 重新复制文件
cp -r packages/ai-insights/* ~/.claude/plugins/local/ai-insights/
```

## 🗑️ 卸载插件

```bash
# Windows
rmdir /s %USERPROFILE%\.claude\plugins\local\ai-insights

# Linux/Mac
rm -rf ~/.claude/plugins/local/ai-insights
```

## 📚 更多信息

- [使用指南](./USAGE.md)
- [项目 README](./README.md)
- [开发指南](./CLAUDE_PLUGIN_GUIDE.md)
