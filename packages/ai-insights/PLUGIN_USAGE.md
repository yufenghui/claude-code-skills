# AI Insights 插件使用指南

## 🚀 如何使用插件

### 方法 1：使用 --plugin-dir 参数（推荐用于开发）

这是最简单的方法，无需安装插件即可测试：

```bash
# Windows
cd D:\project\claude-code-skills
.\test-plugin.bat

# 或手动运行
claude --plugin-dir "D:\project\claude-code-skills\packages\ai-insights"
```

### 方法 2：使用项目内 .claude 目录（standalone）

在项目根目录创建 `.claude` 目录结构：

```bash
cd D:\project\claude-code-skills
mkdir -p .claude/commands
mkdir -p .claude/skills/performance-monitor
```

然后复制文件：

```bash
# 复制 commands
cp packages/ai-insights/commands/*.md .claude/commands/

# 复制 skills
cp packages/ai-insights/skills/performance-monitor/SKILL.md .claude/skills/performance-monitor/
```

这样就可以直接使用：
- `/perf-status`
- `/perf-report`

### 方法 3：安装到插件目录（需要重启）

需要创建 marketplace 并注册插件，比较复杂。

**推荐使用方法 1 或方法 2。**

## 🧪 测试插件

启动 Claude Code 后，尝试：

```bash
# 显示性能状态
/perf-status

# 生成性能报告
/perf-report

# 如果使用方法1（plugin-dir），命令可能是：
/ai-insights:perf-status
/ai-insights:perf-report
```

## 📝 插件结构

```
packages/ai-insights/
├── .claude-plugin/
│   └── plugin.json              # 插件元数据
├── commands/                     # Slash 命令
│   ├── perf-status.md
│   └── perf-report.md
├── skills/                       # AI 技能
│   └── performance-monitor/
│       └── SKILL.md
└── src/                          # TypeScript 源代码
```

## 🔧 开发流程

1. 修改代码或命令文件
2. 重启 Claude Code（如果使用 --plugin-dir）
3. 测试命令

## ⚠️ 当前限制

**重要说明：** 由于 Claude Code 的 `history.jsonl` 日志格式限制，
当前插件无法从实际日志中提取工具调用数据。

### 现状

- `history.jsonl` 仅记录用户消息（文本输入）
- **不包含**工具调用信息（工具名、参数、执行时间、结果等）
- 插件的解析器、分析器等核心功能已实现，但缺少数据源

### 演示模式

要查看报告功能，可以运行演示脚本：

```bash
cd packages/ai-insights
node demo-report.mjs
```

这将使用模拟数据生成一份完整的性能报告，展示：
- 会话统计（总操作数、成功率、平均耗时）
- 慢操作 TOP5
- 失败操作分析
- 效率评分

### 未来解决方案

要实现完整的性能监控，需要以下任一方案：

1. **Claude Code 原生支持**
   - 在 `history.jsonl` 中记录工具调用详情
   - 或提供单独的 `operations.jsonl` 日志文件

2. **插件 Hook 机制**
   - Claude Code 提供插件 hook，在工具调用前后触发
   - 插件可以捕获和记录操作数据

3. **Agent 事件监听**
   - 在 Agent 层面添加事件发射器
   - 插件监听 `tool-start`、`tool-end` 等事件

### 当前可用功能

虽然无法从日志提取数据，但插件框架已完全实现：
- ✅ `TranscriptParser` - 解析器（等待数据源）
- ✅ `MetricsAnalyzer` - 指标分析器
- ✅ `JSONStorage` - 数据存储
- ✅ `ReportRenderer` - 报告生成器
- ✅ `performance-monitor` 技能 - 监控逻辑

一旦数据源问题解决，插件即可立即投入使用。

## 📚 更多信息

- [Claude Code 插件文档](https://code.claude.com/docs/en/plugins)
- [Agent Skills 文档](https://code.claude.com/docs/en/skills)
