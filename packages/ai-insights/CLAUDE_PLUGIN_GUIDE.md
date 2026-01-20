# AI Insights - Claude Code 插件安装指南

本指南将帮助您将 AI Insights 安装为 Claude Code 插件。

---

## 📦 安装方式

### 方式 1：本地开发模式（推荐用于测试）

在项目根目录直接使用：

```bash
# 生成性能报告
npx tsx packages/ai-insights/src/cli.ts --mode report

# 查看状态栏
npx tsx packages/ai-insights/src/cli.ts --mode statusline
```

### 方式 2：全局安装

安装到系统全局目录：

```bash
# 进入插件目录
cd packages/ai-insights

# 全局链接
npm link

# 使用
ai-insights --mode report
```

### 方式 3：Claude Code 插件目录

复制到 Claude Code 插件目录：

```bash
# Windows
%USERPROFILE%\.claude\plugins\ai-insights\

# Linux/Mac
~/.claude/plugins/ai-insights/

# 复制插件文件
cp -r packages/ai-insights ~/.claude/plugins/
```

---

## 🚀 快速开始

### 1. 测试插件功能

```bash
# 进入项目根目录
cd D:\project\claude-code-skills

# 运行测试
cd packages/ai-insights
npx tsx --test test/**/*.test.ts

# 生成报告
npx tsx src/cli.ts --mode report
```

### 2. 在 Claude Code 中使用

在 Claude Code 对话中输入：

```
/perf-report
```

或使用自然语言：

```
请生成性能报告
显示我的操作统计
分析当前会话效率
```

---

## 📝 可用命令

### `/perf-report` - 性能报告

生成详细的性能分析报告，包括：

- ✅ 会话概览（时间、时长、操作数）
- ✅ 效率指标（成功率、平均耗时、效率评分）
- ✅ 慢操作 TOP5
- ✅ 失败分析
- ✅ 模块耗时分布

**使用：**
```
/perf-report
```

### `/perf-status` - 实时状态

显示当前会话的关键指标：

```
127 ops │ 94.5% 成功 │ 1.8s
```

**使用：**
```
/perf-status
```

---

## 🔧 配置选项

### 监控配置

插件会自动监控 `~/.claude/history.jsonl` 文件。

自定义路径：

```bash
ai-insights --history /path/to/history.jsonl --mode report
```

### 数据目录

默认数据目录：`~/.claude/ai-insights/`

自定义目录：

```bash
ai-insights --data-dir /custom/path --mode report
```

---

## 📊 输出示例

### 性能报告

```markdown
# 📊 性能报告 - session-1234567890

## 会话信息

- **日期：** 2026-01-20
- **时长：** 45 分钟
- **总操作数：** 127

## 效率指标

- **成功率：** 94.5%
- **平均耗时：** 1.8s
- **最大耗时：** 45.2s
- **失败操作：** 3

## 统计数据

```
总计：        127
已完成：      124
失败：        3
平均耗时：    1800ms
最大耗时：    45200ms
```

---
*由 AI Insights 生成*
```

### 状态栏

```
127 ops │ 94.5% 成功 │ 1.8s
```

---

## 🎯 使用场景

### 场景 1：代码审查后

```
我刚才完成了代码审查，请生成性能报告
```

### 场景 2：功能开发完成后

```
分析我开发用户认证功能时的性能表现
```

### 场景 3：遇到性能问题时

```
我的操作很慢，帮我找出慢操作
```

### 场景 4：定期检查

```
显示当前会话的性能状态
```

---

## ⚙️ 技术细节

### 插件结构

```
ai-insights/
├── .claude-plugin/
│   └── plugin.json          # 插件配置
├── commands/
│   ├── report.md            # /perf-report 命令
│   └── status.md            # /perf-status 命令
├── skills/
│   └── performance-monitor.md
├── src/
│   ├── cli.ts               # CLI 入口
│   ├── parser/              # 历史解析器
│   ├── analyzer/            # 指标分析器
│   ├── storage/             # 数据存储
│   ├── renderer/            # 渲染器
│   └── monitor/             # 监控服务
└── package.json
```

### 依赖关系

```
history.jsonl (Claude 日志)
    ↓
TranscriptParser (解析器)
    ↓
MetricsAnalyzer (分析器)
    ↓
JSONStorage (存储)
    ↓
StatusLineRenderer / ReportRenderer (渲染器)
    ↓
CLI 输出
```

---

## 🐛 故障排除

### 问题：命令未找到

```bash
# 确认安装路径
which ai-insights

# 使用完整路径
npx tsx /path/to/ai-insights/src/cli.ts --mode report
```

### 问题：没有历史数据

```bash
# 检查 Claude 日志文件
ls -la ~/.claude/history.jsonl

# 手动指定路径
ai-insights --history ~/.claude/history.jsonl --mode report
```

### 问题：权限错误

```bash
# Linux/Mac
chmod +x ~/.claude/plugins/ai-insights/dist/cli.js

# Windows
# 以管理员身份运行终端
```

---

## 📚 更多信息

- [USAGE.md](./USAGE.md) - 详细使用指南
- [测试验证报告](../../docs/test-validation-report.md) - 测试结果
- [项目完成总结](../../docs/project-completion-summary.md) - 项目总结

---

## 🎉 开始使用

现在就可以在 Claude Code 中使用 AI Insights 插件了！

```bash
# 生成第一份报告
npx tsx packages/ai-insights/src/cli.ts --mode report
```

或在 Claude Code 中输入：

```
/perf-report
```

**祝您使用愉快！** 🚀
