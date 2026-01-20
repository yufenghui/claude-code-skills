# 🚀 AI Insights 插件快速入门

## 作为 Claude Code 插件运行

### 方法 1：本地开发模式（最简单）

直接在项目中使用，无需安装：

```bash
# 从项目根目录
cd D:\project\claude-code-skills

# 生成性能报告
npx tsx packages/ai-insights/src/cli.ts --mode report

# 查看状态栏
npx tsx packages/ai-insights/src/cli.ts --mode statusline
```

### 方法 2：在 Claude Code 中使用命令

在 Claude Code 对话中直接输入：

```
/perf-report
```

或使用自然语言：

```
请显示性能报告
分析我的操作统计
查看当前会话效率
```

### 方法 3：全局安装（推荐）

```bash
# 进入插件目录
cd packages/ai-insights

# 全局链接
npm link

# 现在可以在任何地方使用
ai-insights --mode report
ai-insights --mode statusline
```

### 方法 4：安装到 Claude 插件目录

```bash
# Windows
xcopy /E /I packages\ai-insights %USERPROFILE%\.claude\plugins\ai-insights\

# Linux/Mac
cp -r packages/ai-insights ~/.claude/plugins/ai-insights/
```

---

## 🎯 可用命令

| 命令 | 功能 | 示例 |
|------|------|------|
| `/perf-report` | 生成详细性能报告 | `/perf-report` |
| `/perf-status` | 显示实时状态栏 | `/perf-status` |

---

## 📊 输出示例

### 性能报告

```markdown
# 📊 性能报告 - session-123

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

## ✅ 测试插件

```bash
# 运行所有测试
cd packages/ai-insights
npx tsx --test test/**/*.test.ts

# 测试 CLI
npm run cli -- --help
```

---

## 📚 详细文档

- **[CLAUDE_PLUGIN_GUIDE.md](../packages/ai-insights/CLAUDE_PLUGIN_GUIDE.md)** - 完整安装指南
- **[USAGE.md](../packages/ai-insights/USAGE.md)** - 使用说明
- **[测试验证报告](./test-validation-report.md)** - 测试结果
- **[项目完成总结](./project-completion-summary.md)** - 项目总结

---

## 🎉 开始使用

最简单的方式：

```bash
npx tsx packages/ai-insights/src/cli.ts --mode report
```

或在 Claude Code 中输入：

```
/perf-report
```

**就这么简单！** 🚀
